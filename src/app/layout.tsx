import type { Metadata } from 'next';
import './globals.css';
import GuestInitializer from './GuestInitializer';

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
                {children}
            </body>
        </html>
    );
}
