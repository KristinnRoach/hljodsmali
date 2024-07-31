import React, { useRef, useEffect, useCallback, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import { Sample_settings } from '../../../types/sample';
import { useSampleSettings } from '../../../hooks/useSampleSettings';
import { set } from 'react-hook-form';

interface WaveDynamicProps {
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

const WaveDynamic: React.FC<WaveDynamicProps> = ({
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
  const MIN_MARKER_DISTANCE = 0.0008; // 0.5% of the total width

  const { handleSettingChange } = useSampleSettings();

  const [dragState, setDragState] = useState<{
    type: 'marker' | 'label' | null;
    key: string | null;
    offset: number; // how far the mouse is from the marker
  }>({ type: null, key: null, offset: 0 });

  const [mouseStyle, setMouseStyle] = useState('default');

  const [scale, setScale] = useState(1);

  // current pixel values for start, end, loopStart, loopEnd
  const [startPixel, setStartPixel] = useState();
  const [endPixel, setEndPixel] = useState();
  const [loopStartPixel, setLoopStartPixel] = useState();
  const [loopEndPixel, setLoopEndPixel] = useState();

  const normalizeData = useCallback((data: Float32Array): Float32Array => {
    let maxVal = 0;
    for (let i = 0; i < data.length; i++) {
      const absVal = Math.abs(data[i]);
      if (absVal > maxVal) {
        maxVal = absVal;
      }
    }
    return maxVal === 0
      ? data
      : new Float32Array(data.map((val) => val / maxVal));
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale the canvas to match the device pixel ratio
    const pxr = pixelRatioRef.current;
    canvas.width = width * pxr;
    canvas.height = height * pxr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(pxr, pxr);

    // Clear the entire canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const data = normalizeData(buffer.getChannelData(0));
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.beginPath();
    ctx.moveTo(0, amp);

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
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

    const drawMarker = (x: number, markerColor: string, label: string) => {
      const markerWidth = 2;
      const labelPadding = 5;
      const labelHeight = 20;
      const labelWidth = ctx.measureText(label).width + labelPadding * 2;

      const pixelX = x * width;
      ctx.fillStyle = markerColor;
      ctx.fillRect(pixelX - markerWidth / 2, 0, markerWidth, height);

      // Draw label background
      ctx.fillStyle = 'transparent';
      ctx.fillRect(pixelX + labelPadding, 0, labelWidth, labelHeight);

      // Draw label text
      ctx.font = '12px Arial';
      ctx.fillStyle = markerColor;
      ctx.fillText(label, pixelX + labelPadding, 15);
    };

    if (startPoint !== undefined) {
      drawMarker(startPoint, 'red', 'Start');
    }
    if (endPoint !== undefined) {
      drawMarker(endPoint, 'red', 'End');
    }
    if (loopStart !== undefined) {
      drawMarker(loopStart, 'green', 'Loop-Start');
    }
    if (loopEnd !== undefined) {
      drawMarker(loopEnd, 'green', 'Loop-End');
    }
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
    scale,
  ]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform, scale]);

  // Helper function to get the current value of a marker
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

  const getMarkerAtPosition = useCallback(
    // refactor to separate concerns // mouseStyle separate
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
          const pixelX = marker.value * width;
          const labelWidth = ctx.measureText(marker.label).width + 10;
          const labelHeight = 20;

          // Check if clicking on label
          if (
            x >= pixelX + 5 &&
            x <= pixelX + 5 + labelWidth &&
            y >= 0 &&
            y <= labelHeight
          ) {
            setMouseStyle('pointer');

            return { type: 'label', key: marker.key };
          }

          // Check if clicking on marker line
          if (Math.abs(x - pixelX) < 5) {
            setMouseStyle('cursor');

            return { type: 'marker', key: marker.key };
          }
        }
        setMouseStyle('default');
      }
      return null;
    },
    [startPoint, endPoint, loopStart, loopEnd, width]
  );

  const handleDrag = useCallback(
    (x: number, dragType: 'marker' | 'label') => {
      if (!dragState.key) return;

      let newValue;
      if (dragType === 'label') {
        newValue = Math.max(0, Math.min(1, (x - dragState.offset) / width));
      } else {
        newValue = Math.max(0, Math.min(1, x / width));
      }

      // Apply constraints start < end, loopStart < loopEnd
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
    [dragState, handleSettingChange, width]
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
        const markerX = markerValue * width;
        const offset = hitResult.type === 'label' ? x - markerX : 0;

        setDragState({
          type: hitResult.type,
          key: hitResult.key,
          offset: offset,
        });
      }
    },
    [getMarkerAtPosition, width]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * width;
      const y = e.clientY - rect.top;

      const isOverMarkerOrLabel = getMarkerAtPosition(x, y);

      if (!dragState.type) return;

      e.preventDefault();
      e.stopPropagation();

      setMouseStyle('grabbing');

      // const rect = canvasRef.current!.getBoundingClientRect();
      // let x = ((e.clientX - rect.left) / rect.width) * width;

      handleDrag(x, dragState.type);
    },
    [dragState, handleDrag, width]
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

  return (
    <TransformWrapper
      initialScale={1}
      initialPositionX={0}
      initialPositionY={0}
      minScale={0.5}
      maxScale={32}
      onZoom={({ state }) => setScale(state.scale)}
      panning={{ disabled: true }}
    >
      <TransformComponent>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: `${mouseStyle}` }}
        />
      </TransformComponent>
    </TransformWrapper>
  );
};

export default WaveDynamic;
