// src/lib/recording/AudioRecorder.ts

import { APP_FORMATS, FormatKey, AudioFormat } from '../../../types/mimeTypes';

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioFormatKey: FormatKey = 'WEBM';

  constructor(formatKey: FormatKey = 'WEBM') {
    // this.setAudioFormat(formatKey); // DOES NOT WORK - FIX OR REMOVE
    this.audioFormatKey = formatKey; // temp fix
  }

  setAudioFormat(formatKey: FormatKey): void {
    if (this.isFormatSupported(formatKey)) {
      this.audioFormatKey = formatKey;
      return;
    }

    const alternativeKey = this.findSupportedFormat();

    if (alternativeKey) {
      this.handleUnsupportedFormat(formatKey, alternativeKey);
    } else {
      throw new Error('No supported audio format found in this browser.');
    }
  }

  private isFormatSupported(key: FormatKey): boolean {
    return MediaRecorder.isTypeSupported(APP_FORMATS[key].mimeType);
  }

  private findSupportedFormat(): FormatKey | undefined {
    return (Object.keys(APP_FORMATS) as FormatKey[]).find((key) =>
      this.isFormatSupported(key)
    );
  }

  private handleUnsupportedFormat(
    requestedKey: FormatKey,
    alternativeKey: FormatKey
  ): void {
    const userConfirmed = confirm(
      `The requested audio format (${APP_FORMATS[requestedKey].mimeType}) is not supported by your browser. ` +
        `Would you like to use ${APP_FORMATS[alternativeKey].mimeType} instead?`
    );

    if (userConfirmed) {
      this.audioFormatKey = alternativeKey;
      console.warn(
        `Using ${APP_FORMATS[alternativeKey].mimeType} instead of ${APP_FORMATS[requestedKey].mimeType}.`
      );
    } else {
      console.warn(
        'User declined to use the alternative format. Keeping the current format.'
      );
    }
  }

  getAudioFormatKey(): FormatKey {
    return this.audioFormatKey;
  }

  getAudioFormatInfo(): AudioFormat {
    return APP_FORMATS[this.audioFormatKey];
  }

  async setup(): Promise<void> {
    console.log(
      'APP_FORMATS[this.audioFormatKey].mimeType: ',
      APP_FORMATS[this.audioFormatKey].mimeType
    );

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      // this.stream, {
      //   mimeType: APP_FORMATS[this.audioFormatKey].mimeType,
      // });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
    } catch (error) {
      console.error('Failed to setup recording:', error);
      throw error;
    }
  }

  async start(formatKey?: FormatKey): Promise<void> {
    if (this.isRecording()) {
      throw new Error('Recording already in progress');
    }
    if (formatKey) {
      // this.setAudioFormat(formatKey); // DOES NOT WORK - FIX OR REMOVE
      this.audioFormatKey = formatKey; // temp fix
    }
    await this.setup();
    this.recordedChunks = [];
    this.mediaRecorder?.start();
  }

  async stop(): Promise<Blob> {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      throw new Error('Recording is not in progress');
    }

    return new Promise((resolve, reject) => {
      const blob = new Blob(this.recordedChunks, {
        type: APP_FORMATS[this.audioFormatKey].mimeType,
      });

      this.mediaRecorder!.onstop = () => {
        if (blob.size === 0) {
          reject(new Error('No audio data recorded'));
        } else {
          resolve(blob);
        }
      };

      this.mediaRecorder?.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  dispose(): void {
    this.recordedChunks = [];

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}

// export class AudioRecorder {
//   private mediaRecorder: MediaRecorder | null = null;
//   private recordedChunks: Blob[] = [];
//   private stream: MediaStream | null = null;
//   private audioFormat: AudioFormat = APP_FORMATS.OGG;
//   private audioFormatKey: FormatKey;

//   constructor(formatKey: FormatKey = 'OGG') {
//     this.setAudioFormat(formatKey);
//     this.audioFormatKey = formatKey;
//   }

//   setAudioFormat(formatKey: FormatKey): void {
//     const requestedFormat = APP_FORMATS[formatKey];

//     if (this.isFormatSupported(formatKey)) {
//       this.audioFormat = requestedFormat;
//       this.audioFormatKey = formatKey;
//       return;
//     }

//     const alternativeKey = this.findSupportedFormat();

//     if (alternativeKey) {
//       this.handleUnsupportedFormat(formatKey, alternativeKey);
//     } else {
//       throw new Error('No supported audio format found in this browser.');
//     }
//   }

//   private isFormatSupported(key: FormatKey): boolean {
//     return MediaRecorder.isTypeSupported(APP_FORMATS[key].mimeType);
//   }

//   private findSupportedFormat(): FormatKey | undefined {
//     return (Object.keys(APP_FORMATS) as FormatKey[]).find((key) =>
//       this.isFormatSupported(key)
//     );
//   }

//   private handleUnsupportedFormat(
//     requestedKey: FormatKey,
//     alternativeKey: FormatKey
//   ): void {
//     // replace this with a user-friendly custom modal for production
//     const requestedFormat = APP_FORMATS[requestedKey];
//     const alternativeFormat = APP_FORMATS[alternativeKey];
//     const userConfirmed = confirm(
//       `The requested audio format (${requestedFormat.mimeType}) is not supported by your browser. ` +
//         `Would you like to use ${alternativeFormat.mimeType} instead?`
//     );

//     if (userConfirmed) {
//       this.audioFormat = alternativeFormat;
//       this.audioFormatKey = alternativeKey;
//       console.warn(`Using ${alternativeFormat} instead of ${requestedFormat}.`);
//     } else {
//       console.warn(
//         'User declined to use the alternative format. Keeping the current format.'
//       );
//     }
//   }

//   getAudioFormat(): AudioFormat {
//     return this.audioFormat;
//   }

//   getAudioFormatKey(): FormatKey {
//     return this.audioFormatKey;
//   }

//   async setup(): Promise<void> {
//     // if (this.mediaRecorder) return;

//     try {
//       this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       this.mediaRecorder = new MediaRecorder(this.stream, {
//         mimeType: this.audioFormat.mimeType,
//       });

//       this.mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           this.recordedChunks.push(event.data);
//         }
//       };
//     } catch (error) {
//       console.error('Failed to setup recording:', error);
//       throw error;
//     }
//   }

//   async start(formatKey?: FormatKey): Promise<void> {
//     if (this.isRecording()) {
//       throw new Error('Recording already in progress');
//     }
//     if (formatKey) {
//       this.setAudioFormat(formatKey);
//     }
//     await this.setup();
//     this.recordedChunks = [];
//     this.mediaRecorder?.start();
//   }

//   async stop(): Promise<Blob> {
//     if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
//       throw new Error('Recording is not in progress');
//     }

//     return new Promise((resolve, reject) => {
//       const blob = new Blob(this.recordedChunks, {
//         type: this.audioFormat.mimeType,
//       });

//       this.mediaRecorder!.onstop = () => {
//         if (blob.size === 0) {
//           reject(new Error('No audio data recorded'));
//         } else {
//           resolve(blob);
//         }
//       };

//       this.mediaRecorder?.stop();
//     });
//   }

//   isRecording(): boolean {
//     return this.mediaRecorder?.state === 'recording';
//   }

//   dispose(): void {
//     this.recordedChunks = [];

//     if (!this.mediaRecorder) return;
//     this.mediaRecorder?.stop();
//     this.mediaRecorder = null;

//     if (!this.stream) return;
//     this.stream?.getTracks().forEach((track) => track.stop());
//     this.stream = null;
//   }
// }
