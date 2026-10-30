import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // A static export has no server to run the Image Optimization API, and the
    // default loader errors out under `output: "export"`. The project images
    // are already cropped and sized for the card they render in, so serving
    // them as-is costs nothing.
    unoptimized: true,
  },
};

export default nextConfig;
