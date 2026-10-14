import type { Metadata } from 'next';
import './globals.css';
import { AutomationProvider } from '@/context/AutomationContext';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Enquiry and Quotation Automation System — Apex Freight Demo',
  description:
    'Modern enterprise frontend UI demo for logistics, freight forwarding, and courier enquiry-to-quote automation workflow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AutomationProvider>
          <AppLayout>{children}</AppLayout>
        </AutomationProvider>
      </body>
    </html>
  );
}
