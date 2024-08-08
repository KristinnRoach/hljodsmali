import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import ReactAudioCtxProvider from '../contexts/ReactAudioCtx';
import AudioDeviceProvider from '../contexts/audio-device-context';
// import AudioRecorderProvider from '../contexts/audio-recorder-context';

import '../styles/globals.scss';

export const metadata: Metadata = {
  title: 'Hljóðsmali!',
  description: 'vóts, get é bra spilaðá hvað sem er??',
};

const DynamicSamplerProvider = dynamic(
  () => import('../contexts/sampler-context'),
  { ssr: false }
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <AudioDeviceProvider>
          <ReactAudioCtxProvider>
            {/* <AudioRecorderProvider> */}
            <DynamicSamplerProvider>{children}</DynamicSamplerProvider>
            {/* </AudioRecorderProvider> */}
          </ReactAudioCtxProvider>
        </AudioDeviceProvider>
      </body>
    </html>
  );
}
