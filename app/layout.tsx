import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
});

export const metadata: Metadata = {
  title: "Aris Zhou Illustration Portfolio",
  description: "Portfolio of Aris Zhou, illustrator and visual artist.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className={`${baloo.variable} antialiased`}>
        <ThemeProvider />
        <Header />
        <main className="min-h-screen" style={{ paddingTop: "var(--header-spacing)" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
