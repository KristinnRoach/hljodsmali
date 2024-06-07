import React, { useState } from 'react';

interface BasicSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onFinalChange: (value: number) => void;
}

const BasicSlider: React.FC<BasicSliderProps> = ({
  label,
  min,
  max,
  value,
  onChange,
  onFinalChange,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setInternalValue(newValue);
    onChange(newValue);
  };

  const handleMouseUp = () => {
    onFinalChange(internalValue);
  };

  const handleTouchEnd = () => {
    onFinalChange(internalValue);
  };

  return (
    <div>
      <label>{label}</label>
      <input
        type='range'
        min={min}
        max={max}
        value={internalValue}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default BasicSlider;
