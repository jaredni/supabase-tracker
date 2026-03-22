import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "Task tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b bg-background sticky top-0 z-50">
          <div className="container mx-auto flex h-14 items-center px-6 gap-6">
            <Link href="/" className="font-semibold text-lg">
              Task Tracker
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/tasks"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Tasks
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
