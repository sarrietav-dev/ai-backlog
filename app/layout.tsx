import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "AI Product Backlog - Generate User Stories with AI",
  description: "Transform your product ideas into well-structured user stories using AI. Create multiple backlogs, chat with AI, and track progress with kanban boards.",
  keywords: ["AI", "product management", "user stories", "backlog", "kanban", "GPT-4", "agile", "project management"],
  authors: [{ name: "AI Product Backlog" }],
  creator: "AI Product Backlog",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    title: "AI Product Backlog - Generate User Stories with AI",
    description: "Transform your product ideas into well-structured user stories using AI. Create multiple backlogs, chat with AI, and track progress with kanban boards.",
    siteName: "AI Product Backlog",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Product Backlog - Generate User Stories with AI",
    description: "Transform your product ideas into well-structured user stories using AI. Create multiple backlogs, chat with AI, and track progress with kanban boards.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
