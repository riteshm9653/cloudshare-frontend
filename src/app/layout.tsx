import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloud Share",
  description: "Secure file sharing dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Header />
          <main className="container page-content">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
