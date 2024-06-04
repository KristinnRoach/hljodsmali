const audioCtx = new (window.AudioContext ||
  (window as any).webkitAudioContext)();

export default audioCtx;
