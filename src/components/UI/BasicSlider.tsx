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

// type BasicSliderProps = {
//   label: string;
//   min: number;
//   max: number;
//   value: number;
//   onChange: (value: number) => void;
//   onFinalChange: (value: number) => void;
// };

// const BasicSlider: React.FC<BasicSliderProps> = ({
//   label,
//   min,
//   max,
//   value,
//   onChange,
//   onFinalChange,
// }) => {
//   const [internalValue, setInternalValue] = useState(value);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = Number(e.target.value);
//     setInternalValue(newValue);
//     onChange(newValue);
//   };

//   const handleMouseUp = () => {
//     onFinalChange(internalValue);
//   };

//   const handleTouchEnd = () => {
//     onFinalChange(internalValue);
//   };

//   return (
//     <div>
//       <label>{label}</label>
//       <input
//         type='range'
//         min={min}
//         max={max}
//         value={internalValue}
//         onChange={handleChange}
//         onMouseUp={handleMouseUp}
//         onTouchEnd={handleTouchEnd}
//       />
//     </div>
//   );
// };

// export default BasicSlider;
