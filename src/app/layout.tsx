import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
// @ts-ignore: allow importing global CSS without type declarations
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import FacebookPixel from "@/components/FacebookPixel";
import { MetaPixel } from "@/components/meta-pixel";
import { NavbarServer } from "@/components/NavbarServer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jethro Laptops",
  description:
    "Jethro Laptops is a premium online store that offers a curated selection of high-quality laptops and accessories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <div className="mx-auto sm:px-0 ">
            <NavbarServer />
            {children}
            <Footer />/
          </div>
        </SessionProvider>
        <ToastContainer position="bottom-right" />
        {/* <FacebookPixel /> */}
      </body>
    </html>
  );
}
