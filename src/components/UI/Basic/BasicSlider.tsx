'use client'; // 'use server'; ?

import React from 'react';

type BasicSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  ceiling?: number;
  floor?: number;
  step?: number;
  isLogarithmic?: boolean;
};

const BasicSlider: React.FC<BasicSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  ceiling,
  floor,
  step,
  isLogarithmic = false,
}) => {
  const logToLinear = (logValue: number) => {
    const minLog = Math.log(min);
    const maxLog = Math.log(max);
    const scale = (maxLog - minLog) / (max - min);
    return Math.exp(minLog + scale * (logValue - min));
  };

  const linearToLog = (linearValue: number) => {
    const minLog = Math.log(min);
    const maxLog = Math.log(max);
    const scale = (max - min) / (maxLog - minLog);
    return min + scale * (Math.log(linearValue) - minLog);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseFloat(e.target.value);
    if (isLogarithmic) {
      newValue = logToLinear(newValue);
    }
    newValue = Math.min(Math.max(newValue, floor ?? min), ceiling ?? max);
    onChange(newValue);
  };

  const displayValue = isLogarithmic ? linearToLog(value) : value;
  // const effectiveMin = floor !== undefined ? Math.max(min, floor) : min;
  // const effectiveMax = ceiling !== undefined ? Math.min(max, ceiling) : max;

  return (
    <div style={{ margin: '20px 0' }}>
      <label>
        {label} {/* : {value.toFixed(isLogarithmic ? 0 : 2)} */}
      </label>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default BasicSlider;

// const [isDragging, setIsDragging] = useState(false);

// const handleDragStart = () => {
//   setIsDragging(true);
// };

// const handleDragEnd = () => {
//   setIsDragging(false);
// };
