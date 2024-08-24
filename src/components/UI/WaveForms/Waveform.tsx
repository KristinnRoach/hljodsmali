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
  baseWidth: number = 800,
  pixelsPerSecond: number = 200
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
  showCenterLine = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelRatioRef = useRef(window.devicePixelRatio || 1);
  const MIN_MARKER_DISTANCE = 0.0008;

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(200);
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

      // setWidth(calculateWidth(buffer.duration, 1200, 200));
      setWidth(800);
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

      setDragState({ type: null, key: null, offset: 0, initialPosition: 0 });
      setMouseStyle('default');
    },
    []
  );

  useEffect(() => {
    if (buffer) {
      drawWaveform(
        startPoint ?? 0,
        endPoint ?? 0.95,
        loopStart ?? 0,
        loopEnd ?? 0.9
      );
    }
  }, [drawWaveform, buffer, startPoint, endPoint, loopStart, loopEnd]);

  return (
    <canvas
      className={className}
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

// import React, { useRef, useEffect, useCallback, useState } from 'react';
// import { Time_settings } from '../../../types/samples';
// import SamplerEngine from '../../../lib/engine/SamplerEngine';

// type settingKey = 'startPoint' | 'endPoint' | 'loopStart' | 'loopEnd';

// type WaveformState = {
//   sampleId: string;
//   buffer: AudioBuffer;
//   settings: Time_settings;
//   normalizedSettings: Time_settings;
// };

// interface WaveformProps {
//   width: number;
//   height: number;
//   color?: string;
//   backgroundColor?: string;
//   showCenterLine?: boolean;
// }

// const Waveform: React.FC<WaveformProps> = ({
//   width,
//   height,
//   color = '#3498db',
//   backgroundColor = 'transparent',
//   showCenterLine = true,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const pixelRatioRef = useRef(window.devicePixelRatio || 1);
//   const MIN_MARKER_DISTANCE = 0.0008;

//   const samplerEngine = SamplerEngine.getInstance();

//   const [mouseStyle, setMouseStyle] = useState('default');
//   const [currentState, setCurrentState] = useState<WaveformState>();

//   // Convert time values to normalized values
//   const normalizePoint = (point: number, buffer: AudioBuffer): number =>
//     buffer.duration ? point / buffer.duration : 0;

//   //  TODO: Make sure this effect gets triggered:
//   // on mount
//   // when a new sample is selected for settings
//   // if Time settings are changed from outside the waveform component
//   useEffect(() => {
//     if (!samplerEngine) return;

//     const selected = samplerEngine.getSelectedForSettings()[0]; // Modify if needed for multiple samples
//     const buffer = samplerEngine.getBufferForSettings(selected);
//     const settings = samplerEngine.getSampleSettings(
//       selected,
//       'Time'
//     ) as Time_settings;

//     console.log('Waveform: useEffect', selected, buffer, settings);

//     if (
//       !(
//         selected &&
//         buffer &&
//         settings &&
//         settings.startPoint &&
//         settings.endPoint &&
//         settings.loopStart &&
//         settings.loopEnd
//       )
//     )
//       return;

//     const normalizedSettings = {
//       startPoint: normalizePoint(settings.startPoint, buffer),
//       endPoint: normalizePoint(settings.endPoint, buffer),
//       loopStart: normalizePoint(settings.loopStart, buffer),
//       loopEnd: normalizePoint(settings.loopEnd, buffer),
//     };

//     const newState: WaveformState = {
//       sampleId: selected,
//       buffer,
//       settings: settings as Time_settings,
//       normalizedSettings: normalizedSettings as Time_settings,
//     };

//     setCurrentState(newState);
//   }, [samplerEngine]);

//   const [dragState, setDragState] = useState<{
//     type: 'marker' | 'label' | null;
//     key: settingKey | null;
//     offset: number;
//   }>({ type: null, key: null, offset: 0 });

//   const normalizeData = useCallback((data: Float32Array): Float32Array => {
//     let maxVal = 0;
//     for (let i = 0; i < data.length; i++) {
//       const absVal = Math.abs(data[i]);
//       if (absVal > maxVal) {
//         maxVal = absVal;
//       }
//     }

//     if (maxVal === 0) return data;

//     const normalizedData = new Float32Array(data.length);
//     for (let i = 0; i < data.length; i++) {
//       normalizedData[i] = data[i] / maxVal;
//     }

//     return normalizedData;
//   }, []);

//   const getMarkerPixelPosition = useCallback(
//     (markerValue: number) => {
//       // Ensure markerValue is within [0, 1] range
//       const clampedValue = Math.max(0, Math.min(1, markerValue));
//       // Account for potential padding or borders
//       const drawableWidth = width - 2; // Subtract 2 for left and right 1px borders
//       return Math.round(clampedValue * drawableWidth) + 1; // Add 1 to account for left border
//     },
//     [width]
//   );

//   const drawMarker = useCallback(
//     (markerValue: number, markerColor: string, label: string) => {
//       if (!(currentState && currentState.buffer)) return; // No sample available

//       const canvas = canvasRef.current;
//       if (!canvas) return;

//       const ctx = canvas.getContext('2d');
//       if (!ctx) return;

//       const markerWidth = 2;
//       const labelPadding = 5;
//       const labelHeight = 20;
//       const labelWidth = ctx.measureText(label).width + labelPadding * 2;

//       const pixelX = Math.min(
//         width - 1,
//         Math.max(0, getMarkerPixelPosition(markerValue))
//       );
//       ctx.fillStyle = markerColor;
//       ctx.fillRect(pixelX - markerWidth / 2, 0, markerWidth, height);

//       ctx.fillStyle = 'transparent';
//       ctx.fillRect(pixelX + labelPadding, 0, labelWidth, labelHeight);

//       ctx.font = '12px Arial';
//       ctx.fillStyle = markerColor;
//       ctx.fillText(label, pixelX + labelPadding, 15);
//     },
//     [height, getMarkerPixelPosition, width]
//   );

//   const drawWaveform = useCallback(() => {
//     const { sampleId, buffer, settings, normalizedSettings } =
//       currentState ?? {};

//     if (!(sampleId && buffer && settings && normalizedSettings)) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext('2d');

//     if (!(canvas && ctx)) return;

//     const pxr = pixelRatioRef.current;
//     canvas.width = width * pxr;
//     canvas.height = height * pxr;
//     canvas.style.width = `${width}px`;
//     canvas.style.height = `${height}px`;

//     ctx.scale(pxr, pxr);
//     ctx.clearRect(0, 0, width, height);
//     ctx.fillStyle = backgroundColor;
//     ctx.fillRect(0, 0, width, height);

//     const data = normalizeData(buffer.getChannelData(0));
//     const step = Math.ceil(data.length / width);
//     const amp = height / 2;

//     ctx.beginPath();
//     ctx.moveTo(0, amp);

//     // const zoomedWidth = width * zoomValue;
//     // const zoomOffset = loopStart ? loopStart * width * (1 - zoomValue) : 0;

//     for (let i = 0; i < width; i++) {
//       let min = 1.0;
//       let max = -1.0;

//       // const dataIndex = Math.floor((i + zoomOffset) / zoomValue);
//       const dataIndex = i;
//       for (let j = 0; j < step; j++) {
//         const datum = data[dataIndex * step + j];
//         if (datum < min) min = datum;
//         if (datum > max) max = datum;
//       }

//       ctx.lineTo(i, (1 + min) * amp);
//       ctx.lineTo(i, (1 + max) * amp);
//     }

//     ctx.strokeStyle = color;
//     ctx.stroke();

//     if (showCenterLine) {
//       ctx.beginPath();
//       ctx.moveTo(0, amp);
//       ctx.lineTo(width, amp);
//       ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
//       ctx.stroke();
//     }

//     const {
//       startPoint,
//       endPoint,
//       loopStart,
//       loopEnd,
//     } = // NOT NORMALIZED ?
//       currentState?.settings as Time_settings;

//     if (startPoint !== undefined) drawMarker(startPoint, 'red', 'Start');
//     if (endPoint !== undefined) drawMarker(endPoint, 'red', 'End');
//     if (loopStart !== undefined) drawMarker(loopStart, 'green', 'Loop-Start');
//     if (loopEnd !== undefined) drawMarker(loopEnd, 'green', 'Loop-End');
//   }, [
//     currentState,
//     currentState?.buffer, // needed?
//     width,
//     height,
//     color,
//     backgroundColor,
//     showCenterLine,
//     normalizeData,
//     drawMarker,
//   ]);

//   const getMarkerAtPosition = useCallback(
//     (
//       x: number,
//       y: number
//     ): {
//       type: 'marker' | 'label';
//       key: settingKey;
//     } | null => {
//       if (!(currentState && currentState.settings)) return null;

//       const { startPoint, endPoint, loopStart, loopEnd } =
//         currentState.settings as Time_settings;

//       const markers = [
//         { key: 'startPoint' as settingKey, value: startPoint, label: 'Start' },
//         { key: 'endPoint' as settingKey, value: endPoint, label: 'End' },
//         {
//           key: 'loopStart' as settingKey,
//           value: loopStart,
//           label: 'Loop-Start',
//         },
//         { key: 'loopEnd' as settingKey, value: loopEnd, label: 'Loop-End' },
//       ];

//       const ctx = canvasRef.current!.getContext('2d')!;
//       ctx.font = '12px Arial';

//       for (const marker of markers) {
//         if (marker.value !== undefined) {
//           const pixelX = getMarkerPixelPosition(marker.value);
//           const labelWidth = ctx.measureText(marker.label).width + 10;
//           const labelHeight = 20;

//           if (
//             x >= pixelX + 5 &&
//             x <= pixelX + 5 + labelWidth &&
//             y >= 0 &&
//             y <= labelHeight
//           ) {
//             setMouseStyle('pointer');
//             return { type: 'label', key: marker.key };
//           }

//           if (Math.abs(x - pixelX) < 5) {
//             setMouseStyle('cursor');
//             return { type: 'marker', key: marker.key };
//           }
//         }
//       }
//       setMouseStyle('default');
//       return null;
//     },
//     [currentState, getMarkerPixelPosition]
//   );

//   const getMarkerValue = (key: string): number => {
//     if (!(currentState && currentState.settings))
//       throw new Error('No settings');

//     const { startPoint, endPoint, loopStart, loopEnd } =
//       currentState.settings as Time_settings;

//     switch (key) {
//       case 'startPoint':
//         return startPoint || 0;
//       case 'endPoint':
//         return endPoint || 1;
//       case 'loopStart':
//         return loopStart || 0;
//       case 'loopEnd':
//         return loopEnd || 1;
//       default:
//         return 0;
//     }
//   };

//   const handleDrag = useCallback(
//     (x: number, dragType: 'marker' | 'label') => {
//       if (!(dragState.key && currentState && currentState.settings)) return;

//       const { startPoint, endPoint, loopStart, loopEnd } =
//         currentState.settings as Time_settings;

//       let newValue_normalized;
//       if (dragType === 'label') {
//         newValue_normalized = Math.max(
//           0,
//           Math.min(1, (x - dragState.offset) / width)
//         );
//       } else {
//         newValue_normalized = Math.max(0, Math.min(1, x / width));
//       }

//       switch (dragState.key) {
//         case 'startPoint':
//           newValue_normalized = Math.min(
//             newValue_normalized,
//             (endPoint || 1) - MIN_MARKER_DISTANCE
//           );
//           break;
//         case 'loopStart':
//           newValue_normalized = Math.min(
//             newValue_normalized,
//             (loopEnd || 1) - MIN_MARKER_DISTANCE
//           );
//           break;
//         case 'loopEnd':
//           newValue_normalized = Math.max(
//             newValue_normalized,
//             (loopStart || 0) + MIN_MARKER_DISTANCE
//           );
//           break;
//         case 'endPoint':
//           newValue_normalized = Math.max(
//             newValue_normalized,
//             (startPoint || 0) + MIN_MARKER_DISTANCE
//           );
//           break;
//       }

//       const newValue_seconds =
//         newValue_normalized * currentState.buffer.duration;

//       const newSetting: Partial<Time_settings> = {
//         [dragState.key]: newValue_seconds,
//       };

//       samplerEngine.updateTimeSettings(currentState.sampleId, newSetting);

//       // Update local state to trigger re-render
//       setCurrentState({
//         ...currentState,
//         settings: {
//           ...currentState.settings,
//           [dragState.key]: newValue_seconds,
//         },
//         normalizedSettings: {
//           ...currentState.normalizedSettings,
//           [dragState.key]: newValue_normalized,
//         },
//       });
//     },
//     [dragState, samplerEngine, width]
//   );

//   const handleMouseDown = useCallback(
//     (e: React.MouseEvent<HTMLCanvasElement>) => {
//       e.preventDefault();
//       e.stopPropagation();

//       const rect = canvasRef.current!.getBoundingClientRect();
//       const x = ((e.clientX - rect.left) / rect.width) * width;
//       const y = e.clientY - rect.top;

//       const hitResult = getMarkerAtPosition(x, y);
//       if (hitResult) {
//         const markerValue = getMarkerValue(hitResult.key);
//         const markerX = getMarkerPixelPosition(markerValue);
//         const offset = hitResult.type === 'label' ? x - markerX : 0;

//         setDragState({
//           type: hitResult.type,
//           key: hitResult.key,
//           offset: offset,
//         });
//       }
//     },
//     [getMarkerAtPosition, width, getMarkerPixelPosition]
//   );

//   const handleMouseMove = useCallback(
//     (e: React.MouseEvent<HTMLCanvasElement>) => {
//       const rect = canvasRef.current!.getBoundingClientRect();
//       const x = ((e.clientX - rect.left) / rect.width) * width;
//       const y = e.clientY - rect.top;

//       getMarkerAtPosition(x, y);

//       if (!dragState.type) return;

//       e.preventDefault();
//       e.stopPropagation();

//       setMouseStyle('grabbing');

//       handleDrag(x, dragState.type);
//     },
//     [dragState, handleDrag, width, getMarkerAtPosition]
//   );

//   const handleMouseUp = useCallback(
//     (e: React.MouseEvent<HTMLCanvasElement>) => {
//       e.preventDefault();
//       e.stopPropagation();

//       setDragState({ type: null, key: null, offset: 0 });
//       setMouseStyle('default');
//     },
//     []
//   );

//   useEffect(() => {
//     drawWaveform();
//   }, [drawWaveform]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={width}
//       height={height}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onMouseLeave={handleMouseUp}
//       style={{ cursor: mouseStyle }}
//     />
//   );
// };

// export default Waveform;
