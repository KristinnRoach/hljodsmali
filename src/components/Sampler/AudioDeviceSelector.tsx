import React from 'react';
import { useAudioDeviceCtx } from '../../contexts/audio-device-context';

function AudioDeviceSelector() {
  const { inputs, inputID, setInputID } = useAudioDeviceCtx();

  return (
    <div>
      <p>Input Device: </p>
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

/* Audio Output Devices API seems not supported yet (19.06.2024) */

// const { inputs, outputs, inputID, outputID, setInputID, setOutputID } =
// useAudioDeviceCtx();

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
