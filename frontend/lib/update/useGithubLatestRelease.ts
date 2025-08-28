"use client";

import { useEffect, useState } from "react";

type ReleaseInfo = {
  tag: string;
  name?: string;
  html_url?: string;
  published_at?: string;
  prerelease?: boolean;
  body?: string;
};

type State = { loading: boolean; error?: string; release?: ReleaseInfo };

export function useGithubLatestRelease(owner: string, repo: string): State {
  const [state, setState] = useState<State>({ loading: true });

  useEffect(() => {
    let aborted = false;

    (async () => {
      try {
        const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
        const res = await fetch(url, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();

        if (!aborted) {
          setState({ loading: false, release: mapRelease(data) });
        }
      } catch (e: any) {
        if (!aborted) setState({ loading: false, error: e?.message || "fetch error" });
      }
    })();

    return () => {
      aborted = true;
    };
  }, [owner, repo]);

  return state;
}

function mapRelease(data: any): ReleaseInfo {
  const tag = (data?.tag_name ?? "").toString();
  return {
    tag,
    name: data?.name ?? "",
    html_url: data?.html_url ?? "",
    published_at: data?.published_at ?? "",
    prerelease: !!data?.prerelease,
    body: data?.body ?? "",
  };
}
