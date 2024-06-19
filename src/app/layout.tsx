import type { Metadata } from 'next';

import '../styles/globals.scss';
import ReactAudioCtxProvider from '../contexts/react-audio-context';
import AudioDeviceProvider from '../contexts/audio-device-context';
import MediaSourceCtxProvider from '../contexts/media-source-context';
import ControlsCtxProvider from '../contexts/controls-context';
import FxCtxProvider from '../contexts/fx-context';
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
      <AudioDeviceProvider>
        <ReactAudioCtxProvider>
          <MediaSourceCtxProvider>
            <ControlsCtxProvider>
              <FxCtxProvider>
                <body>{children}</body>
              </FxCtxProvider>
            </ControlsCtxProvider>
          </MediaSourceCtxProvider>
        </ReactAudioCtxProvider>
      </AudioDeviceProvider>
    </html>
  );
}
