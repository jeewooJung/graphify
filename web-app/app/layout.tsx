import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import { UserProvider } from "@/lib/auth/user-context";
import { getSessionUser } from "@/lib/auth/session";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Graphify Dashboard",
  description: "Knowledge graph visualization and management platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getSessionUser()

  return (
    <html
      lang="en"
      className={`${inter.variable} ${firaCode.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-screen bg-canvas text-text-primary">
        <UserProvider initialUser={initialUser}>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
