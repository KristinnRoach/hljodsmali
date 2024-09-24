import React, { useState, useCallback, memo, useRef, useEffect } from 'react';

// Utility functions for conversion
const timeToPixel = (time: number, duration: number, width: number): number => {
  return (time / duration) * width;
};

const pixelToTime = (
  pixel: number,
  duration: number,
  width: number
): number => {
  return (pixel / width) * duration;
};

interface WaveformProps {
  audioBuffer: AudioBuffer;
  vertical?: boolean;
}

const Waveform: React.FC<WaveformProps> = memo(
  ({ audioBuffer, vertical = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // const pixelRatioRef = useRef(window.devicePixelRatio || 1);

    useEffect(() => {
      if (!canvasRef.current || !audioBuffer) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / canvas.width);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();

      if (vertical) {
        ctx.moveTo(canvas.width / 2, canvas.height);

        for (let i = 0; i < canvas.height; i++) {
          const index = Math.floor(i * step);
          const y = canvas.height - i;
          const x = ((1 + data[index]) * canvas.width) / 2;
          ctx.lineTo(x, y);
        }
      } else {
        ctx.moveTo(0, canvas.height / 2);
        for (let i = 0; i < canvas.width; i++) {
          const index = Math.floor(i * step);
          const x = i;
          const y = ((1 + data[index]) * canvas.height) / 2;
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = 'blue';
      ctx.stroke();
    }, [audioBuffer, vertical]);

    return (
      <canvas
        ref={canvasRef}
        width={vertical ? 200 : 800}
        height={vertical ? 800 : 200}
      />
    );
  }
);

interface MarkerProps {
  position: number; // in seconds
  onPositionChange: (newPosition: number) => void; // newPosition in seconds
  vertical?: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  min: number; // in seconds
  max: number; // in seconds
  duration: number; // audio buffer duration
}

const Marker: React.FC<MarkerProps> = ({
  position,
  onPositionChange,
  vertical = false,
  containerRef,
  min,
  max,
  duration,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerSize = vertical
          ? containerRect.height
          : containerRect.width;
        const pixelPosition = vertical
          ? e.clientY - containerRect.top
          : e.clientX - containerRect.left;

        const newTimePosition = pixelToTime(
          pixelPosition,
          duration,
          containerSize
        );
        const clampedTimePosition = Math.max(
          min,
          Math.min(newTimePosition, max)
        );

        onPositionChange(clampedTimePosition);
      }
    },
    [isDragging, onPositionChange, vertical, containerRef, min, max, duration]
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const containerRect = containerRef.current?.getBoundingClientRect();
  const containerSize = containerRect
    ? vertical
      ? containerRect.height
      : containerRect.width
    : 0;
  const pixelPosition = timeToPixel(position, duration, containerSize);

  const style: React.CSSProperties = vertical
    ? {
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${pixelPosition}px`,
        height: '2px',
        background: 'red',
        cursor: 'ns-resize',
      }
    : {
        position: 'absolute',
        left: `${pixelPosition}px`,
        top: 0,
        bottom: 0,
        width: '2px',
        background: 'red',
        cursor: 'ew-resize',
      };

  return <div ref={markerRef} style={style} onMouseDown={handleMouseDown} />;
};

interface MarkerConfig {
  // add label prop (use instead of index) // value ?
  initialPosition: number; // in seconds
  min: number; // in seconds
  max: number; // in seconds
}

interface WaveformWithMarkersProps {
  audioBuffer: AudioBuffer;
  vertical?: boolean;
  onMarkersChange?: (markerIndex: number, newValue: number) => void; // newValue in seconds
  markerConfigs: MarkerConfig[];
}

const WaveformWithMarkers: React.FC<WaveformWithMarkersProps> = ({
  audioBuffer,
  vertical = false,
  onMarkersChange,
  markerConfigs,
}) => {
  const [markers, setMarkers] = useState(
    markerConfigs.map((config) => config.initialPosition)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMarkerPositionChange = useCallback(
    (index: number, newPosition: number) => {
      if (onMarkersChange) {
        onMarkersChange(index, newPosition);
        setMarkers((prev) => {
          const updated = [...prev];
          updated[index] = newPosition;
          return updated;
        });
      }
    },
    [onMarkersChange]
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: vertical ? '200px' : '800px',
        height: vertical ? '800px' : '200px',
      }}
    >
      <Waveform audioBuffer={audioBuffer} vertical={vertical} />
      {markers.map((pos, index) => (
        <Marker
          key={index}
          position={pos}
          onPositionChange={(newPos) =>
            handleMarkerPositionChange(index, newPos)
          }
          vertical={vertical}
          containerRef={containerRef}
          min={markerConfigs[index].min}
          max={markerConfigs[index].max}
          duration={audioBuffer.duration}
        />
      ))}
    </div>
  );
};

export default WaveformWithMarkers;

// const Marker = ({ position, onDrag }) => {
//   const handleDrag = useCallback(
//     (e) => {
//       onDrag(e.clientX);
//     },
//     [onDrag]
//   );

//   return (
//     <div
//       style={{
//         position: 'absolute',
//         left: `${position}px`,
//         top: 0,
//         bottom: 0,
//         width: '2px',
//         background: 'red',
//         cursor: 'ew-resize',
//       }}
//       draggable
//       onDrag={handleDrag}
//     />
//   );
// };
