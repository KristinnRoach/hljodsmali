import {
  createAnalyser,
  createMediaStreamSource,
} from './audio-utils/audioCtx-utils';

export default class VolumeMonitor {
  private analyser: AnalyserNode | null = null;
  private detectionLoop: number | null = null;
  private source: MediaStream | null = null;

  public constructor(source: MediaStream) {
    this.source = source;
    this.analyser = createAnalyser();
    createMediaStreamSource(source).connect(this.analyser);
  }

  getVolume(): number | null {
    if (!this.analyser) return null;

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const average = sum / data.length;

    return 20 * Math.log10(average / 255); // dB
  }

  monitorVolume(onVolume: (volume: number) => void): void {
    if (!this.source) return;

    const decibels = this.getVolume();
    if (decibels !== null) {
      onVolume(decibels);
    }

    this.detectionLoop = requestAnimationFrame(() =>
      this.monitorVolume(onVolume)
    );
  }

  stopMonitoringStream(): void {
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.detectionLoop) {
      cancelAnimationFrame(this.detectionLoop);
      this.detectionLoop = null;
    }

    this.source = null;
  }
}

// export default class VolumeMonitor {
//   private audioContext: AudioContext;
//   private analyser: AnalyserNode;
//   private streamSource: MediaStreamAudioSourceNode;
//   private dataArray: Uint8Array;

//   constructor(stream: MediaStream) {
//     const AudioContextClass =
//       window.AudioContext || (window as any).webkitAudioContext;
//     this.audioContext = new AudioContextClass();
//     this.analyser = this.audioContext.createAnalyser();
//     this.analyser.fftSize = 2048; // Check if this is appropriate
//     this.analyser.smoothingTimeConstant = 0.8; // Adjust if necessary
//     this.streamSource = this.audioContext.createMediaStreamSource(stream);
//     this.streamSource.connect(this.analyser);
//     this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
//   }

//   monitorVolume(callback: (dB: number) => void): void {
//     const processVolume = () => {
//       this.analyser.getByteFrequencyData(this.dataArray);
//       let values = 0;

//       for (let i = 0; i < this.dataArray.length; i++) {
//         values += this.dataArray[i];
//       }

//       const average = values / this.dataArray.length;
//       const dB = 20 * Math.log10(average / 255); // Conversion to dB
//       callback(dB);

//       requestAnimationFrame(processVolume);
//     };

//     processVolume();
//   }

//   stopMonitoringStream(): void {
//     if (this.streamSource) {
//       this.streamSource.disconnect();
//     }
//     this.audioContext.close();
//   }
// }
