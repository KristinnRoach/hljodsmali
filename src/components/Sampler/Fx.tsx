import React from 'react';

import { useReactAudioCtx } from '../../contexts/react-audio-context';
import { useControlsCtx } from '../../contexts/controls-context';
import { useFxCtx } from '../../contexts/fx-context';

function Fx() {
  const audioCtx = useReactAudioCtx();

  function createReverb(
    audioCtx: AudioContext,
    reverbDuration: number = 2
  ): ConvolverNode {
    const convolver = audioCtx.createConvolver();
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * reverbDuration;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const decay = Math.exp((-3 * i) / length);
      impulseL[i] = (Math.random() * 2 - 1) * decay;
      impulseR[i] = (Math.random() * 2 - 1) * decay;
    }

    convolver.buffer = impulse;
    return convolver;
  }

  function applyReverb(
    sourceNode: AudioBufferSourceNode,
    convolver: ConvolverNode
  ) {
    sourceNode.connect(convolver);
    convolver.connect(sourceNode.context.destination);
  }

  function createDelay(audioCtx: AudioContext, time: number = 0.3) {
    const delay = audioCtx.createDelay();
    delay.delayTime.value = time;
  }

  function applyDelay(outGain: GainNode, time: number = 0.3) {}

  return <div></div>;
}

export default Fx;
