import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Sample_settings } from '../../../types/sample';
import { useSampleSettings } from '../../../hooks/useSampleSettings';

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
  const { handleSettingChange } = useSampleSettings();
  const [draggingMarker, setDraggingMarker] = useState<string | null>(null);

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

      ctx.fillStyle = markerColor;
      ctx.fillRect(x - markerWidth / 2, 0, markerWidth, height);

      ctx.font = '12px Arial';
      ctx.fillStyle = markerColor;
      ctx.fillText(label, x + labelPadding, 15);
    };

    if (startPoint !== undefined) {
      drawMarker(startPoint * width, 'red', 'S');
    }
    if (endPoint !== undefined) {
      drawMarker(endPoint * width, 'red', 'E');
    }
    if (loopStart !== undefined) {
      drawMarker(loopStart * width, 'green', 'LS');
    }
    if (loopEnd !== undefined) {
      drawMarker(loopEnd * width, 'green', 'LE');
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
  ]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const getMarkerAtPosition = useCallback(
    (x: number) => {
      const markers = [
        { key: 'startPoint', value: startPoint },
        { key: 'endPoint', value: endPoint },
        { key: 'loopStart', value: loopStart },
        { key: 'loopEnd', value: loopEnd },
      ];

      const threshold = 5; // pixels
      for (const marker of markers) {
        if (
          marker.value !== undefined &&
          Math.abs(marker.value * width - x) < threshold
        ) {
          return marker.key;
        }
      }
      return null;
    },
    [startPoint, endPoint, loopStart, loopEnd, width]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const marker = getMarkerAtPosition(x);
      if (marker) {
        setDraggingMarker(marker);
      }
    },
    [getMarkerAtPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!draggingMarker) return;

      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newValue = Math.max(0, Math.min(1, x / width));

      handleSettingChange(draggingMarker as keyof Sample_settings, newValue);
    },
    [draggingMarker, width, handleSettingChange]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingMarker(null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default WaveDynamic;
