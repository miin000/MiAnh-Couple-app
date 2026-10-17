import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

const appFont = Nunito({
  variable: "--font-app",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FAF6F2",
};

export const metadata: Metadata = {
  title: "Mi & Anh — Không gian cho hai đứa",
  description: "Web app lưu giữ kỷ niệm, kết nối và cùng nhau trải nghiệm mỗi ngày.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${appFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAF6F2] text-[#201A1D]">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
