import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import '../styles/globals.scss';
import ReactAudioCtxProvider from '../contexts/react-audio-context';
import AudioDeviceProvider from '../contexts/audio-device-context';

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
            <DynamicSamplerProvider>{children}</DynamicSamplerProvider>
          </ReactAudioCtxProvider>
        </AudioDeviceProvider>
      </body>
    </html>
  );
}
