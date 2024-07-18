import React from 'react';
import ReactSlider, { ReactSliderProps } from 'react-slider';
import styles from './ReactSlider.module.scss';

type ResizableSliderProps = {
  values: number[];
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
  ariaLabels?: string[];
};

const Thumb: ReactSliderProps<number[]>['renderThumb'] = (props, state) => {
  const { key, ...rest } = props;
  return (
    <div key={key} {...rest} className={styles.thumb}>
      {state.valueNow.toFixed(2)}
    </div>
  );
};

const Track: ReactSliderProps<number[]>['renderTrack'] = (props, state) => {
  const { key, ...rest } = props;
  return (
    <div
      key={key}
      {...rest}
      className={`${styles.track} ${
        state.index === 2
          ? styles.trackRed
          : state.index === 1
          ? styles.trackGreen
          : styles.trackDefault
      }`}
    />
  );
};

const ResizableSlider: React.FC<ResizableSliderProps> = ({
  values,
  onChange,
  min = 0,
  max = 100,
  ariaLabels,
}) => (
  <div className={styles.container}>
    <ReactSlider<number[]>
      className={styles.slider}
      value={values}
      onChange={onChange}
      min={min}
      max={max}
      renderTrack={Track}
      renderThumb={Thumb}
      minDistance={10}
      pearling // thumbs will push each other
      ariaLabel={ariaLabels}
      // defaultValue={[0, 50, 100]}
    />
  </div>
);

export default ResizableSlider;
