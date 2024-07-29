'use client'; // 'use server'; ?

import React from 'react';

type BasicSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  isLogarithmic?: boolean;
  maxDynamic?: number;
  minDynamic?: number;
};

const BasicSlider: React.FC<BasicSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  isLogarithmic = false,
  maxDynamic,
  minDynamic,
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
    if (maxDynamic !== undefined) {
      newValue = Math.min(newValue, maxDynamic);
    }
    if (minDynamic !== undefined) {
      newValue = Math.max(newValue, minDynamic);
    }
    onChange(newValue);
  };

  const displayValue = isLogarithmic ? linearToLog(value) : value;

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
