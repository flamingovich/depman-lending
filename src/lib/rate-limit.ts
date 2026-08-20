/**
 * Простой лимит запросов в памяти процесса: скользящее окно на IP.
 * Приложение живёт одним процессом под pm2, отдельное хранилище не нужно.
 */
type Hits = number[];

const globalForRateLimit = globalThis as unknown as {
  depmanRateLimit?: Map<string, Hits>;
};

function store() {
  if (!globalForRateLimit.depmanRateLimit) {
    globalForRateLimit.depmanRateLimit = new Map();
  }
  return globalForRateLimit.depmanRateLimit;
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export type RateLimitResult = {
  ok: boolean;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const map = store();
  const hits = (map.get(key) ?? []).filter((time) => now - time < windowMs);

  if (hits.length >= limit) {
    const oldest = hits[0] ?? now;
    map.set(key, hits);
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  hits.push(now);
  map.set(key, hits);

  // Чтобы карта не росла бесконечно от разовых заходов.
  if (map.size > 5000) {
    for (const [entryKey, entryHits] of map) {
      if (entryHits.every((time) => now - time >= windowMs)) map.delete(entryKey);
    }
  }

  return { ok: true, retryAfterSeconds: 0 };
}

export function tooManyRequests(message: string, retryAfterSeconds: number) {
  return Response.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
