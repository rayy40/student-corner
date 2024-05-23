import "./globals.css";

import { Roboto } from "next/font/google";

import Navbar from "@/components/Navbar";
import { NextTopLoader } from "@/components/next-top-loader";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Navbar />
        <NextTopLoader />
        {children}
      </body>
    </html>
  );
}
