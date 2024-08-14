import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Sample_settings } from '../../../types/samples';
import { useSampleSettings } from '../../../hooks/useSampleSettings';
// import { useZoom } from '../../../hooks/useZoom';

interface WaveformProps {
  buffer: AudioBuffer;
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  showCenterLine?: boolean;
  loopStart?: number;
  loopEnd?: number;
  startPoint?: number;
  endPoint?: number;
}

const Waveform: React.FC<WaveformProps> = ({
  buffer,
  width,
  height,
  color = '#3498db',
  backgroundColor = 'transparent',
  showCenterLine = true,
  loopStart,
  loopEnd,
  startPoint,
  endPoint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelRatioRef = useRef(window.devicePixelRatio || 1);
  const MIN_MARKER_DISTANCE = 0.0008;

  const { handleSettingChange } = useSampleSettings();
  // const { zoomValue, setZoom } = useZoom({ minZoom: 1, maxZoom: 10 });

  const [dragState, setDragState] = useState<{
    type: 'marker' | 'label' | null;
    key: string | null;
    offset: number;
  }>({ type: null, key: null, offset: 0 });

  const [mouseStyle, setMouseStyle] = useState('default');

  const normalizeData = useCallback((data: Float32Array): Float32Array => {
    let maxVal = 0;
    for (let i = 0; i < data.length; i++) {
      const absVal = Math.abs(data[i]);
      if (absVal > maxVal) {
        maxVal = absVal;
      }
    }

    if (maxVal === 0) return data;

    const normalizedData = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      normalizedData[i] = data[i] / maxVal;
    }

    return normalizedData;
  }, []);

  // const calculateZoom = useCallback(() => {
  //   if (loopStart === undefined || loopEnd === undefined) return;

  //   const loopDuration = loopEnd - loopStart;
  //   const fullDuration = buffer.duration;
  //   const minZoom = width / (fullDuration * 200); // 200 pixels per second
  //   const minZoomDuration = 0.015; // TODO: test for optimal value

  //   if (loopDuration < minZoomDuration) {
  //     const newZoom = Math.min(minZoomDuration / loopDuration, 10);
  //     setZoom(Math.max(newZoom, minZoom));
  //   } else if (loopDuration < fullDuration) {
  //     const newZoom = Math.min(fullDuration / loopDuration, 10);
  //     setZoom(Math.max(newZoom, minZoom));
  //   } else {
  //     setZoom(minZoom);
  //   }
  // }, [loopStart, loopEnd, buffer, width, setZoom]);

  // const getMarkerPixelPosition = useCallback(
  //   (markerValue: number) => {
  //     // const zoomOffset = loopStart ? loopStart * width * (1 - zoomValue) : 0;
  //     // return (markerValue * width - zoomOffset) * zoomValue;
  //     return markerValue * width;
  //   },
  //   [width /*, zoomValue, loopStart*/]
  // );

  const getMarkerPixelPosition = useCallback(
    (markerValue: number) => {
      // Ensure markerValue is within [0, 1] range
      const clampedValue = Math.max(0, Math.min(1, markerValue));
      // Account for potential padding or borders
      const drawableWidth = width - 2; // Subtract 2 for left and right 1px borders
      return Math.round(clampedValue * drawableWidth) + 1; // Add 1 to account for left border
    },
    [width]
  );

  const drawMarker = useCallback(
    (markerValue: number, markerColor: string, label: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const markerWidth = 2;
      const labelPadding = 5;
      const labelHeight = 20;
      const labelWidth = ctx.measureText(label).width + labelPadding * 2;

      const pixelX = Math.min(
        width - 1,
        Math.max(0, getMarkerPixelPosition(markerValue))
      );
      ctx.fillStyle = markerColor;
      ctx.fillRect(pixelX - markerWidth / 2, 0, markerWidth, height);

      ctx.fillStyle = 'transparent';
      ctx.fillRect(pixelX + labelPadding, 0, labelWidth, labelHeight);

      ctx.font = '12px Arial';
      ctx.fillStyle = markerColor;
      ctx.fillText(label, pixelX + labelPadding, 15);
    },
    [height, getMarkerPixelPosition, width]
  );

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pxr = pixelRatioRef.current;
    canvas.width = width * pxr;
    canvas.height = height * pxr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(pxr, pxr);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const data = normalizeData(buffer.getChannelData(0));
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.beginPath();
    ctx.moveTo(0, amp);

    // const zoomedWidth = width * zoomValue;
    // const zoomOffset = loopStart ? loopStart * width * (1 - zoomValue) : 0;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      // const dataIndex = Math.floor((i + zoomOffset) / zoomValue);
      const dataIndex = i;
      for (let j = 0; j < step; j++) {
        const datum = data[dataIndex * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      ctx.lineTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.strokeStyle = color;
    ctx.stroke();

    if (showCenterLine) {
      ctx.beginPath();
      ctx.moveTo(0, amp);
      ctx.lineTo(width, amp);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.stroke();
    }

    if (startPoint !== undefined) drawMarker(startPoint, 'red', 'Start');
    if (endPoint !== undefined) drawMarker(endPoint, 'red', 'End');
    if (loopStart !== undefined) drawMarker(loopStart, 'green', 'Loop-Start');
    if (loopEnd !== undefined) drawMarker(loopEnd, 'green', 'Loop-End');
  }, [
    buffer,
    width,
    height,
    color,
    backgroundColor,
    showCenterLine,
    loopStart,
    loopEnd,
    startPoint,
    endPoint,
    normalizeData,
    // zoomValue,
    drawMarker,
  ]);

  const getMarkerAtPosition = useCallback(
    (
      x: number,
      y: number
    ): { type: 'marker' | 'label'; key: string } | null => {
      const markers = [
        { key: 'startPoint', value: startPoint, label: 'Start' },
        { key: 'endPoint', value: endPoint, label: 'End' },
        { key: 'loopStart', value: loopStart, label: 'Loop-Start' },
        { key: 'loopEnd', value: loopEnd, label: 'Loop-End' },
      ];

      const ctx = canvasRef.current!.getContext('2d')!;
      ctx.font = '12px Arial';

      for (const marker of markers) {
        if (marker.value !== undefined) {
          const pixelX = getMarkerPixelPosition(marker.value);
          const labelWidth = ctx.measureText(marker.label).width + 10;
          const labelHeight = 20;

          if (
            x >= pixelX + 5 &&
            x <= pixelX + 5 + labelWidth &&
            y >= 0 &&
            y <= labelHeight
          ) {
            setMouseStyle('pointer');
            return { type: 'label', key: marker.key };
          }

          if (Math.abs(x - pixelX) < 5) {
            setMouseStyle('cursor');
            return { type: 'marker', key: marker.key };
          }
        }
      }
      setMouseStyle('default');
      return null;
    },
    [startPoint, endPoint, loopStart, loopEnd, getMarkerPixelPosition]
  );

  const getMarkerValue = (key: string): number => {
    switch (key) {
      case 'startPoint':
        return startPoint || 0;
      case 'endPoint':
        return endPoint || 1;
      case 'loopStart':
        return loopStart || 0;
      case 'loopEnd':
        return loopEnd || 1;
      default:
        return 0;
    }
  };

  const handleDrag = useCallback(
    (x: number, dragType: 'marker' | 'label') => {
      if (!dragState.key) return;

      let newValue;
      if (dragType === 'label') {
        newValue = Math.max(0, Math.min(1, (x - dragState.offset) / width));
      } else {
        newValue = Math.max(0, Math.min(1, x / width));
      }

      switch (dragState.key) {
        case 'startPoint':
          newValue = Math.min(newValue, (endPoint || 1) - MIN_MARKER_DISTANCE);
          break;
        case 'loopStart':
          newValue = Math.min(newValue, (loopEnd || 1) - MIN_MARKER_DISTANCE);
          break;
        case 'loopEnd':
          newValue = Math.max(newValue, (loopStart || 0) + MIN_MARKER_DISTANCE);
          break;
        case 'endPoint':
          newValue = Math.max(
            newValue,
            (startPoint || 0) + MIN_MARKER_DISTANCE
          );
          break;
      }

      handleSettingChange(dragState.key as keyof Sample_settings, newValue);
    },
    [
      dragState,
      handleSettingChange,
      width,
      endPoint,
      loopEnd,
      loopStart,
      startPoint,
    ]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = canvasRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * width;
      const y = e.clientY - rect.top;

      const hitResult = getMarkerAtPosition(x, y);
      if (hitResult) {
        const markerValue = getMarkerValue(hitResult.key);
        const markerX = getMarkerPixelPosition(markerValue);
        const offset = hitResult.type === 'label' ? x - markerX : 0;

        setDragState({
          type: hitResult.type,
          key: hitResult.key,
          offset: offset,
        });
      }
    },
    [getMarkerAtPosition, width, getMarkerPixelPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * width;
      const y = e.clientY - rect.top;

      getMarkerAtPosition(x, y);

      if (!dragState.type) return;

      e.preventDefault();
      e.stopPropagation();

      setMouseStyle('grabbing');

      handleDrag(x, dragState.type);
    },
    [dragState, handleDrag, width, getMarkerAtPosition]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setDragState({ type: null, key: null, offset: 0 });
      setMouseStyle('default');
    },
    []
  );

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // useEffect(() => {
  //   if (buffer && width > 0) {
  //     calculateZoom();
  //   }
  // }, [loopStart, loopEnd, buffer, width, calculateZoom]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: mouseStyle }}
    />
  );
};

export default Waveform;
