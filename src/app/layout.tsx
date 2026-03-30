import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

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
      </body>
    </html>
  );
}
