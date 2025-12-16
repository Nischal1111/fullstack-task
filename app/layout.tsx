import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie App",
  description: "Full-stack movie application with pagination and recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
