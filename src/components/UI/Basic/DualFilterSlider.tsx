import React from 'react';
import { Slider } from '@nextui-org/slider';

interface DualFilterSliderProps {
  lowCutoff: number;
  highCutoff: number;
  onFilterChange: (lowCutoff: number, highCutoff: number) => void;
  min?: number;
  max?: number;
}

const DualFilterSlider: React.FC<DualFilterSliderProps> = ({
  lowCutoff,
  highCutoff,
  onFilterChange,
  min = 20,
  max = 20000,
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

  const handleChange = (value: number[] | number) => {
    if (Array.isArray(value) && value.length === 2) {
      onFilterChange(logToLinear(value[0]), logToLinear(value[1]));
    }
  };

  // const formatFrequency = (value: number[] | number) => {
  //   const freq = Math.round(logToLinear(value));
  //   return freq >= 1000 ? `${(freq / 1000).toFixed(1)}kHz` : `${freq}Hz`;
  // };

  return (
    <Slider
      label='Filters'
      step={1}
      minValue={min}
      maxValue={max}
      value={[linearToLog(lowCutoff), linearToLog(highCutoff)]}
      onChange={handleChange}
      // formatOptions={(value: number[] | number) => formatFrequency(value)}
      // className='max-w-md'
    />
  );
};

export default DualFilterSlider;
