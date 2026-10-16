import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {title:'Underchargers | Cashier Management',description:'Browser-local demo cashier and funds workflow'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
