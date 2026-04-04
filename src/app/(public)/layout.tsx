import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XII Tel 13 Pre-order Portal",
  description: "Where delicious foods & beverages belongs. Experience the taste of joy in every bite.",
  openGraph: {
    title: "XII Tel 13 Pre-order Portal",
    description: "Where delicious foods & beverages belongs. Experience the taste of joy in every bite.",
    siteName: "XII Tel 13",
    images: [
      {
        url: "/Hero_bg.png",
        width: 1200,
        height: 630,
        alt: "XII Tel 13 Delicious Food",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XII Tel 13 Pre-order Portal",
    description: "Where delicious foods & beverages belongs. Experience the taste of joy in every bite.",
    images: ["/Hero_bg.png"],
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
