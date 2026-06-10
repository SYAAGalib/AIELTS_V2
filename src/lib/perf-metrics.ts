// Lightweight client-side performance metrics for the dashboard.
// Tracks: route load times, preload success rate, query cache hit rate.
// Persisted in localStorage so the dashboard widget shows trends across sessions.

type RouteSample = { path: string; ms: number; ts: number };

type Metrics = {
  routes: RouteSample[];           // last N route navigations
  cacheHits: number;
  cacheMisses: number;
  preloadAttempts: number;
  preloadSuccess: number;
  preloadFail: number;
};

const KEY = "perf:metrics:v1";
const MAX_SAMPLES = 50;

function read(): Metrics {
  if (typeof window === "undefined")
    return { routes: [], cacheHits: 0, cacheMisses: 0, preloadAttempts: 0, preloadSuccess: 0, preloadFail: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("none");
    const parsed = JSON.parse(raw) as Metrics;
    return {
      routes: Array.isArray(parsed.routes) ? parsed.routes.slice(-MAX_SAMPLES) : [],
      cacheHits: parsed.cacheHits ?? 0,
      cacheMisses: parsed.cacheMisses ?? 0,
      preloadAttempts: parsed.preloadAttempts ?? 0,
      preloadSuccess: parsed.preloadSuccess ?? 0,
      preloadFail: parsed.preloadFail ?? 0,
    };
  } catch {
    return { routes: [], cacheHits: 0, cacheMisses: 0, preloadAttempts: 0, preloadSuccess: 0, preloadFail: 0 };
  }
}

function write(m: Metrics) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
    window.dispatchEvent(new CustomEvent("perf:metrics-updated"));
  } catch {}
}

export function getMetrics(): Metrics {
  return read();
}

export function resetMetrics() {
  write({ routes: [], cacheHits: 0, cacheMisses: 0, preloadAttempts: 0, preloadSuccess: 0, preloadFail: 0 });
}

export function recordRouteSample(path: string, ms: number) {
  const m = read();
  m.routes = [...m.routes, { path, ms, ts: Date.now() }].slice(-MAX_SAMPLES);
  write(m);
}

export function recordPreload(success: boolean) {
  const m = read();
  m.preloadAttempts += 1;
  if (success) m.preloadSuccess += 1;
  else m.preloadFail += 1;
  write(m);
}

export function recordCacheOutcome(hit: boolean) {
  const m = read();
  if (hit) m.cacheHits += 1;
  else m.cacheMisses += 1;
  write(m);
}

export function computeSummary(m: Metrics) {
  const routes = m.routes;
  const avg = routes.length ? Math.round(routes.reduce((a, r) => a + r.ms, 0) / routes.length) : 0;
  const sorted = [...routes].map((r) => r.ms).sort((a, b) => a - b);
  const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0;
  const totalCache = m.cacheHits + m.cacheMisses;
  const cacheHitRate = totalCache ? Math.round((m.cacheHits / totalCache) * 100) : 0;
  const preloadRate = m.preloadAttempts ? Math.round((m.preloadSuccess / m.preloadAttempts) * 100) : 0;
  return { avg, p95, cacheHitRate, preloadRate, samples: routes.length };
}
