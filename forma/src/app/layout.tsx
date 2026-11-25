import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import "./workspace.css";
import { Provider } from "../store";
import { Navigation, Footer } from "../ui";
export const metadata: Metadata = {
  title: "Forma — Your learning studio",
  description:
    "Learn design, development, and AI with hands-on video lessons, visual guides, and workbooks.",
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
