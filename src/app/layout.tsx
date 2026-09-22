import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/content/site";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "James Maradiaga — Lead DevOps Engineer",
    template: "%s · James Maradiaga",
  },
  description:
    "Lead DevOps Engineer in Guatemala. I design, automate and operate cloud infrastructure: Kubernetes, Terraform, CI/CD, observability and MLOps across AWS, Azure and GCP.",
  keywords: [
    "DevOps engineer",
    "Site Reliability Engineering",
    "SRE",
    "Kubernetes",
    "Terraform",
    "Infrastructure as Code",
    "AWS",
    "Azure",
    "GCP",
    "CI/CD",
    "MLOps",
    "Python",
    "Go",
    "cloud cost optimization",
    "observability",
  ],
  authors: [{ name: site.name, url: site.links.github }],
  creator: site.name,
  applicationName: `${site.name} — Engineering Portfolio`,
  category: "technology",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
    languages: { "en-US": "/", "es-GT": "/" },
    types: {
      // Advertises the markdown mirror so agents can find it without guessing
      // the path (AgentReady AR-READ-06 / AR-READ-09).
      "text/markdown": "/index.md",
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    type: "profile",
    firstName: "James",
    lastName: "Maradiaga",
    username: site.handle,
    title: "James Maradiaga — Lead DevOps Engineer",
    description:
      "Cloud infrastructure, Kubernetes, Infrastructure as Code, reliability and MLOps. Building reliable infrastructure for software that matters.",
    siteName: site.name,
    locale: "en_US",
    alternateLocale: ["es_GT"],
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "James Maradiaga — Lead DevOps Engineer",
    description:
      "Cloud infrastructure, Kubernetes, Infrastructure as Code, reliability and MLOps.",
    creator: "@Ancordss",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <script
          // Applies the stored language before paint so switching is instant
          // and hydration never disagrees with the DOM.
          dangerouslySetInnerHTML={{
            __html:
              "try{var g=localStorage.getItem('jm.lang');if(g==='es'||g==='en'){document.documentElement.lang=g}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full bg-night">
        <Providers>
          <a
            href="#home"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[90] focus:rounded-full focus:bg-sky focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <Nav />
          <main id="content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
