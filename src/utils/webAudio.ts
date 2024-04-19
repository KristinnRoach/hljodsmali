// let ctx;
// let audioEl;
// let mediaEl;
// let filter;

// const createADSR = (attackTime, decayTime, sustainLevel, releaseTime) => {
//   const gainNode = ctx.createGain();

//   gainNode.gain.value = 0;

//   gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + attackTime);

//   gainNode.gain.linearRampToValueAtTime(
//     sustainLevel,
//     ctx.currentTime + attackTime + decayTime
//   );

//   return gainNode;
// };

// function connect(ctx: AudioContext, mediaEl: MediaElementAudioSourceNode) {
//   filter = ctx.createBiquadFilter();

//   console.log(mediaEl);

//   mediaEl.connect(filter);

//   //   filter.connect(ctx.destination);

//   filter.frequency.value = 700;

//   const gain1 = createADSR(1, 1, 0.2, 3);

//   filter.connect(gain1);

//   gain1.connect(ctx.destination);
// }
