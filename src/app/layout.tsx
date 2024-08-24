import type { Metadata } from 'next';

// import AudioContextProvider from '../contexts/AudioCtxContext';
import AudioDeviceProvider from '../contexts/DevicesCtx';
import SamplerEngineProvider from '../contexts/EngineContext';

import '../styles/globals.scss';

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
          {/* <AudioContextProvider> */}
          <SamplerEngineProvider>{children}</SamplerEngineProvider>
          {/* </AudioContextProvider> */}
        </AudioDeviceProvider>
      </body>
    </html>
  );
}

// import dynamic from 'next/dynamic';
// import { AntdRegistry } from '@ant-design/nextjs-registry';

// const DynamicAudioContextProvider = dynamic(
//   () => import('../contexts/AudioCtxContext'),
//   {
//     ssr: false,
//   }
// );

// const DynamicEngineProvider = dynamic(
//   () => import('../contexts/EngineContext'),
//   {
//     ssr: false,
//   }
// );
