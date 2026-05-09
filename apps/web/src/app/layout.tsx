import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "과연",
  description: "학교와 학과만으로 확인하는 전공 기반 커리어 인사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
