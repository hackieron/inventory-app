const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api';

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

/** Resolve Laravel-generated localhost asset URLs against the Expo API host. */
export function resolveMediaUrl(value: string): string;
export function resolveMediaUrl(value?: string | null): string | null;
export function resolveMediaUrl(value?: string | null): string | null {
  if (!value) return null;

  try {
    const assetUrl = new URL(value);
    const configuredUrl = new URL(apiUrl);

    // Cloudflare tunnels redirect HTTP to HTTPS. Browsers reject that redirect
    // during authenticated CORS/preflight image requests, so normalize remote
    // asset URLs before React Native/Web fetches them.
    if (!isLocalHost(assetUrl.hostname)) {
      if (assetUrl.protocol === 'http:') assetUrl.protocol = 'https:';
      return assetUrl.toString();
    }

    return `${configuredUrl.origin}${assetUrl.pathname}${assetUrl.search}`;
  } catch {
    return value;
  }
}
