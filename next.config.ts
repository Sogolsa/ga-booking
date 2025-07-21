import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};

export default nextConfig;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
