import type { NextConfig } from "next";
import { execSync } from "child_process";

// Polyfill ES2023 features for compatibility with Node 18
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function(compareFn) {
    return [...this].sort(compareFn);
  };
}
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function(start: any, deleteCount: any, ...items: any[]) {
    const copy = [...this];
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}
if (!Array.prototype.with) {
  Array.prototype.with = function(index: number, value: any) {
    const copy = [...this];
    const actualIndex = index < 0 ? copy.length + index : index;
    copy[actualIndex] = value;
    return copy;
  };
}

let tailscaleHost: string[] = [];
try {
  const statusStr = execSync("tailscale status --json", { encoding: "utf8" });
  const status = JSON.parse(statusStr);
  if (status.Self?.DNSName) {
    const host = status.Self.DNSName.replace(/\.$/, ""); // Remove trailing dot
    tailscaleHost.push(host);
  }
} catch (e) {
  // Tailscale might not be installed or running
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: tailscaleHost.length > 0 ? tailscaleHost : undefined,
};

export default nextConfig;
