'use client'; // 'use server'; ?

import React from 'react';

type BasicSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

const BasicSlider: React.FC<BasicSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
}) => {
  // const [isDragging, setIsDragging] = useState(false);

  // const handleDragStart = () => {
  //   setIsDragging(true);
  // };

  // const handleDragEnd = () => {
  //   setIsDragging(false);
  // };

  return (
    <div style={{ margin: '20px 0' }}>
      <label>
        {label}: {value.toFixed(2)}
      </label>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};

export default BasicSlider;
