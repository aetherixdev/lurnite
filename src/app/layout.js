import { Geist, Geist_Mono, Rubik } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "../components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata = {
  title: "Study Manager",
  description: "The one stop destination for all your study needs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} antialiased h-screen`}
      >
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
