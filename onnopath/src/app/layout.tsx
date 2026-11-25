import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/fraunces";
import "./globals.css";
import "./onnopath.css";
import { Provider } from "../store";
import { Navigation, Footer } from "../ui";

export const metadata: Metadata = {
  title: "OnnoPath — Guided Skill Paths & Studio Cohorts",
  applicationName: "OnnoPath",
  description:
    "Chart a different path with OnnoPath: guided multi-format skill tracks with video lessons, PDF workbooks, visual slide decks, and mastery checks.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="color-scheme"
          content="light dark"
          suppressHydrationWarning
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var s=localStorage.getItem("onnopath-color-scheme");if(s==="light"||s==="dark")document.querySelector(\'meta[name="color-scheme"]\').content=s;}catch{}',
          }}
        />
      </head>
      <body>
        <Provider>
          <a className="skip-link visually-hidden" href="#main-heading">
            Skip to main content
          </a>
          <Navigation />
          <main id="main">{children}</main>
          <Footer />
        </Provider>
      </body>
    </html>
  );
}

