// Developer-only meta inspector. Renders the resolved OG / Twitter / JSON-LD
// for any path on this site by calling /api/social-preview. Hidden from
// search engines via robots noindex.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getShareUrl, getFreshShareUrl } from "@/lib/share";

export const Route = createFileRoute("/dev/meta")({
  head: () => ({
    meta: [
      { title: "Meta Inspector — AIELTS (dev)" },
      { name: "description", content: "Internal OG/Twitter meta inspector." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MetaInspectorPage,
});

type PreviewResponse = {
  target: string;
  canonical: string;
  openGraph: Record<string, string | null>;
  twitter: Record<string, string | null>;
  jsonLd: unknown[];
  fallbacks: { og_image: string; twitter_image: string };
  generatedAt: string;
  error?: string;
};

function MetaInspectorPage() {
  const [path, setPath] = useState("/");
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = useMemo(() => getShareUrl(path), [path]);
  const freshShareUrl = useMemo(() => getFreshShareUrl(path), [path]);

  async function load(p: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/social-preview?path=${encodeURIComponent(p)}`);
      const json = (await res.json()) as PreviewResponse;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load("/");
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-foreground">
      <h1 className="text-2xl font-semibold">Meta Inspector</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Resolves Open Graph, Twitter card, canonical, and JSON-LD for any route on
        this site. Internal tool — noindex.
      </p>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load(path);
        }}
      >
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/pricing"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Inspect"}
        </button>
      </form>

      <section className="mt-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Cache-busted share URLs</h2>
        <div className="mt-2 space-y-1 text-xs font-mono">
          <div>
            <span className="text-muted-foreground">stable: </span>
            <a className="text-primary underline" href={shareUrl} target="_blank" rel="noreferrer">
              {shareUrl}
            </a>
          </div>
          <div>
            <span className="text-muted-foreground">fresh:&nbsp; </span>
            <a className="text-primary underline" href={freshShareUrl} target="_blank" rel="noreferrer">
              {freshShareUrl}
            </a>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-6">
          <Block title="Target" rows={{ target: data.target, canonical: data.canonical }} />
          <Block title="Open Graph" rows={data.openGraph} />
          <Block title="Twitter" rows={data.twitter} />
          <Block
            title="Fallbacks"
            rows={{
              "og:image fallback": data.fallbacks.og_image,
              "twitter:image fallback": data.fallbacks.twitter_image,
            }}
          />
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">JSON-LD ({data.jsonLd.length})</h2>
            {data.jsonLd.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">No JSON-LD blocks found.</p>
            ) : (
              <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-3 text-xs">
                {JSON.stringify(data.jsonLd, null, 2)}
              </pre>
            )}
          </section>

          {data.openGraph.image && (
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">og:image preview</h2>
              <img
                src={data.openGraph.image}
                alt="og:image preview"
                className="mt-2 max-h-80 rounded border border-border"
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Block({ title, rows }: { title: string; rows: Record<string, string | null> }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs font-mono">
        {Object.entries(rows).map(([k, v]) => (
          <Row key={k} k={k} v={v} />
        ))}
      </dl>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string | null }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="break-all">
        {v ? (
          v.startsWith("http") ? (
            <a className="text-primary underline" href={v} target="_blank" rel="noreferrer">
              {v}
            </a>
          ) : (
            v
          )
        ) : (
          <span className="text-muted-foreground italic">— missing —</span>
        )}
      </dd>
    </>
  );
}
