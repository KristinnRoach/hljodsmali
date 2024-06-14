import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '../styles/globals.scss';
import ReactAudioCtxProvider from '../contexts/react-audio-context';
import MediaSourceCtxProvider from '../contexts/media-source-context';

const inter = Inter({ subsets: ['latin'] });

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
      <ReactAudioCtxProvider>
        <MediaSourceCtxProvider>
          <body>{children}</body>
        </MediaSourceCtxProvider>
      </ReactAudioCtxProvider>
    </html>
  );
}
