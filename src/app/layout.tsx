import type { Metadata } from 'next';

import '../styles/globals.scss';
import ReactAudioCtxProvider from '../contexts/react-audio-context';
import AudioDeviceProvider from '../contexts/audio-device-context';
import SamplerProvider from '../contexts/sampler-context';

export const metadata: Metadata = {
  title: 'Hljóðsmali!',
  description: 'vóts, get é bra spilaðá hvað sem er??',
};

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
            <SamplerProvider>{children}</SamplerProvider>
          </ReactAudioCtxProvider>
        </AudioDeviceProvider>
      </body>
    </html>
  );
}
