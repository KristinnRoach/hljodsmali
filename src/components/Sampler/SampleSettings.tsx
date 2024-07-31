// components/SampleSettings.tsx
'use client';
import React, { useState } from 'react';
import { SampleRecord, Sample_settings } from '../../types/sample';
import { useSamplerCtx } from '../../contexts/sampler-context';
import { useSampleSettings } from '../../hooks/useSampleSettings';
import BasicSlider from '../UI/Basic/BasicSlider';
import styles from './Sampler.module.scss';

const SampleSettings: React.FC = () => {
  const {
    latestSelectedSample,
    latestSelectedBuffer,
    isSampleLoaded,
    isSampleSelected,
  } = useSamplerCtx();
  // QUICK FIX: add bufferDuration to latestSelectedSample or sampleRecord or samplesettings types
  const { handleSettingChange } = useSampleSettings();

  const C5_DURATION_SEC = 0.00191117077819399; // just a constant for now

  const sample = latestSelectedSample as SampleRecord;
  const settings = sample.sample_settings as Sample_settings;

  const {
    startPoint, // remove
    endPoint,
    loopStart,
    loopEnd,

    attackTime,
    releaseTime,
    lowCutoff,
    highCutoff,
  } = settings;

  const bufferDuration = latestSelectedBuffer?.duration ?? 0;
  // if (!bufferDuration)
  //   throw new Error('Buffer duration is missing in SampleSettings');
  // const playDuration = endPoint - startPoint;
  // const loopDuration = loopEnd - loopStart;

  const [durationHasChanged, setDurationHasChanged] = useState(false);
  const [loopDurationHasChanged, setLoopDurationHasChanged] = useState(false);

  const handleStartChange = (value: number) => {
    handleSettingChange('startPoint', value);
    setDurationHasChanged(true);
    if (!loopDurationHasChanged) {
      handleSettingChange('loopStart', value);
    }
  };

  const handleEndChange = (value: number) => {
    handleSettingChange('endPoint', value);
    setDurationHasChanged(true);
    if (!loopDurationHasChanged) {
      handleSettingChange('loopEnd', value);
    }
  };

  const handleLoopStartChange = (value: number) => {
    if (loopEnd - value < C5_DURATION_SEC - 0.0001) return;

    handleSettingChange('loopStart', value);
    setLoopDurationHasChanged(true);
    if (!durationHasChanged) {
      handleSettingChange('startPoint', value);
    }
  };

  const handleLoopEndChange = (value: number) => {
    if (value - loopStart < C5_DURATION_SEC - 0.0001) return;

    handleSettingChange('loopEnd', value);
    setLoopDurationHasChanged(true);
    if (!durationHasChanged) {
      handleSettingChange('endPoint', value);
    }
  };

  return (
    <>
      {sample && isSampleLoaded(sample.id) && isSampleSelected(sample.id) && (
        <section className={styles.sample_settings}>
          <div key={sample.id} title={sample.name}>
            {/* <WaveDynamic
          buffer={buffer}
          width={800}
          height={200}
          loopStart={loopStart}t
          loopEnd={loopEnd}
          startPoint={startPoint}
          endPoint={endPoint}
        /> */}
            <h2>{sample.name}</h2>
            <BasicSlider
              label='Start'
              value={startPoint}
              min={0}
              max={bufferDuration}
              step={0.001}
              onChange={handleStartChange}
              maxDynamic={endPoint - 0.0001}
            />
            <BasicSlider
              label='End'
              value={endPoint}
              min={0}
              max={bufferDuration}
              step={0.001}
              onChange={handleEndChange}
              minDynamic={startPoint + 0.0001}
            />
            <BasicSlider
              label='Loop Start'
              value={loopStart ?? 0}
              min={0}
              max={bufferDuration}
              step={0.0001}
              onChange={handleLoopStartChange}
              maxDynamic={loopEnd - 0.0001}
            />
            <BasicSlider
              label='Loop End'
              value={loopEnd ?? bufferDuration}
              min={0}
              max={bufferDuration}
              step={0.001}
              onChange={handleLoopEndChange}
              minDynamic={loopStart + 0.0001}
            />
            <BasicSlider
              label='Attack'
              value={attackTime}
              min={0}
              max={bufferDuration}
              step={0.0001}
              onChange={(value) => handleSettingChange('attackTime', value)}
            />
            <BasicSlider
              label='Release'
              value={releaseTime}
              min={0.01}
              max={bufferDuration}
              step={0.0001}
              onChange={(value) => handleSettingChange('releaseTime', value)}
            />
            <BasicSlider
              label='LowCut'
              value={lowCutoff ?? 40}
              min={20}
              max={20000}
              step={0.0001}
              onChange={(value) => handleSettingChange('lowCutoff', value)}
              isLogarithmic={true}
            />
            <BasicSlider
              label='HighCut'
              value={highCutoff ?? 20000}
              min={20}
              max={20000}
              step={0.0001}
              onChange={(value) => handleSettingChange('highCutoff', value)}
              isLogarithmic={true}
            />
          </div>
        </section>
      )}
    </>
  );
};

export default SampleSettings;

// // components/SampleSettings.tsx
// import React, { useState } from 'react';
// import { useSamplerCtx } from '../../contexts/sampler-context';
// import { useSampleSettings } from '../../hooks/useSampleSettings';
// import { Sample_settings } from '../../types/sample';

// import BasicSlider from '../UI/Basic/BasicSlider';
// import styles from './Sampler.module.scss';

// const SampleSettings: React.FC = () => {
//   const { getSingleSelectedSample, getSelectedSamples } = useSamplerCtx();
//   const { handleSettingChange } = useSampleSettings();

//   const currentSample = getSingleSelectedSample();
//   const selectedSamples = getSelectedSamples();

//   const [durationHasChanged, setDurationHasChanged] = useState(false);
//   const [loopDurationHasChanged, setLoopDurationHasChanged] = useState(false);

//   if (selectedSamples.length === 0 || !currentSample) return null;

//   return (
//     <section className={styles.sample_settings}>
//       {
//         const { startPoint, endPoint, loopStart, loopEnd } =
//         currentSample.sample_settings;

//         const handleStartChange = (value: number) => {
//           handleSettingChange('startPoint', value);

//           setDurationHasChanged(true);

//           if (!loopDurationHasChanged) {
//             handleSettingChange('loopStart', value);
//           }
//         };

//         const handleEndChange = (value: number) => {
//           handleSettingChange('endPoint', value);

//           setDurationHasChanged(true);

//           if (!loopDurationHasChanged) {
//             handleSettingChange('loopEnd', value);
//           }
//         };

//         const handleLoopStartChange = (value: number) => {
//           // if (value - loopEnd <= 4) {
//           //   value = 3.82234155638498; // C4
//           // }
//           console.log(value - loopEnd);
//           handleSettingChange('loopStart', value);
//           setLoopDurationHasChanged(true);

//           if (!durationHasChanged) {
//             handleSettingChange('startPoint', value);
//           }
//         };

//         const handleLoopEndChange = (value: number) => {
//           handleSettingChange('loopEnd', value);
//           setLoopDurationHasChanged(true);

//           if (!durationHasChanged) {
//             handleSettingChange('endPoint', value);
//           }
//         };
//       }

//         return (
//           <div key={sample.id} title={sample.name}>
//             {/* tabIndex={-1} */}
//             <h2>{sample.name}</h2>
//             <BasicSlider
//               label='Start'
//               value={sample.sample_settings.startPoint}
//               min={0}
//               max={bufferDuration}
//               step={0.001}
//               onChange={handleStartChange}
//               maxDynamic={endPoint - 0.001} // TEMP FIX 0.01
//             />
//             <BasicSlider
//               label='End'
//               value={sample.sample_settings.endPoint}
//               min={0}
//               max={bufferDuration}
//               step={0.001}
//               onChange={handleEndChange}
//               minDynamic={startPoint + 0.0001} // TEMP FIX 0.01
//             />
//             <BasicSlider
//               label='Loop Start'
//               value={sample.sample_settings.loopStart ?? 0}
//               min={0}
//               max={bufferDuration}
//               step={0.0001}
//               onChange={handleLoopStartChange}
//               maxDynamic={loopEnd - 0.0001} // TEMP FIX 0.01
//             />
//             <BasicSlider
//               label='Loop End'
//               value={sample.sample_settings.loopEnd ?? bufferDuration}
//               min={0}
//               max={bufferDuration}
//               step={0.001}
//               onChange={handleLoopEndChange}
//               minDynamic={loopStart + 0.0001} // TEMP FIX 0.01
//             />
//             <BasicSlider
//               label='Attack'
//               value={sample.sample_settings.attackTime}
//               min={0}
//               max={bufferDuration}
//               step={0.001}
//               onChange={(value) => handleSettingChange('attackTime', value)}
//             />
//             <BasicSlider
//               label='Release'
//               value={sample.sample_settings.releaseTime}
//               min={0.01}
//               max={bufferDuration}
//               step={0.001}
//               onChange={(value) => handleSettingChange('releaseTime', value)}
//             />
//             <BasicSlider
//               label='LowCut'
//               value={sample.sample_settings.lowCutoff ?? 40}
//               min={20}
//               max={20000}
//               step={0.01}
//               onChange={(value) => handleSettingChange('lowCutoff', value)}
//               isLogarithmic={true}
//             />
//             <BasicSlider
//               label='HighCut'
//               value={sample.sample_settings.highCutoff ?? 20000}
//               min={20}
//               max={20000}
//               step={0.01}
//               onChange={(value) => handleSettingChange('highCutoff', value)}
//               isLogarithmic={true}
//             />

//           </div>
//         );
//       {/* })} */}
//     </section>
//   );
// };

// export default SampleSettings;

// import MultiPointSlider from '../UI/Basic/MultiPointSlider';
// import MultiRangeSlider from '../UI/Basic/MultiRangeSlider';
// import DualFilterSlider from '../UI/Basic/DualFilterSlider';

/* <DualFilterSlider // currently not working
              lowCutoff={sample.sample_settings.lowCutoff ?? 40}
              highCutoff={sample.sample_settings.highCutoff ?? 20000}
              onFilterChange={(lowCutoff: number, highCutoff: number) => {
                handleSettingChange('lowCutoff', lowCutoff);
                handleSettingChange('highCutoff', highCutoff);
              }}
            /> */
/* Add other SliderInputs for remaining settings */
/* <MultiRangeSlider
              min={0}
              max={10}
              onChange={(value: { min: number; max: number }) => {
                console.log(value);
              }}
            /> */

/* <MultiPointSlider
              min={0}
              max={bufferDuration}
              points={points}
              onChange={(newPoints) => {
                newPoints.forEach((point) => {
                  handleSettingChange(
                    point.id as keyof Sample_settings,
                    point.value
                  );
                });
              }}
            /> */

// // src/components/SamplerControls.tsx
// 'use client';

// import React, { useCallback, useEffect, useState } from 'react';
// import { useSamplerCtx } from '../../contexts/sampler-context';
// import { Sample_db, Sample_settings } from '../../types/sample';
// import DualFilterSlider from '../UI/Basic/DualFilterSlider';

// import styles from './Sampler.module.scss';

// const SampleSettings: React.FC = () => {
//   const { getSelectedSamples, updateSampleSettings } = useSamplerCtx();

//   const handleSampleSettingsChange = useCallback(
//     (sampleId: string, settings: Partial<Sample_settings>) => {
//       updateSampleSettings(sampleId, settings);
//     },
//     [updateSampleSettings]
//   );

//   const handleAttackTimeChange = useCallback(
//     (event: React.ChangeEvent<HTMLInputElement>) => {
//       event.preventDefault();
//       event.stopPropagation();
//       event.nativeEvent.stopImmediatePropagation();
//       const value = parseFloat(event.target.value);
//       const selectedSamples = getSelectedSamples();
//       selectedSamples.forEach((sample) => {
//         handleSampleSettingsChange(sample.id, { attackTime: value });
//       });
//     },
//     [getSelectedSamples, handleSampleSettingsChange]
//   );

//   const handleReleaseTimeChange = useCallback(
//     (event: React.ChangeEvent<HTMLInputElement>) => {
//       const value = parseFloat(event.target.value);
//       const selectedSamples = getSelectedSamples();
//       selectedSamples.forEach((sample) => {
//         handleSampleSettingsChange(sample.id, { releaseTime: value });
//       });
//     },
//     [getSelectedSamples, handleSampleSettingsChange]
//   );

//   const handleStartPointChange = useCallback(
//     (event: React.ChangeEvent<HTMLInputElement>) => {
//       const value = parseFloat(event.target.value);
//       const selectedSamples = getSelectedSamples();
//       selectedSamples.forEach((sample) => {
//         handleSampleSettingsChange(sample.id, { startPoint: value });
//       });
//     },
//     [getSelectedSamples, handleSampleSettingsChange]
//   );

//   const handleEndPointChange = useCallback(
//     (event: React.ChangeEvent<HTMLInputElement>) => {
//       const value = parseFloat(event.target.value);
//       const selectedSamples = getSelectedSamples();
//       selectedSamples.forEach((sample) => {
//         handleSampleSettingsChange(sample.id, { endPoint: value });
//       });
//     },
//     [getSelectedSamples, handleSampleSettingsChange]
//   );

//   const handleLoopStartChange = useCallback(
//     (event: React.ChangeEvent<HTMLInputElement>) => {
//       const value = parseFloat(event.target.value);
//       const selectedSamples = getSelectedSamples();
//       selectedSamples.forEach((sample) => {
//         handleSampleSettingsChange(sample.id, { loopStart: value });
//       });
//     },
//     [getSelectedSamples, handleSampleSettingsChange]
//   );

//   const handleLoopEndChange = useCallback(
//     (event: React.ChangeEvent<HTMLInputElement>) => {
//       const value = parseFloat(event.target.value);
//       const selectedSamples = getSelectedSamples();
//       selectedSamples.forEach((sample) => {
//         handleSampleSettingsChange(sample.id, { loopEnd: value });
//       });
//     },
//     [getSelectedSamples, handleSampleSettingsChange]
//   );

//   return (
//     <>
//       {getSelectedSamples().length > 0 && (
//         <section className={styles.sample_settings}>
//           {getSelectedSamples().map((s) => (
//             <div
//               key={s.id}
//               title={s.name}
//               tabIndex={-1}
//               // onClickCapture={(e) => {
//               //   e.preventDefault();
//               //   e.stopPropagation();
//               // }}
//             >
//               <h2>{s.name}</h2>
//               <label>Attack</label>
//               <input
//                 type='range'
//                 min='0'
//                 max={s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.attackTime}
//                 onChange={handleAttackTimeChange}
//                 tabIndex={-1} // prevent focus doesnt work
//               />

//               <label>Release</label>
//               <input
//                 type='range'
//                 min='0.01'
//                 max={s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.releaseTime}
//                 onChange={handleReleaseTimeChange}
//                 tabIndex={-1}
//               />

//               <label>Start</label>
//               <input
//                 type='range'
//                 min='0'
//                 max={s.sample_settings?.endPoint ?? s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.startPoint}
//                 onChange={handleStartPointChange}
//                 tabIndex={-1}
//               />

//               <label>End</label>
//               <input
//                 type='range'
//                 min={s.sample_settings?.startPoint}
//                 max={s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.endPoint ?? s.bufferDuration}
//                 onChange={handleEndPointChange}
//                 tabIndex={-1}
//               />

//               <label>Loop Start</label>
//               <input
//                 type='range'
//                 min='0'
//                 max={s.sample_settings?.loopEnd ?? s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.loopStart ?? 0}
//                 onChange={handleLoopStartChange}
//                 tabIndex={-1}
//               />

//               <label>Loop End</label>
//               <input
//                 type='range'
//                 min={s.sample_settings?.loopStart ?? 0}
//                 max={s.bufferDuration}
//                 step='0.01'
//                 value={s.sample_settings?.loopEnd ?? s.bufferDuration}
//                 onChange={handleLoopEndChange}
//                 tabIndex={-1}
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
//                 tabIndex={-1}
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
//                 tabIndex={-1}
//               />
//             </div>
//           ))}
//         </section>
//       )}
//     </>
//   );
// };

// export default SampleSettings;

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
//                 bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'releaseTime',
//                 'Release Time',
//                 0.01,
//                 bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'startPoint',
//                 'Start',
//                 0,
//                 sample.sample_settings.endPoint ?? bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'endPoint',
//                 'End',
//                 sample.sample_settings.startPoint ?? 0,
//                 bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'loopStart',
//                 'Loop Start',
//                 0,
//                 sample.sample_settings.loopEnd ?? bufferDuration
//               )}
//               {renderControl(
//                 sample,
//                 'loopEnd',
//                 'Loop End',
//                 sample.sample_settings.loopStart ?? 0,
//                 bufferDuration
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
