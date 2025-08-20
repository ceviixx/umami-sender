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

// ---- Types
type TemplateRaw = {
  id: string;
  name: string;
  type: string;                 // z.B. EMAIL_REPORT_ATTRIBUTION, WEBHOOK_SUMMARY_DISCORD
  description?: string | null;
  updatedAt?: string | null;
};

type TemplateDerived = TemplateRaw & {
  group: string;                // z.B. EMAIL, WEBHOOK_DISCORD, WEBHOOK_SLACK, WEBHOOK_GENERIC
  sublabel?: string;            // z.B. "Report Attribution", "Summary Discord"
};

// ---- Helpers
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

// Leitet aus dem "feinen" type die gröbere Gruppe ab
function deriveGroup(t: string): string {
  const up = (t || '').toUpperCase();
  if (up.startsWith('EMAIL')) return 'EMAIL';
  if (up.startsWith('WEBHOOK')) {
    if (up.includes('DISCORD')) return 'WEBHOOK_DISCORD';
    if (up.includes('SLACK'))   return 'WEBHOOK_SLACK';
    if (up.includes('GENERIC')) return 'WEBHOOK_GENERIC';
    return 'WEBHOOK_GENERIC'; // Default für unbekannte Webhooks
  }
  // Fallback: erster Token
  const first = up.split('_')[0] || 'OTHER';
  return first;
}

// macht aus EMAIL_REPORT_ATTRIBUTION -> "Report Attribution"
function deriveSubLabel(t: string): string | undefined {
  const parts = (t || '').split('_');
  if (parts.length <= 1) return undefined;
  const rest = parts.slice(1);
  return rest.map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
}

// ---- UI Meta jetzt an "group" gebunden
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
  const [error, setError] = useState<string | null>(null);

  // --- Daten laden & anreichern
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await fetchTemplates(); // -> TemplateRaw[]
        if (!mounted) return;

        const enriched: TemplateDerived[] = (Array.isArray(raw) ? raw : []).map((r) => {
          const group = deriveGroup(r.type);
          const sublabel = deriveSubLabel(r.type);
          return { ...r, group, sublabel };
        });

        setTemplates(enriched);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Fehler beim Laden der Templates.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // dynamische Gruppen aus Daten ableiten
  const groupsInData = useMemo(() => {
    const s = new Set<string>();
    templates.forEach(t => t?.group && s.add(t.group));
    return Array.from(s.values());
  }, [templates]);

  // counts für Pills je Gruppe
  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: templates.length };
    groupsInData.forEach(g => {
      map[g] = templates.filter(t => t.group === g).length;
    });
    return map;
  }, [templates, groupsInData]);

  // Filter
  const filtered = useMemo(() => {
    let list = templates;
    if (activeGroup !== 'ALL') list = list.filter(t => t.group === activeGroup);
    // sortiere neueste zuerst (falls updatedAt fehlt, bleiben diese unten)
    return [...list].sort((a, b) => {
      const ta = a.updatedAt ? +new Date(a.updatedAt) : 0;
      const tb = b.updatedAt ? +new Date(b.updatedAt) : 0;
      return tb - ta;
    });
  }, [templates, activeGroup]);

  return (
    <Container>
      <PageHeader
        title={locale.pages.templates}
        actions={
          <nav className="mb-5 flex items-center gap-2 overflow-x-auto">
            <Pill
              active={activeGroup === 'ALL'}
              onClick={() => setActiveGroup('ALL')}
              icon={FunnelIcon}
              label="Alle"
              count={counts.ALL ?? 0}
            />
            {groupsInData.map(g => {
              const meta = typeMeta[g] ?? {
                label: g,
                icon: GlobeAltIcon,
                badgeClass: 'ring-gray-500/20 text-gray-700 dark:text-gray-300',
              };
              return (
                <Pill
                  key={g}
                  active={activeGroup === g}
                  onClick={() => setActiveGroup(g)}
                  icon={meta.icon}
                  label={meta.label}
                  count={counts[g] ?? 0}
                />
              );
            })}
          </nav>
        }
      />
      

      {error && (
        <div className="mb-4 rounded-lg border border-red-300/60 text-red-800 dark:text-red-300 dark:border-red-800/60 bg-red-50/70 dark:bg-red-950/40 p-3 text-sm">
          {error}
        </div>
      )}

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
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <TemplateCard key={t.id} t={t} router={router} />
          ))}
        </ul>
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

function TemplateCard({ t, router }: { t: TemplateDerived, router: any }) {
  const meta = typeMeta[t.group] ?? {
    label: t.group,
    icon: GlobeAltIcon,
    badgeClass: 'ring-gray-500/20 text-gray-700 dark:text-gray-300',
  };
  const Icon = meta.icon;

  return (
    <li className="group rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'inline-flex items-center justify-center h-8 w-8 rounded-xl ring-1 ring-inset',
              meta.badgeClass
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <div className="font-medium leading-tight">{t.name}</div>
            <div className="text-[11px] opacity-70">
              {meta.label}{t.sublabel ? ` · ${t.sublabel}` : ''}
            </div>
          </div>
        </div>
        {t.updatedAt && (
          <div className="text-[10px] opacity-70 whitespace-nowrap">
            {formatDateShort(t.updatedAt)}
          </div>
        )}
      </div>

      {t.description && <p className="mt-3 text-sm opacity-80 line-clamp-2">{t.description}</p>}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => router.push(`/templates/${t.id}/preview`)}
          className="text-xs rounded-lg px-3 py-1.5 ring-1 ring-inset ring-gray-300/70 dark:ring-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-800/60"
        >
          Vorschau
        </button>
        {/*
        <button
          onClick={() => router.push(`/templates/${t.id}/edit`)}
          className="text-xs rounded-lg px-3 py-1.5 ring-1 ring-inset ring-gray-300/70 dark:ring-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-800/60"
        >
          Bearbeiten
        </button>
        */}
      </div>
    </li>
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
