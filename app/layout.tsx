import type { Metadata } from "next";
import { HeroUIProvider } from "@heroui/react";
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
    <html lang="en">
      <body>
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </body>
    </html>
  );
}
