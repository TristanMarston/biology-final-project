import type { Metadata } from 'next';
import './globals.css';
import GuestInitializer from './GuestInitializer';
import ScreenSizeOverlay from './_components/ScreenSizeOverlay';

export const metadata: Metadata = {
    title: 'Gene Fighters',
    description: 'Battle For Dominance',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={`overflow-hidden`}>
                <GuestInitializer />
                <ScreenSizeOverlay />
                {children}
            </body>
        </html>
    );
}
