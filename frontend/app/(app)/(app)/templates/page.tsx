"use client";

import { useI18n } from "@/locales/I18nContext";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTemplates } from "@/lib/api/templates";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/navigation/PageHeader";
import EmptyState from "@/components/EmptyState";
import CardList from "@/components/cardlist/CardList";
import NetworkError from "@/components/NetworkError";
import LoadingSpinner from "@/components/LoadingSpinner";

type TemplateRaw = {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  updatedAt?: string | null;
};

type TemplateDerived = TemplateRaw & {
  meta: {
    label: string;
  };
};

const NICE_WORD: Record<string, string> = {
  EMAIL: "Email",
  WEBHOOK: "Webhook",
  SUMMARY: "Summary",
  REPORT: "Report",
  ATTRIBUTION: "Attribution",
  FUNNEL: "Funnel",
  GENERIC: "Generic",
};

function titleWord(w: string) {
  return NICE_WORD[w] ?? w.charAt(0) + w.slice(1).toLowerCase();
}

function buildCleanLabel(rawType: string): string {
  const tokens = (rawType ?? "")
    .split(/[^A-Z0-9]+/i)
    .filter(Boolean)
    .map((s) => s.trim().toUpperCase());
  const segments = tokens.map(titleWord);
  return segments.join(" · ");
}

function formatDateShort(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export default function TemplatesPage() {
  const router = useRouter();
  const { locale } = useI18n();

  const [templates, setTemplates] = useState<TemplateDerived[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setHasNetworkError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const raw = await fetchTemplates(); // -> TemplateRaw[]
        if (!mounted) return;

        const enriched: TemplateDerived[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          ...r,
          meta: {
            label: buildCleanLabel(r.type),
          },
        }));

        setTemplates(enriched);
      } catch (error: any) {
        if (!mounted) return;
        setHasNetworkError(error?.message ?? String(error));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const ordered = useMemo(() => {
    return [...templates].sort((a, b) => {
      const ta = a.updatedAt ? +new Date(a.updatedAt) : 0;
      const tb = b.updatedAt ? +new Date(b.updatedAt) : 0;
      return tb - ta;
    });
  }, [templates]);

  if (loading) return <LoadingSpinner title={locale.pages.templates} />;
  if (networkError) return <NetworkError page={locale.pages.templates} message={networkError} />;

  return (
    <Container>
      <PageHeader title={locale.pages.templates} />

      {ordered.length === 0 ? (
        <EmptyState variant="chip" hint="No templates, import them in the admin settings" rows={4} />
      ) : (
        <CardList
          items={ordered}
          keyField={(item) => item.id}
          // Titel: immer aufgeräumter Name
          title={(item) => item.meta.label}
          subtitle={(item) => formatDateShort(item.updatedAt)}
          // keine Badges mehr
          rightSlot={(item) => (
            <button
              onClick={() => router.push(`/templates/${item.id}/preview`)}
              className="text-xs rounded-lg px-3 py-1.5 ring-1 ring-inset ring-gray-300/70 dark:ring-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-800/60"
            >
              {locale.templates.preview}
            </button>
          )}
        />
      )}
    </Container>
  );
}
