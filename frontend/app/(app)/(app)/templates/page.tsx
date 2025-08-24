'use client';

import { useI18n } from "@/locales/I18nContext";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation'
import {
  EnvelopeIcon,
  BellAlertIcon,
  HashtagIcon,
  GlobeAltIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { fetchTemplates } from '@/lib/api/templates';
import Container from '@/components/layout/Container';
import PageHeader from '@/components/navigation/PageHeader';
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
  group: string;
  sublabel?: string;
};

function formatDateShort(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(+d)) return '';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function deriveGroup(t: string): string {
  const up = (t ?? "").trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
  if (!up) return "OTHER";

  if (up.startsWith("EMAIL")) return "Email";

  if (up.startsWith("WEBHOOK")) {
    const tokens = up.split("_").filter(Boolean);

    const STOP = new Set([
      "WEBHOOK", "SUMMARY", "REPORT", "NOTIFY", "ALERT", "MESSAGE",
      "EVENT", "PAYLOAD", "TRIGGER", "HOOK", "TYPE", "GENERIC"
    ]);
    let provider = tokens.slice().reverse().find(tok => !STOP.has(tok));
    if (!provider && tokens.includes("GENERIC")) provider = "GENERIC";
    if (!provider) provider = "GENERIC";
    return `${provider}`
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (up.split("_")[0] || "OTHER");
}


function deriveSubLabel(t: string): string | undefined {
  const parts = (t || '').split('_');
  if (parts.length <= 1) return undefined;
  const rest = parts.slice(1);
  return rest.map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
}

const typeMeta: Partial<
  Record<
    string,
    { label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; badgeClass: string }
  >
> = {
  EMAIL: { label: 'E‑Mail', icon: EnvelopeIcon, badgeClass: 'ring-blue-600/20 text-blue-700 dark:text-blue-300' },
  WEBHOOK_DISCORD: { label: 'Discord', icon: HashtagIcon, badgeClass: 'ring-violet-600/20 text-violet-700 dark:text-violet-300' },
  WEBHOOK_SLACK: { label: 'Slack', icon: BellAlertIcon, badgeClass: 'ring-pink-600/20 text-pink-700 dark:text-pink-300' },
  WEBHOOK_GENERIC: { label: 'Webhook (Custom)', icon: GlobeAltIcon, badgeClass: 'ring-emerald-600/20 text-emerald-700 dark:text-emerald-300' },
};

export default function TemplatesPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [activeGroup, setActiveGroup] = useState<string | 'ALL'>('ALL');
  const [templates, setTemplates] = useState<TemplateDerived[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setHasNetworkError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const raw = await fetchTemplates(); // -> TemplateRaw[]
        if (!mounted) return;

        const enriched: TemplateDerived[] = (Array.isArray(raw) ? raw : []).map((r) => {
          const group = deriveGroup(r.type);
          const sublabel = deriveSubLabel(r.type);
          return { ...r, group, sublabel };
        });

        setTemplates(enriched);
      } catch (error: any) {
        if (!mounted) return;
        setHasNetworkError(error.message)
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const groupsInData = useMemo(() => {
    const s = new Set<string>();
    templates.forEach(t => t?.group && s.add(t.group));
    return Array.from(s.values());
  }, [templates]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: templates.length };
    groupsInData.forEach(g => {
      map[g] = templates.filter(t => t.group === g).length;
    });
    return map;
  }, [templates, groupsInData]);

  const filtered = useMemo(() => {
    let list = templates;
    if (activeGroup !== 'ALL') list = list.filter(t => t.group === activeGroup);
    return [...list].sort((a, b) => {
      const ta = a.updatedAt ? +new Date(a.updatedAt) : 0;
      const tb = b.updatedAt ? +new Date(b.updatedAt) : 0;
      return tb - ta;
    });
  }, [templates, activeGroup]);

  if (loading) { return <LoadingSpinner title={locale.pages.templates} /> }
  if (networkError) { return <NetworkError page={locale.pages.templates} message={networkError} /> }

  return (
    <Container>
      <PageHeader
        title={locale.pages.templates}
        actions={
          <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full ring-1 ring-gray-300/70 dark:ring-gray-700/70 overflow-hidden">
              <button
                onClick={() => setActiveGroup('ALL')}
                className={[
                  "inline-flex items-center gap-2 px-3 py-2 text-sm transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                  "rounded-full",
                  activeGroup === 'ALL' ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 ring-0" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                ].join(' ')}
              >
                <div className="inline-flex gap-2">
                  <FunnelIcon className="w-5 h-5" />
                  {locale.templates.all}
                </div>
              </button>
              {groupsInData.map(g => {
                const meta = typeMeta[g] ?? {
                  label: g,
                  icon: GlobeAltIcon,
                  badgeClass: 'ring-gray-500/20 text-gray-700 dark:text-gray-300',
                };
                return (
                <button
                  onClick={() => setActiveGroup(g)}
                  className={[
                    "inline-flex items-center gap-2 px-3 py-2 text-sm transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                    "rounded-full",
                    activeGroup === g ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 ring-0" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  ].join(' ')}
                >
                  <div className="inline-flex gap-2">
                    <meta.icon className="w-5 h-5" />
                    {meta.label}
                  </div>
                </button>
                )
              })}
            </div>
          </div>
          </>
        }
      />

      {loading ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant='chip'
          hint="No templates, import them in the admin settings"
          rows={4}
        />
      ) : (
        <CardList
          items={filtered}
          keyField={(item) => item.id}
          title={(item) => item.name}
          subtitle={(item) => formatDateShort(item.updatedAt)}
          badge={(item) => item.group}
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

function Pill(props: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  count?: number;
}) {
  const { active, onClick, icon: Icon, label, count = 0 } = props;
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-inset',
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 ring-transparent'
          : 'bg-white/70 dark:bg-gray-900/60 text-gray-800 dark:text-gray-100 ring-gray-300/70 dark:ring-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-800/60'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      <span
        className={clsx(
          'ml-1 rounded-full px-2 py-0.5 text-[10px] ring-1 ring-inset',
          active ? 'bg-black/10 dark:bg-white/10 ring-white/20' : 'ring-gray-300/70 dark:ring-gray-700/70'
        )}
      >
        {count}
      </span>
    </button>
  );
}


function SkeletonCard() {
  return (
    <li className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl ring-1 ring-inset ring-gray-300/70 dark:ring-gray-700/70 bg-gray-200/60 dark:bg-gray-800/60" />
          <div>
            <div className="h-3 w-40 rounded bg-gray-200/70 dark:bg-gray-800/70 mb-2" />
            <div className="h-2.5 w-24 rounded bg-gray-200/60 dark:bg-gray-800/60" />
          </div>
        </div>
        <div className="h-2.5 w-16 rounded bg-gray-200/60 dark:bg-gray-800/60" />
      </div>
      <div className="mt-3 h-8 rounded bg-gray-200/50 dark:bg-gray-800/50" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-20 rounded bg-gray-200/60 dark:bg-gray-800/60" />
        <div className="h-6 w-24 rounded bg-gray-200/60 dark:bg-gray-800/60" />
      </div>
    </li>
  );
}
