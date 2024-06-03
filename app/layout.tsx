import "./globals.css";

import { Roboto } from "next/font/google";

import Navbar from "@/components/navbar";
import { NextTopLoader } from "@/components/next-top-loader";

export const metadata = {
  title: "Student Corner",
  description: "A place to prepare for your exams",
};

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
