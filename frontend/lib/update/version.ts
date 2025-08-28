import pkg from "../../package.json";

export function getCurrentVersion(): string {
  const v = (pkg as any).version as string | undefined;
  if (!v) return "unknown";
  return v.startsWith("v") ? v : `v${v}`;
}
