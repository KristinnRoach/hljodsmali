export const recorder = {
  // isRecording: false,
  // mediaRecorder: null as MediaRecorder | null,
  // startRecording: async (
  //   setAudioSourceCallback: (source: string) => void
  // ): Promise<void> => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //     recorder.mediaRecorder = new MediaRecorder(stream);
  //     const recordedChunks: Blob[] = [];
  //     recorder.mediaRecorder.ondataavailable = (event: BlobEvent) => {
  //       recordedChunks.push(event.data);
  //     };
  //     recorder.mediaRecorder.onstop = () => {
  //       const blob = new Blob(recordedChunks, { type: 'audio/ogg' });
  //       const recordedUrl = URL.createObjectURL(blob);
  //       setAudioSourceCallback(recordedUrl);
  //       recordedChunks.length = 0;
  //     };
  //     recorder.isRecording = true;
  //     recorder.mediaRecorder.start();
  //   } catch (error) {
  //     console.error('Error accessing microphone:', error);
  //   }
  // },
  // stopRecording: (): void => {
  //   const mrStream = recorder.mediaRecorder.stream;
  //   if (mrStream) {
  //     mrStream.getTracks().forEach((track) => {
  //       track.stop();
  //     });
  //     recorder.isRecording = false;
  //   }
  // },
};
