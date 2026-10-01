import type { NextConfig } from "next";

const configuration: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
};

export default configuration;
