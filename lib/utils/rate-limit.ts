import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * In-memory fixed-window rate limiter. Good enough for a single dev/local
 * instance; state is process-local and resets on redeploy. Before running
 * more than one server instance in production, swap this for a shared store
 * (e.g. Upstash Redis) behind the same `checkRateLimit` signature.
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= maxAttempts) return false;

  bucket.count += 1;
  return true;
}
