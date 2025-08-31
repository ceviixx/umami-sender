export function normalizeTag(tag?: string): string | null {
  if (!tag) return null;
  return tag.startsWith('v') ? tag : `v${tag}`;
}

export function isNewer(a: string, b: string): boolean {
  const pa = a.replace(/^v/, '').split('.');
  const pb = b.replace(/^v/, '').split('.');
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = parseInt(pa[i] || '0', 10);
    const nb = parseInt(pb[i] || '0', 10);
    if (na > nb) return true;
    if (na < nb) return false;
  }
  return false;
}
