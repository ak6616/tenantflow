import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import DemoModeBanner from "@/components/demo-mode-banner";

export const metadata: Metadata = {
  title: "TenantFlow — Multi-tenant SaaS CRM",
  description: "Manage leads, sales pipelines, and subscriptions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      <DemoModeBanner />
      </body>
    </html>
  );
}
