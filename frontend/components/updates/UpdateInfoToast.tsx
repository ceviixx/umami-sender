"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/locales/I18nContext";
import { useGithubLatestRelease } from "@/lib/update/useGithubLatestRelease";
import { getCurrentVersion } from "@/lib/update/version";
import { normalizeTag, isNewer } from "@/lib/update/helpers";
import { showUpdateAvailableToast } from "@/lib/toast_update";

type Props = {
  owner?: string;
  repo?: string;
  idPrefix?: string;
  markAsSeenOnShow?: boolean;
};

export default function UpdateInfoToast({
  owner = "ceviixx",
  repo = "umami-sender",
  idPrefix = "update",
  markAsSeenOnShow = true, // on first show set varible to not show again 
}: Props) {
  const { locale } = useI18n();
  const { release, loading } = useGithubLatestRelease(owner, repo);

  const current = getCurrentVersion();
  const latest = normalizeTag(release?.tag);

  const needsUpdate = useMemo(() => {
    if (!latest || !current || current === "unknown") return false;
    return isNewer(latest, current);
  }, [latest, current]);

  const storageKey = latest ? `dismissed-update:${latest}` : "";

  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!storageKey) {
      setDismissed(false);
      setReady(false);
      return;
    }
    try {
      const val = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      setDismissed(val === "1");
    } catch {
      setDismissed(false);
    } finally {
      setReady(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (loading) return;
    if (!ready) return;
    if (!needsUpdate || dismissed) return;
    if (!latest) return;

    const href = release?.html_url || `https://github.com/${owner}/${repo}/releases`;
    const id = `${idPrefix}:${latest}`;

    showUpdateAvailableToast({
      id,
      title: locale.common.updateAvailable,
      current,
      latest,
      href,
      onDismiss: () => {
        try {
          if (storageKey) localStorage.setItem(storageKey, "1");
        } catch {}
        setDismissed(true);
      },
    });

    if (markAsSeenOnShow) {
      try {
        if (storageKey) localStorage.setItem(storageKey, "1");
      } catch {}
      setDismissed(true);
    }
  }, [
    loading,
    ready,
    needsUpdate,
    dismissed,
    latest,
    release,
    owner,
    repo,
    idPrefix,
    locale,
    storageKey,
    current,
    markAsSeenOnShow,
  ]);

  return null;
}
