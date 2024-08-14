import React, { useState, useRef, useEffect } from 'react';
import styles from './Knob.module.scss';

interface KnobProps {
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  size?: 'xs' | 's' | 'm' | 'l';
  className?: string;
  style?: React.CSSProperties;
  showValue?: boolean;
}

const Knob: React.FC<KnobProps> = ({
  min = 0,
  max = 100,
  step = 1,
  label = '',
  value,
  onChange,
  size = 'medium',
  className = '',
  style = {},
  showValue = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const diff = startY - e.clientY;
      const range = max - min;
      const newValue = startValue + (diff / 100) * range;
      updateValue(newValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newValue = value + (e.deltaY > 0 ? -step : step);
    updateValue(newValue);
  };

  const updateValue = (newValue: number) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    const steppedValue = Math.round(clampedValue / step) * step;
    onChange(steppedValue);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startValue]);

  const rotation = ((value - min) / (max - min)) * 270 - 135;

  return (
    <div
      className={`${styles.wrapper} ${styles[size]} ${className}`}
      style={style}
    >
      <div
        ref={knobRef}
        className={styles.knob}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        tabIndex={0}
      >
        <div
          className={styles.indicator}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        <div className={styles.value}>
          {showValue ? value.toFixed(step < 1 ? 2 : 0) : label}
        </div>
      </div>
      {showValue && <div className={styles.label}>{label}</div>}
    </div>
  );
};

export default Knob;
