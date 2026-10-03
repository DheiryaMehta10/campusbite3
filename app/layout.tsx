import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CampusBite - Campus Food Ordering & Delivery',
  description: 'Order Smart. Delivered by Slot. Campus Food Delivery Platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
