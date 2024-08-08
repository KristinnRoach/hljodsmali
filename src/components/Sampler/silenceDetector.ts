export function detectSilence(
  ctx: AudioContext,
  stream: MediaStream,
  onSoundEnd: () => void = () => {},
  onSoundStart: () => void = () => {},
  silence_delay: number = 500,
  min_decibels: number = -80
) {
  // const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  const streamNode = ctx.createMediaStreamSource(stream);
  streamNode.connect(analyser);
  analyser.minDecibels = min_decibels;

  const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
  let silence_start_time = performance.now();
  let isSilent = false; // trigger only once per silence event

  let rafId: number;

  function loop(time: number): void {
    rafId = requestAnimationFrame(loop);

    // requestAnimationFrame(loop); // we'll loop every 60th of a second to check
    analyser.getByteFrequencyData(data); // get current data
    if (data.some((v) => v)) {
      // if there is data above the given db limit
      if (isSilent) {
        isSilent = false;
        onSoundStart();
      }
      silence_start_time = time; // set it to now
    }
    if (!isSilent && time - silence_start_time > silence_delay) {
      onSoundEnd();
      isSilent = true;
    }
  }

  // Start the detection loop
  requestAnimationFrame(loop);
  // loop(performance.now());

  // Return a function to stop detection
  return () => {
    cancelAnimationFrame(rafId);
    // ctx.close();
  };
}

// function onSilence() {
//   console.log('silence');
// }
// function onSpeak() {
//   console.log('speaking');
// }

// navigator.mediaDevices
//   .getUserMedia({
//     audio: true,
//   })
//   .then((stream) => {
//     detectSilence(stream, onSilence, onSpeak);
//     // do something else with the stream
//   })
//   .catch(console.error);

/*

  function detectSilence(stream, onSoundEnd = _=>{}, onSoundStart = _=>{}, silence_delay = 500, min_decibels = -80) {
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  const streamNode = ctx.createMediaStreamSource(stream);
  streamNode.connect(analyser);
  analyser.minDecibels = min_decibels;

  const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
  let silence_start = performance.now();
  let triggered = false; // trigger only once per silence event

  function loop(time) {
    requestAnimationFrame(loop); // we'll loop every 60th of a second to check
    analyser.getByteFrequencyData(data); // get current data
    if (data.some(v => v)) { // if there is data above the given db limit
      if(triggered){
        triggered = false;
        onSoundStart();
        }
      silence_start = time; // set it to now
    }
    if (!triggered && time - silence_start > silence_delay) {
      onSoundEnd();
      triggered = true;
    }
  }
  loop();
}

let i = 0;

function onSilence() {
   log.textContent += 'silence\n';
   console.log("silence  ", i);
   i++;
}

let j = 0;

function onSpeak() {
   log.textContent += 'speaking\n';
      console.log("NOISE  ", j);
      j++;
}
    
navigator.mediaDevices.getUserMedia({
    audio: true
  })
  .then(stream => {
    detectSilence(stream, onSilence, onSpeak, 500, -70);
    // do something else with the stream
  }).catch(e=>log.textContent=e);

  */
