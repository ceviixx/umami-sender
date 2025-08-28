"use client";

import { useEffect, useMemo, useState } from "react";
import { XMarkIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useGithubLatestRelease } from "@/lib/update/useGithubLatestRelease";
import { getCurrentVersion } from "@/lib/update/version";
import { normalizeTag, isNewer } from "@/lib/update/helpers";

type Props = {
  owner?: string;
  repo?: string;
  title?: string;
};

export default function UpdateMenuCard({
  owner = "ceviixx",
  repo = "umami-sender",
  title = "Update available",
}: Props) {
  const { release, loading } = useGithubLatestRelease(owner, repo);
  const current = getCurrentVersion();
  const latest = normalizeTag(release?.tag);

  const needsUpdate = useMemo(() => {
    if (!latest || !current || current === "unknown") return false;
    return isNewer(latest, current);
  }, [latest, current]);

  const storageKey = latest ? `dismissed-update:${latest}` : "";
  const [dismissed, setDismissed] = useState(() =>
    storageKey ? localStorage.getItem(storageKey) === "1" : false
  );

  useEffect(() => {
    setDismissed(storageKey ? localStorage.getItem(storageKey) === "1" : false);
  }, [storageKey]);

  if (loading || !needsUpdate || dismissed) return null;

  const href = release?.html_url || `https://github.com/${owner}/${repo}/releases`;

  const onDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (storageKey) localStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  return (
    <>
      <div className="">
        <div className="relative group">
          <span className="pointer-events-none absolute inset-0 transition-colors group-hover:bg-blue-50/70 dark:group-hover:bg-blue-900/30" />
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${title}: ${current} → ${latest}`}
            className="relative block w-full rounded-md px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <div className="flex items-start gap-2 pr-8">
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  {title}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 group-hover:text-blue-800 dark:group-hover:text-blue-200">
                  <span className="font-mono">{current}</span>
                  <ChevronRightIcon className="h-3.5 w-3.5 opacity-70" />
                  <span className="font-mono">{latest}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onDismiss}
              aria-label="Hinweis ausblenden"
              className="absolute right-1 top-1 rounded p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100/70 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </a>
        </div>
      </div>
      <div className="my-1 h-px bg-gray-100 dark:bg-gray-700" />
    </>
  );
}
