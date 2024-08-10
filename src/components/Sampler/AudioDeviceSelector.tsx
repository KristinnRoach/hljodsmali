'use client';

import React from 'react';
import { useAudioDeviceCtx } from '../../contexts/audio-device-context';

function AudioDeviceSelector({ className }: { className?: string }) {
  const { inputs, outputs, inputID, outputID, setInputID, setOutputID } =
    useAudioDeviceCtx();

  return (
    <div className={className}>
      {/* <p>Input Device: </p> */}
      <select value={inputID} onChange={(e) => setInputID(e.target.value)}>
        {inputs.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Device ${device.deviceId}`}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AudioDeviceSelector;

/* Audio Output Devices API seems to be not supported (19.06.2024) */
// function handleOutputChange(e: React.ChangeEvent<HTMLSelectElement>) {
//   if (!navigator.mediaDevices.selectAudioOutput) {
//     console.log('selectAudioOutput() not supported.');
//     return;
//   } else {
//     setOutputID(e.target.value);
//     navigator.mediaDevices
//       .selectAudioOutput(e.target.value)
//       .then(() => {
//         console.log('Audio output device selected');
//       })
//       .catch((err) => {
//         console.error('Error selecting audio output device:', err);
//       });
//   }
// }

/* <p>Output: </p>
      <select value={outputID} onChange={(e) => handleOutputChange}>
        {outputs.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Device ${device.deviceId}`}
          </option>
        ))}
      </select> */
