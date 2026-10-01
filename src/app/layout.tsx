import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo or Not Todo | Less talk. More done.",
  description: "Get your chaos in order. Todos, linked notes, shared workspaces, and races.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
