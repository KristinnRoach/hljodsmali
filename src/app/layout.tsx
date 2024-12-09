import type { Metadata } from 'next';

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
          <SamplerEngineProvider>{children}</SamplerEngineProvider>
        </AudioDeviceProvider>
      </body>
    </html>
  );
}
