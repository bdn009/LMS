import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import "./workspace.css";
import "./hub.css";
import { Provider } from "../store";
import { Navigation, Footer } from "../ui";
export const metadata: Metadata = {
  title: "Nu Study Hub — Your learning studio",
  applicationName: "Nu Study Hub",
  description:
    "Build practical skills with Nu Study Hub: hands-on video lessons, PDF workbooks, visual guides, and interactive quizzes in one learning space.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <Navigation />
          <main id="main">{children}</main>
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
