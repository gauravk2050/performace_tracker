import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Performance Tracker",
  description: "Track your daily activities, tasks, and performance metrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

