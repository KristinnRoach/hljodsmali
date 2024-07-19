// src/components/SamplerControls.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSamplerCtx } from '../../contexts/sampler-context';
import { Sample_db, Sample_settings } from '../../types/sample';

import styles from './Sampler.module.scss';

const SampleSettings: React.FC = () => {
  const { getSelectedSamples, updateSampleSettings } = useSamplerCtx();

  const handleSampleSettingsChange = useCallback(
    (sampleId: string, settings: Partial<Sample_settings>) => {
      updateSampleSettings(sampleId, settings);
    },
    [updateSampleSettings]
  );

  const handleAttackTimeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      const value = parseFloat(event.target.value);
      const selectedSamples = getSelectedSamples();
      selectedSamples.forEach((sample) => {
        handleSampleSettingsChange(sample.id, { attackTime: value });
      });
    },
    [getSelectedSamples, handleSampleSettingsChange]
  );

  const handleReleaseTimeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      const selectedSamples = getSelectedSamples();
      selectedSamples.forEach((sample) => {
        handleSampleSettingsChange(sample.id, { releaseTime: value });
      });
    },
    [getSelectedSamples, handleSampleSettingsChange]
  );

  const handleStartPointChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      const selectedSamples = getSelectedSamples();
      selectedSamples.forEach((sample) => {
        handleSampleSettingsChange(sample.id, { startPoint: value });
      });
    },
    [getSelectedSamples, handleSampleSettingsChange]
  );

  const handleEndPointChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      const selectedSamples = getSelectedSamples();
      selectedSamples.forEach((sample) => {
        handleSampleSettingsChange(sample.id, { endPoint: value });
      });
    },
    [getSelectedSamples, handleSampleSettingsChange]
  );

  const handleLoopStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      const selectedSamples = getSelectedSamples();
      selectedSamples.forEach((sample) => {
        handleSampleSettingsChange(sample.id, { loopStart: value });
      });
    },
    [getSelectedSamples, handleSampleSettingsChange]
  );

  const handleLoopEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      const selectedSamples = getSelectedSamples();
      selectedSamples.forEach((sample) => {
        handleSampleSettingsChange(sample.id, { loopEnd: value });
      });
    },
    [getSelectedSamples, handleSampleSettingsChange]
  );

  return (
    <>
      {getSelectedSamples().length > 0 && (
        <section className={styles.sample_settings}>
          {getSelectedSamples().map((s) => (
            <div
              key={s.id}
              title={s.name}
              tabIndex={-1}
              // onClickCapture={(e) => {
              //   e.preventDefault();
              //   e.stopPropagation();
              // }}
            >
              <h2>{s.name}</h2>
              <label>Attack</label>
              <input
                type='range'
                min='0'
                max={s.bufferDuration}
                step='0.01'
                value={s.sample_settings?.attackTime}
                onChange={handleAttackTimeChange}
                tabIndex={-1} // prevent focus doesnt work
              />

              <label>Release</label>
              <input
                type='range'
                min='0.01'
                max={s.bufferDuration}
                step='0.01'
                value={s.sample_settings?.releaseTime}
                onChange={handleReleaseTimeChange}
                tabIndex={-1}
              />

              <label>Start</label>
              <input
                type='range'
                min='0'
                max={s.sample_settings?.endPoint ?? s.bufferDuration}
                step='0.01'
                value={s.sample_settings?.startPoint}
                onChange={handleStartPointChange}
                tabIndex={-1}
              />

              <label>End</label>
              <input
                type='range'
                min={s.sample_settings?.startPoint}
                max={s.bufferDuration}
                step='0.01'
                value={s.sample_settings?.endPoint ?? s.bufferDuration}
                onChange={handleEndPointChange}
                tabIndex={-1}
              />

              <label>Loop Start</label>
              <input
                type='range'
                min='0'
                max={s.sample_settings?.loopEnd ?? s.bufferDuration}
                step='0.01'
                value={s.sample_settings?.loopStart ?? 0}
                onChange={handleLoopStartChange}
                tabIndex={-1}
              />

              <label>Loop End</label>
              <input
                type='range'
                min={s.sample_settings?.loopStart ?? 0}
                max={s.bufferDuration}
                step='0.01'
                value={s.sample_settings?.loopEnd ?? s.bufferDuration}
                onChange={handleLoopEndChange}
                tabIndex={-1}
              />

              <label>Sample Volume</label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={s.sample_settings?.sampleVolume}
                onChange={(event) => {
                  handleSampleSettingsChange(s.id, {
                    sampleVolume: parseFloat(event.target.value),
                  });
                }}
                tabIndex={-1}
              />

              <label>Loop Volume</label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={s.sample_settings?.loopVolume}
                onChange={(event) => {
                  handleSampleSettingsChange(s.id, {
                    loopVolume: parseFloat(event.target.value),
                  });
                }}
                tabIndex={-1}
              />
            </div>
          ))}
        </section>
      )}
    </>
  );
};

export default SampleSettings;

/* <AccordionItem>
<label>Master Volume</label>
<input
  type='range'
  min='0'
  max='1'
  step='0.01'
  value={masterVolume}
  onChange={handleMasterVolumeChange}
/>
</AccordionItem> */

//   const handleSettingChange = (
//     sampleId: string,
//     setting: keyof SampleSettings,
//     value: number
//   ) => {
//     updateSampleSettings(sampleId, { [setting]: value });
//   };

//   const renderControl = (
//     sample: Sample,
//     setting: keyof SampleSettings,
//     label: string,
//     min: number,
//     max: number,
//     step: number = 0.01
//   ) => (
//     <div key={`${sample.id}-${setting}`}>
//       <label>{label}</label>
//       <input
//         type='range'
//         min={min}
//         max={max}
//         step={step}
//         value={sample.sample_settings[setting] as number}
//         onChange={(e) =>
//           handleSettingChange(sample.id, setting, parseFloat(e.target.value))
//         }
//       />
//     </div>
//   );

//   return (
//     <>
//       {getSelectedSamples().length > 0 && (
//         <div className='sampler-controls'>
//           <button onClick={handleSave}>Save</button>

//           {getSelectedSamples().map((sample) => (
//             <div key={sample.id} className={styles.sliderContainer}>
//               {renderControl(
//                 sample,
//                 'attackTime',
//                 'Attack Time',
//                 0,
//                 sample.bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'releaseTime',
//                 'Release Time',
//                 0.01,
//                 sample.bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'startPoint',
//                 'Start',
//                 0,
//                 sample.sample_settings.endPoint ?? sample.bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'endPoint',
//                 'End',
//                 sample.sample_settings.startPoint ?? 0,
//                 sample.bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'loopStart',
//                 'Loop Start',
//                 0,
//                 sample.sample_settings.loopEnd ?? sample.bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'loopEnd',
//                 'Loop End',
//                 sample.sample_settings.loopStart ?? 0,
//                 sample.bufferDuration
//               )}
//               {renderControl(sample, 'sampleVolume', 'Sample Volume', 0, 1)}
//               {renderControl(sample, 'loopVolume', 'Loop Volume', 0, 1)}
//             </div>
//           ))}

//           <div className={styles.sliderContainer}>
//             <label>Master Volume</label>
//             <input
//               type='range'
//               min={0}
//               max={1}
//               step={0.01}
//               value={masterVolume}
//               onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default SamplerControls;

//   return (
//     <>
//       {getSelectedSamples().length > 0 && (
//         <div className='sampler-controls'>
//           <button onClick={handleSave}>Save</button>

//           {getSelectedSamples().map((s) => (
//             <div key={s.id} className={styles.sliderContainer}>
//               <label>Trim</label>
//               <label>Attack Time</label>
//               <input
//                 type='range'
//                 min='0'
//                 max={s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.attackTime}
//                 onChange={handleAttackTimeChange}
//               />
//               <label>Release Time</label>
//               <input
//                 type='range'
//                 min='0.01'
//                 max={s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.releaseTime}
//                 onChange={handleReleaseTimeChange}
//               />
//               <label>Start</label>
//               <input
//                 type='range'
//                 min='0'
//                 max={s.sample_settings?.endPoint ?? s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.startPoint}
//                 onChange={handleStartPointChange}
//               />
//               <label>End</label>
//               <input
//                 type='range'
//                 min={s.sample_settings?.startPoint}
//                 max={s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.endPoint ?? s.bufferDuration}
//                 onChange={handleEndPointChange}
//               />

//               <label>Loop Start</label>
//               <input
//                 type='range'
//                 min='0'
//                 max={s.sample_settings?.loopEnd ?? s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.loopStart ?? 0}
//                 onChange={handleLoopStartChange}
//               />
//               <label>Loop End</label>
//               <input
//                 type='range'
//                 min={s.sample_settings?.loopStart ?? 0}
//                 max={s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.loopEnd ?? s.bufferDuration}
//                 onChange={handleLoopEndChange}
//               />

//               <label>Sample Volume</label>
//               <input
//                 type='range'
//                 min='0'
//                 max='1'
//                 step='0.01'
//                 value={s.sample_settings?.sampleVolume}
//                 onChange={(event) => {
//                   handleSampleSettingsChange(s.id, {
//                     sampleVolume: parseFloat(event.target.value),
//                   });
//                 }}
//               />

//               <label>Loop Volume</label>
//               <input
//                 type='range'
//                 min='0'
//                 max='1'
//                 step='0.01'
//                 value={s.sample_settings?.loopVolume}
//                 onChange={(event) => {
//                   handleSampleSettingsChange(s.id, {
//                     loopVolume: parseFloat(event.target.value),
//                   });
//                 }}
//               />
//             </div>
//           ))}
//           <div className={styles.sliderContainer}>
//             <label>Master Volume</label>
//             <input
//               type='range'
//               min='0'
//               max='1'
//               step='0.01'
//               value={masterVolume}
//               onChange={handleMasterVolumeChange}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default SamplerControls;

// const [volume, setVolume] = useState(0.75);

// useEffect(() => {
//   setVolume(getMasterVolume());
// }, [getMasterVolume]);

// <ResizableSlider
// values={
//   [s.sample_settings?.startPoint,
//     s.sample_settings?.attackTime,
//     s.sample_settings?.releaseTime,
//     s.sample_settings?.endPoint]
//   }
// onChange={(values) => {
// />

/* <ResizableSlider
                values={[
                  s.sample_settings?.startPoint ?? 0,
                  s.sample_settings?.endPoint ?? s.bufferDuration,
                ]}
                onChange={(values) => handleStartEndTrim(s.id, values)}
                min={0}
                max={s.bufferDuration}
              /> */

/* <label>Fade in/out</label>
              <ResizableSlider
                values={[
                  s.sample_settings?.attackTime ?? 0,
                  s.sample_settings?.releaseTime ?? s.bufferDuration,
                ]}
                onChange={(values) => handleSamplePointsChange(s.id, values)}
                min={0}
                max={s.bufferDuration}
              /> */

// const handleStartEndTrim = useCallback(
//   (id: string, values: number[]) => {
//     handleSampleSettingsChange(id, {
//       startPoint: values[0],
//       endPoint: values[1],
//     });
//   },
//   [getSelectedSamples, handleSampleSettingsChange]
// );

// const handleSamplePointsChange = useCallback(
//   (
//     sampleId: string,
//     [startPoint, attackTime, releaseTime, endPoint]: number[]
//   ) => {
//     handleSampleSettingsChange(sampleId, {
//       startPoint,
//       attackTime,
//       releaseTime,
//       endPoint,
//     });
//   },
//   [handleSampleSettingsChange]
// );
