import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { AuthSessionProvider } from "@/providers/session-provider";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const panchang = localFont({
  src: "./fonts/Panchang-Variable.woff2",
  variable: "--font-panchang",
  display: "swap",
  weight: "200 800",
});

const exconBold = localFont({
  src: "./fonts/Excon-Bold.woff2",
  variable: "--font-excon",
  display: "swap",
  weight: "700",
});

export const metadata: Metadata = {
  title: "NOVA",
  description: "Modern business management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${panchang.variable} ${exconBold.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=location.pathname;var onDashboard=p==="/dashboard"||p.indexOf("/dashboard/")===0;var t=localStorage.getItem("${THEME_STORAGE_KEY}");var r=document.documentElement;if(onDashboard&&t==="dark"){r.classList.add("dark");r.style.colorScheme="dark"}else{r.classList.remove("dark");r.style.colorScheme="light"}}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
