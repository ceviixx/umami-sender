"use client";

import React, { useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/navigation/PageHeader";
import { useI18n } from "@/locales/I18nContext";
import { updateTemplates } from "@/lib/api/templates";

export type RefreshStats = {
  inserted: number;
  updated: number;
  skipped: number;
  invalid: number;
  commit?: string | null;
  started_at: string;
  finished_at?: string | null;
  errors: string[];
};

export default function TemplatesRefreshPage() {
  const { locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RefreshStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasErrors = useMemo(() => !!stats?.errors?.length || !!error, [stats, error]);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const res = (await updateTemplates()) as RefreshStats;
      setStats(res);

      const alreadyRunning =
        Array.isArray(res?.errors) && res.errors.some((e) => e.toLowerCase().includes("already running"));
      if (alreadyRunning) {
        setError(locale.admin_templates.already_running);
      }
    } catch (e: any) {
      if (e?.status === 409) {
        setError(locale.admin_templates.already_running);
      } else {
        setError(e?.message ?? String(e));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <PageHeader title={locale.pages.template_update} />

      <div className="mt-2 flex items-start gap-3">
        <InfoCallout className="flex-1">
          <p>{locale.admin_templates.templates_refresh_hint}</p>
          <p className="mt-1">
            <span className="font-semibold">{locale.common.warning}:</span>{" "}
            {locale.admin_templates.templates_overwrite_warning}
          </p>
        </InfoCallout>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl px-4 h-9 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-60"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Spinner />
              {locale.buttons.states.loading}
            </>
          ) : (
            <>
              <RefreshIcon />
              {locale.buttons.refresh}
            </>
          )}
        </button>
      </div>

      <div
        className="mt-4 w-full rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-neutral-900"
        aria-live="polite"
      >
        {!stats && !error && !loading && (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
            {locale.admin_templates.templates_idle}
          </div>
        )}

        {loading && (
          <div className="p-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <Spinner />
            {locale.admin_templates.templates_refresh_running}
          </div>
        )}

        {error && !loading && (
          <div className="p-5">
            <ErrorPanel title={"{ERROR}"} messages={[error, ...(stats?.errors ?? [])]} />
          </div>
        )}

        {stats && !loading && (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label={locale.admin_templates.stat.inserted} value={stats.inserted} />
              <StatTile label={locale.admin_templates.stat.updated} value={stats.updated} />
              <StatTile label={locale.admin_templates.stat.skipped} value={stats.skipped} />
              <StatTile label={locale.admin_templates.stat.invalid} value={stats.invalid} emphasizeNegative />
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <MetaRow label={locale.admin_templates.status.start}>
                <TimeStamp value={stats.started_at} />
              </MetaRow>
              {stats.finished_at && (
                <MetaRow label={locale.admin_templates.status.end}>
                  <TimeStamp value={stats.finished_at} />
                </MetaRow>
              )}
              <MetaRow label="Commit">
                <code className="font-mono text-xs break-all">{stats.commit || "-"}</code>
                {!!stats.commit && <CopyButton text={stats.commit!} className="ml-2" />}
              </MetaRow>
            </div>

            {!!hasErrors && (
              <div className="mt-4">
                <ErrorPanel title={"{ERROR}"} messages={[...(stats?.errors ?? []), ...(error ? [error] : [])]} />
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}


function InfoCallout({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50/70 dark:border-yellow-900/50 dark:bg-yellow-950/30 p-3 text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2 ${className ?? ""}`}
    >
      <InfoIcon className="mt-0.5 h-4 w-4" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
      <path d="M11 12h1v4h1" />
    </svg>
  );
}

function StatTile({
  label,
  value,
  emphasizeNegative = false,
}: {
  label: string;
  value: number;
  emphasizeNegative?: boolean;
}) {
  const negative = emphasizeNegative && value > 0;
  return (
    <div
      className={`rounded-xl p-4 border text-center ${
        negative
          ? "border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/30"
          : "border-gray-200 dark:border-gray-800"
      }`}
      role="status"
      aria-label={`${label}: ${value}`}
    >
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${negative ? "text-red-700 dark:text-red-300" : ""}`}>{value}</div>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-24 shrink-0 text-gray-500 dark:text-gray-400 text-sm">{label}</div>
      <div className="flex-1 flex items-center">{children}</div>
    </div>
  );
}

function TimeStamp({ value }: { value: string }) {
  const d = new Date(value);
  const isValid = !isNaN(d.getTime());
  const local = isValid ? d.toLocaleString() : value;
  return (
    <span className="font-mono text-xs" title={value}>
      {local}
    </span>
  );
}

function ErrorPanel({ title, messages }: { title: string; messages: string[] }) {
  const nonEmpty = messages.filter(Boolean);
  if (nonEmpty.length === 0) return null;
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4">
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{title}</p>
      <ul className="mt-2 list-disc pl-5 text-sm text-red-800 dark:text-red-200">
        {nonEmpty.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-3.51-7.11" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  );
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
      className={`h-7 px-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800 ${className ?? ""}`}
      aria-label="Commit kopieren"
      title="Commit kopieren"
    >
      {copied ? "Kopiert" : "Kopieren"}
    </button>
  );
}
