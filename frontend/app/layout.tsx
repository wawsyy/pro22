import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorFilter } from "./error-filter";

export const metadata: Metadata = {
  title: "Encrypted Household Debt Register",
  description: "Privacy-preserving debt management system using FHEVM",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`debt-bg text-foreground antialiased`}>
        <ErrorFilter />
        <div className="fixed inset-0 w-full h-full debt-bg z-[-20] min-w-[850px]"></div>
        <main className="flex flex-col max-w-screen-xl mx-auto pb-20 min-w-[850px]">
          <nav className="flex w-full px-3 md:px-0 h-fit py-10 justify-between items-center">
            <div className="flex items-center gap-4">
              <img
                src="/logo.svg"
                alt="Debt Register Logo"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Encrypted Debt Register</h1>
                <p className="text-sm text-gray-600">Privacy-Preserving Financial Management</p>
              </div>
            </div>
          </nav>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}

