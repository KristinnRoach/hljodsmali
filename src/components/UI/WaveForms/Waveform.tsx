'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Time_settings } from '../../../types/samples';
import { useSamplerEngine } from '../../../contexts/EngineContext';

type settingKey = 'startPoint' | 'endPoint' | 'loopStart' | 'loopEnd';

interface WaveformProps {
  sampleId: string;
  buffer: AudioBuffer | null;
  className?: string;
  color?: string;
  backgroundColor?: string;
  showCenterLine?: boolean;
}

const PADDING_FACTOR = 1.1; // 10% extra space

function calculateWidth(
  bufferDuration: number,
  baseWidth: number = 400,
  pixelsPerSecond: number = 100
): number {
  const calculatedWidth = Math.max(
    baseWidth,
    Math.ceil(bufferDuration * pixelsPerSecond)
  );
  return calculatedWidth;
}

const Waveform: React.FC<WaveformProps> = ({
  sampleId,
  buffer,
  className = '',
  color = '#3498db',
  backgroundColor = 'transparent',
  showCenterLine = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelRatioRef = useRef(window.devicePixelRatio || 1);
  const MIN_MARKER_DISTANCE = 0.0008;

  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(100);
  const [mouseStyle, setMouseStyle] = useState('default');

  const { updateTimeSettings, getSampleSettings } = useSamplerEngine();

  const [startPoint, setStartPoint] = useState(0);
  const [endPoint, setEndPoint] = useState(1);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(1);

  //  Triggered when sampleId or buffer changes
  useEffect(() => {
    const settings = getSampleSettings(sampleId, 'Time') as Time_settings;

    if (settings && buffer) {
      // Normalize by dividing by buffer duration
      setStartPoint(settings.startPoint / buffer.duration);
      setEndPoint(settings.endPoint / buffer.duration);
      setLoopStart(settings.loopStart / buffer.duration);
      setLoopEnd(settings.loopEnd / buffer.duration);
    }
  }, [sampleId, getSampleSettings, buffer]);

  const [dragState, setDragState] = useState<{
    type: 'marker' | 'label' | null;
    key: settingKey | null;
    offset: number;
    initialPosition: number;
  }>({ type: null, key: null, offset: 0, initialPosition: 0 });

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

  const getMarkerPixelPosition = useCallback(
    (markerValue: number) => {
      // Ensure markerValue is within [0, 1] range
      const clampedValue = Math.max(
        0,
        Math.min(1, markerValue / (buffer?.duration || 1))
      );
      // Account for potential padding or borders
      const drawableWidth = width / PADDING_FACTOR; // - 2; // Subtract 2 for left and right 1px borders
      return Math.round(clampedValue * drawableWidth) + 1; // Add 1 to account for left border
    },
    [width, buffer]
  );

  const drawMarker = useCallback(
    (markerValue: number, markerColor: string, label: string) => {
      if (!buffer) return; // No sample available

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

  const drawWaveform = useCallback(
    (
      startPoint: number,
      endPoint: number,
      loopStart: number,
      loopEnd: number
    ) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!(canvas && ctx && buffer)) return;

      const pxr = pixelRatioRef.current;
      canvas.width = width * pxr;
      canvas.height = height * pxr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(pxr, pxr);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const data = buffer.getChannelData(0);
      const samplesPerPixel = Math.ceil(data.length / width);

      //   const data = normalizeData(buffer.getChannelData(0));
      //   const step = Math.ceil(data.length / (width / PADDING_FACTOR));
      //   const amp = height / 2;

      ctx.beginPath();
      //   ctx.moveTo(0, amp);
      ctx.moveTo(0, height / 2);

      // const zoomedWidth = width * zoomValue;
      // const zoomOffset = loopStart ? loopStart * width * (1 - zoomValue) : 0;

      //   for (let i = 0; i < width; i++) {
      //     let min = 1.0;
      //     let max = -1.0;

      //     // const dataIndex = Math.floor((i + zoomOffset) / zoomValue);
      //     const dataIndex = i;
      //     for (let j = 0; j < step; j++) {
      //       const datum = data[dataIndex * step + j];
      //       if (datum < min) min = datum;
      //       if (datum > max) max = datum;
      //     }

      //     ctx.lineTo(i, (1 + min) * amp);
      //     ctx.lineTo(i, (1 + max) * amp);
      //   }

      //   ctx.strokeStyle = color;
      //   ctx.stroke();

      for (let x = 0; x < width; x++) {
        let min = 1.0;
        let max = -1.0;
        const startSample = x * samplesPerPixel;
        const endSample = Math.min((x + 1) * samplesPerPixel, data.length);

        for (let i = startSample; i < endSample; i++) {
          const sample = data[i];
          if (sample < min) min = sample;
          if (sample > max) max = sample;
        }

        const y1 = ((1 + min) / 2) * height;
        const y2 = ((1 + max) / 2) * height;

        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
      }

      ctx.strokeStyle = color;
      ctx.stroke();

      if (showCenterLine) {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.stroke();
      }

      if (startPoint !== undefined) drawMarker(startPoint, 'red', 'Start');
      if (endPoint !== undefined) drawMarker(endPoint, 'red', 'End');
      if (loopStart !== undefined) drawMarker(loopStart, 'green', 'Loop-Start');
      if (loopEnd !== undefined) drawMarker(loopEnd, 'green', 'Loop-End');
    },
    [
      width,
      height,
      color,
      buffer,
      drawMarker,

      backgroundColor,
      showCenterLine,
      normalizeData,
    ]
  );

  const drawWaveformWithoutMarkers = useCallback(() => {
    if (!buffer) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!(canvas && ctx)) return;

    const pxr = pixelRatioRef.current;
    canvas.width = width * pxr;
    canvas.height = height * pxr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(pxr, pxr);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const data = buffer.getChannelData(0);
    const samplesPerPixel = Math.ceil(data.length / width);

    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let x = 0; x < width; x++) {
      let min = 1.0;
      let max = -1.0;
      const startSample = x * samplesPerPixel;
      const endSample = Math.min((x + 1) * samplesPerPixel, data.length);

      for (let i = startSample; i < endSample; i++) {
        const sample = data[i];
        if (sample < min) min = sample;
        if (sample > max) max = sample;
      }

      const y1 = ((1 + min) / 2) * height;
      const y2 = ((1 + max) / 2) * height;

      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
    }

    ctx.strokeStyle = color;
    ctx.stroke();

    if (showCenterLine) {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.stroke();
    }
  }, [width, height, color, buffer, backgroundColor, showCenterLine]);

  const getMarkerAtPosition = useCallback(
    (
      x: number,
      y: number
    ): {
      type: 'marker' | 'label';
      key: settingKey;
    } | null => {
      if (!buffer) return null;

      const markers = [
        { key: 'startPoint' as settingKey, value: startPoint, label: 'Start' },
        { key: 'endPoint' as settingKey, value: endPoint, label: 'End' },
        {
          key: 'loopStart' as settingKey,
          value: loopStart,
          label: 'Loop-Start',
        },
        { key: 'loopEnd' as settingKey, value: loopEnd, label: 'Loop-End' },
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
    [startPoint, endPoint, loopStart, loopEnd, buffer, getMarkerPixelPosition]
  );

  const getMarkerValue = (key: string): number => {
    if (!buffer) throw new Error('No settings');

    switch (key) {
      case 'startPoint':
        return startPoint;
      case 'endPoint':
        return endPoint;
      case 'loopStart':
        return loopStart;
      case 'loopEnd':
        return loopEnd;
      default:
        return 0;
    }
  };

  const handleDrag = useCallback(
    (x: number, dragType: 'marker' | 'label') => {
      if (!(dragState.key && sampleId && buffer)) return;

      let newValue = Math.max(0, Math.min(1, x / width));

      // Apply constraints
      switch (dragState.key) {
        case 'startPoint':
          newValue = Math.min(newValue, endPoint - MIN_MARKER_DISTANCE);
          break;
        case 'endPoint':
          newValue = Math.max(newValue, startPoint + MIN_MARKER_DISTANCE);
          break;
        case 'loopStart':
          newValue = Math.min(newValue, loopEnd - MIN_MARKER_DISTANCE);
          break;
        case 'loopEnd':
          newValue = Math.max(newValue, loopStart + MIN_MARKER_DISTANCE);
          break;
      }

      //   const currentValue = getMarkerValue(dragState.key);
      //   const currentNormalizedValue = currentValue / buffer.duration;

      //   const currentPosition = getMarkerPixelPosition(
      //     currentValue / buffer.duration
      //   );

      //   if (dragType === 'label') {
      //     newValue_normalized = Math.max(
      //       0,
      //       Math.min(1, (x - dragState.offset) / width)
      //     );
      //   } else {
      //     newValue_normalized = Math.max(0, Math.min(1, x / width));
      //   }

      //   const newValue = newValue_normalized * buffer.duration;

      // Update actual value
      updateTimeSettings(sampleId, {
        [dragState.key]: newValue,
      });

      // Update react state
      switch (dragState.key) {
        case 'startPoint':
          setStartPoint(newValue);
          break;
        case 'endPoint':
          setEndPoint(newValue);
          break;
        case 'loopStart':
          setLoopStart(newValue);
          break;
        case 'loopEnd':
          setLoopEnd(newValue);
          break;
      }
    },
    [
      dragState,
      width,
      sampleId,
      buffer,
      startPoint,
      endPoint,
      loopStart,
      loopEnd,
    ]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      // e.stopPropagation();

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
          initialPosition: x,
        });
      }
    },
    [getMarkerAtPosition, width, getMarkerPixelPosition, getMarkerValue]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * width;
      const y = e.clientY - rect.top;

      getMarkerAtPosition(x, y);

      if (!dragState.type) return;

      // e.preventDefault();
      // e.stopPropagation();

      setMouseStyle('grabbing');

      handleDrag(x, dragState.type);
    },
    [dragState, handleDrag, width, getMarkerAtPosition]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      // e.stopPropagation();

      setDragState({ type: null, key: null, offset: 0, initialPosition: 0 });
      setMouseStyle('default');
    },
    []
  );

  // useEffect(() => {
  //   if (buffer) {
  //     drawWaveform(
  //       startPoint ?? 0,
  //       endPoint ?? 0.95,
  //       loopStart ?? 0,
  //       loopEnd ?? 0.9
  //     );
  //   }
  // }, [drawWaveform, buffer, startPoint, endPoint, loopStart, loopEnd]);

  useEffect(() => {
    if (!buffer) return;
    drawWaveformWithoutMarkers();
  }, [drawWaveformWithoutMarkers, buffer]);

  return (
    <canvas
      className={className}
      ref={canvasRef}
      width={width}
      height={height}
      // onMouseDown={handleMouseDown}
      // onMouseMove={handleMouseMove}
      // onMouseUp={handleMouseUp}
      // onMouseLeave={handleMouseUp}
      // style={{ cursor: mouseStyle }}
    />
  );
};

export default Waveform;
