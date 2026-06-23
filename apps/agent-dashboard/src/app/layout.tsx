import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eve Agent Dashboard",
  description: "Monitor and manage AI agents and sandbox environments",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-50 text-gray-900">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <h1 className="text-2xl font-bold text-blue-600">Eve Agent Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor agents, sandboxes, and system metrics in real-time
              </p>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">{children}</main>

          <footer className="bg-gray-100 border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <p className="text-sm text-gray-600">© 2024 Eve Framework. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
