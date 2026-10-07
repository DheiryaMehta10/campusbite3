import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UniBite — Order Smart. Delivered by Slot.',
  description: 'Scheduled slot-based hostel delivery platform for food, groceries, and medical essentials.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
