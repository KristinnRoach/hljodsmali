import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import ReactAudioCtxProvider from '../contexts/ReactAudioCtx';
import AudioDeviceProvider from '../contexts/DevicesCtx';
import { AntdRegistry } from '@ant-design/nextjs-registry';
// import AudioRecorderProvider from '../contexts/audio-recorder-context';

import '../styles/globals.scss';

export const metadata: Metadata = {
  title: 'Hljóðsmali!',
  description: 'vóts, get é bra spilaðá hvað sem er??',
};

// gera dynamic audioctx líka?
const DynamicSamplerProvider = dynamic(() => import('../contexts/SamplerCtx'), {
  ssr: false,
});

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
            <DynamicSamplerProvider>
              <AntdRegistry>{children}</AntdRegistry>
            </DynamicSamplerProvider>
            {/* </AudioRecorderProvider> */}
          </ReactAudioCtxProvider>
        </AudioDeviceProvider>
      </body>
    </html>
  );
}
