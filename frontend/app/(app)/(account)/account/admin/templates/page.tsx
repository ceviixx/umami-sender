'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Container from '@/components/layout/Container';
import PageHeader from '@/components/navigation/PageHeader';
import clsx from 'clsx';
import { useI18n } from '@/locales/I18nContext';
import {
  updateTemplates,
  fetchTemplateSource,
  updateTemplateSource,
  deleteTemplateSource,
  type TemplateSourceConfig,
} from '@/lib/api/templates';
import { TrashIcon } from '@heroicons/react/24/outline';
import TextInput from '@/components/inputs/TextInput';
import { showSuccess, showError, notification_ids, showInfo } from '@/lib/toast';

const OFFICIAL = {
  repo: 'https://github.com/ceviixx/umami-sender.git',
  branch: 'templates',
  subdir: '.',
};

function toHttpRepoBase(repo: string | undefined | null): string | null {
  if (!repo) return null;
  const r = repo.trim();
  if (/^https?:\/\//i.test(r)) return r.replace(/\.git$/i, '');
  const mGitAt = r.match(/^git@([^:]+):(.+?)(\.git)?$/i);
  if (mGitAt) return `https://${mGitAt[1]}/${mGitAt[2]}`;
  const mSsh = r.match(/^ssh:\/\/([^/]+)\/(.+?)(\.git)?$/i);
  if (mSsh) return `https://${mSsh[1]}/${mSsh[2]}`;
  return null;
}
function buildTreeUrl(repo: string | null, branch: string, subdir?: string): string | null {
  const base = toHttpRepoBase(repo || '');
  if (!base) return null;
  const cleanSub = (subdir || '').replace(/^\/+|\/+$/g, '');
  const tree = branch ? `/tree/${encodeURIComponent(branch)}` : '';
  const path = cleanSub ? `/${cleanSub}` : '';
  return `${base}${tree}${path}`;
}
function buildCommitUrl(repo: string | null, commit?: string | null): string | null {
  const base = toHttpRepoBase(repo || '');
  if (!base || !commit) return null;
  return `${base}/commit/${commit}`;
}

type RefreshStats = {
  inserted: number; updated: number; skipped: number; invalid: number;
  commit?: string | null; started_at: string; finished_at?: string | null; errors: string[];
};
type FormState = { repo: string; branch: string; subdir: string };
const DEFAULTS: FormState = { repo: '', branch: 'main', subdir: '' };

export default function TemplatesSettingsPage() {
  const { locale } = useI18n();
  const [tab, setTab] = useState<'update' | 'source'>('update');

  const [initial, setInitial] = useState<FormState>(DEFAULTS);
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [touched, setTouched] = useState({ repo: false, branch: false, subdir: false });
  const [loadingSource, setLoadingSource] = useState(true);
  const [savingSource, setSavingSource] = useState(false);
  const [bannerSource, setBannerSource] = useState<{ type: 'error'|'success'|'info'; msg: string } | null>(null);

  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [stats, setStats] = useState<RefreshStats | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingSource(true);
      try {
        const data = await fetchTemplateSource();
        const next: FormState = {
          repo: data?.repo ?? '',
          branch: data?.branch || 'main',
          subdir: data?.subdir || '',
        };
        setInitial(next);
        setForm(next);
      } catch (error: any) {
        const code = error.message as 'DATA_ERROR'
        showError({id: notification_ids.template_refresh, title: locale.messages.title.error, description: locale.api_messages[code]})
      } finally {
        setLoadingSource(false);
      }
    })();
  }, []);

  const repoError = useMemo(() => {
    if (!form.repo) return locale.forms.errors.repo.required;
    const ok = form.repo.startsWith('https://');
    if (!ok) return locale.forms.errors.repo.invalidProtocol;
    if (form.repo.startsWith('http')) {
      try { new URL(form.repo); } catch { return locale.forms.errors.repo.invalid; }
    }
    return null;
  }, [form.repo]);

  const branchError = useMemo(() => {
    if (!form.branch.trim()) return locale.forms.errors.branch.required;
    if (/\s/.test(form.branch)) return locale.forms.errors.branch.noSpaces;
    return null;
  }, [form.branch]);

  const hasSourceChanges =
    form.repo !== initial.repo ||
    form.branch !== initial.branch ||
    form.subdir.trim().replace(/^\//, '') !== (initial.subdir || '').replace(/^\//, '');

  const hasSourceErrors = !!(repoError || branchError);

  const currentCommitUrl = useMemo(
    () => buildCommitUrl(form.repo, stats?.commit),
    [form.repo, stats?.commit]
  );
  const officialTreeUrl = useMemo(
    () => buildTreeUrl(OFFICIAL.repo, OFFICIAL.branch, OFFICIAL.subdir),
    []
  );
  const isOfficialSelected = useMemo(() => {
    const baseA = toHttpRepoBase(form.repo || '');
    const baseB = toHttpRepoBase(OFFICIAL.repo);
    const subA = (form.subdir || '').replace(/^\/+|\/+$/g, '') || '';
    const subB = (OFFICIAL.subdir || '').replace(/^\/+|\/+$/g, '') || '';
    return baseA === baseB && form.branch === OFFICIAL.branch && subA === subB;
  }, [form.repo, form.branch, form.subdir]);

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
      setBannerSource(null);
    };
  const onBlur = (key: keyof FormState) => () => setTouched((t) => ({ ...t, [key]: true }));

  const onReset = () => {
    setForm(initial);
    setTouched({ repo: false, branch: false, subdir: false });
    setBannerSource(null);
  };

  const onSave = async () => {
    if (hasSourceErrors || !hasSourceChanges) return;
    setSavingSource(true);
    try {
      const payload: TemplateSourceConfig = {
        repo: form.repo,
        branch: form.branch,
        subdir: form.subdir.trim().replace(/^\//, ''),
      };
      const saved = await updateTemplateSource(payload);
      const normalized: FormState = {
        repo: saved.repo || '',
        branch: saved.branch || 'main',
        subdir: saved.subdir || '',
      };
      setInitial(normalized);
      setForm(normalized);
      showSuccess({id: notification_ids.template_refresh, title: locale.messages.title.success, description: 'locale.api_messages[code]'})
    } catch (error: any) {
      const code = error.message as 'DATA_ERROR'
      showError({id: notification_ids.template_refresh, title: locale.messages.title.error, description: locale.api_messages[code]})
    } finally {
      setSavingSource(false);
    }
  };

  const handleRefresh = async () => {
    setLoadingRefresh(true);
    try {
      const res = (await updateTemplates()) as RefreshStats;
      setStats(res);
      const alreadyRunning = Array.isArray(res?.errors) && res.errors.some((e) => e.toLowerCase().includes('already running'));
      if (alreadyRunning) showError({id: notification_ids.template_refresh, title: locale.messages.title.error, description: 'Ein Refresh läuft bereits.'})
      else if ((res?.inserted ?? 0) + (res?.updated ?? 0) > 0) showSuccess({id: notification_ids.template_refresh, title: locale.messages.title.success, description: 'Templates aktualisiert.'})
      else showInfo({id: notification_ids.template_refresh, title: locale.messages.title.info, description: 'Keine Änderungen gefunden.'})
    } catch (error: any) {
      const code = error.message as 'DATA_ERROR'
      showError({id: notification_ids.template_refresh, title: locale.messages.title.error, description: locale.api_messages[code]})
    } finally {
      setLoadingRefresh(false);
    }
  };

  const onDelete = async () => {
    setLoadingSource(true);
    setBannerSource(null);
    try {
      await deleteTemplateSource();
      setForm({ repo: '', branch: '', subdir: '' });
      setInitial({ repo: '', branch: 'main', subdir: '' });
      showSuccess({id: notification_ids.template_refresh, title: locale.messages.title.success, description: 'Quelle entfernt. Es werden die Defaults verwendet.'})
    } catch (error: any) {
      const code = error.message as 'DATA_ERROR'
      showError({id: notification_ids.template_refresh, title: locale.messages.title.error, description: locale.api_messages[code]})
    } finally {
      setLoadingSource(false);
    }
  };

  return (
    <Container>
      <PageHeader title={locale.pages.template_update} />

      <div className="border-b border-gray-200 dark:border-gray-800 mt-4">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setTab('update')}
            className={clsx('py-2 px-1 border-b-2 text-sm font-medium',
              tab === 'update' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}
          >
            {locale.admin_templates.sections.update}
          </button>
          <button
            onClick={() => setTab('source')}
            className={clsx('py-2 px-1 border-b-2 text-sm font-medium',
              tab === 'source' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}
          >
            {locale.admin_templates.sections.source}
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {tab === 'update' && (
          <section className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-neutral-900">
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {locale.admin_templates.templates_refresh_hint}{' '}
                  <span className="font-semibold">{locale.common.warning}:</span>{' '}
                  {locale.admin_templates.templates_overwrite_warning}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={loadingRefresh}
                  className="inline-flex items-center gap-2 rounded-xl px-4 h-9 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-60"
                  aria-busy={loadingRefresh}
                >
                  {loadingRefresh ? (<><Spinner />{locale.buttons.states.loading}</>) : (<><RefreshIcon />{locale.buttons.refresh}</>)}
                </button>
              </div>

              {!stats && !loadingRefresh && (
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">{locale.admin_templates.templates_idle}</p>
              )}

              {loadingRefresh && (
                <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Spinner /> {locale.admin_templates.templates_refresh_running}
                </div>
              )}

              {stats && !loadingRefresh && (
                <div className="mt-6 grid gap-4">
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatDL label={locale.admin_templates.stat.inserted} value={stats.inserted} />
                    <StatDL label={locale.admin_templates.stat.updated} value={stats.updated} />
                    <StatDL label={locale.admin_templates.stat.skipped} value={stats.skipped} />
                    <StatDL label={locale.admin_templates.stat.invalid} value={stats.invalid} emphasizeNegative />
                  </dl>

                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <MetaRow label={locale.admin_templates.status.start}><TimeStamp value={stats.started_at} /></MetaRow>
                    {stats.finished_at && <MetaRow label={locale.admin_templates.status.end}><TimeStamp value={stats.finished_at} /></MetaRow>}
                    <MetaRow label="Commit">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs break-all">{stats.commit || '-'}</code>
                        {!!stats.commit && currentCommitUrl && (
                          <a
                            href={currentCommitUrl}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 h-7 px-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                            title="Commit im Repo ansehen"
                          >
                            <CommitIcon className="h-4 w-4" />
                            <span>Open</span>
                          </a>
                        )}
                      </div>
                    </MetaRow>
                  </div>

                  {Array.isArray(stats.errors) && stats.errors.length > 0 && (
                    <Banner type="error" message={`${stats.errors.length} Fehler`} details={stats.errors} />
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {tab === 'source' && (
          <section className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-neutral-900">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">
                  {locale.admin_templates.sections.source}
                </h2>

                <div className="flex items-center gap-2">
                  {officialTreeUrl && !isOfficialSelected && (
                    <a
                      href={officialTreeUrl}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-lg border border-blue-300 text-blue-700 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                      title="Offizielle Vorlagen ansehen"
                    >
                      <BookIcon className="h-4 w-4" />
                      <span>{locale.admin_templates.offical_templates}</span>
                    </a>
                  )}
                </div>
              </div>

              {bannerSource && <Banner className="mb-3" type={bannerSource.type} message={bannerSource.msg} />}

              <div className="grid gap-4">
                <TextInput
                  name='repo'
                  value={form.repo}
                  label={locale.forms.labels.repository_url}
                  error={touched.repo ? repoError : null}
                  placeholder={locale.forms.placeholders.repository_url}
                  onChange={onChange('repo')}
                  onBlur={onBlur('repo')}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <TextInput
                    name='branch'
                    value={form.branch}
                    label={locale.forms.labels.branch}
                    error={touched.branch ? branchError : null}
                    placeholder={locale.forms.placeholders.branch}
                    onChange={onChange('branch')}
                    onBlur={onBlur('branch')}
                  />

                  <TextInput
                    name='subdir'
                    value={form.subdir}
                    label={locale.forms.labels.subdirectory}
                    placeholder={locale.forms.placeholders.subdirectory}
                    onChange={onChange('subdir')}
                    onBlur={onBlur('subdir')}
                  />

                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={savingSource || loadingSource || !hasSourceChanges || hasSourceErrors}
                      className={clsx(
                        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                        'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
                        (savingSource || loadingSource || !hasSourceChanges || hasSourceErrors) && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      {savingSource ? locale.buttons.states.loading : locale.buttons.save}
                    </button>

                    <button
                      type="button"
                      onClick={onReset}
                      disabled={savingSource || loadingSource || !hasSourceChanges}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-60"
                    >
                      {locale.buttons.reset}
                    </button>

                    {loadingSource && <span className="text-xs opacity-70">Lade Template-Quelle…</span>}
                  </div>

                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={loadingSource}
                    className={clsx(
                      'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm',
                      'ring-1 ring-inset ring-gray-300 dark:ring-red-700 hover:bg-red-50 dark:hover:bg-red-800'
                    )}
                    title="Quelle entfernen"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {locale.buttons.delete}
                  </button>
                </div>

                {isOfficialSelected && officialTreeUrl && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Du verwendest die <span className="font-medium">offiziellen Vorlagen</span>.{' '}
                    <a className="underline hover:opacity-80" href={officialTreeUrl} target="_blank" rel="noreferrer">Im Repo ansehen</a>.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}

function Banner({ type, message, details, className }: { type: 'error'|'success'|'info'; message: string; details?: string[]; className?: string }) {
  const palette =
    type === 'error'
      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200'
      : type === 'success'
      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
      : 'border-amber-200 dark:border-yellow-900/50 bg-amber-50/70 dark:bg-yellow-950/30 text-amber-900 dark:text-amber-200';
  return (
    <div className={clsx('rounded-xl border p-3 text-sm', palette, className)}>
      <div className="font-medium">{message}</div>
      {details && details.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {details.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      )}
    </div>
  );
}


function StatDL({ label, value, emphasizeNegative }: { label: string; value: number; emphasizeNegative?: boolean }) {
  const neg = emphasizeNegative && value > 0;
  return (
    <div className={clsx('rounded-xl p-4 border text-center', neg ? 'border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/30' : 'border-gray-200 dark:border-gray-800')}>
      <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={clsx('mt-1 text-2xl font-semibold', neg && 'text-red-700 dark:text-red-300')}>{value}</dd>
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
  return <span className="font-mono text-xs" title={value}>{local}</span>;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
      onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {} }}
      className={clsx('h-7 px-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800', className)}
      aria-label="Commit kopieren" title="Commit kopieren"
    >
      {copied ? 'Kopiert' : 'Kopieren'}
    </button>
  );
}

function CommitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="3" strokeWidth="2"/>
      <path d="M3 12h6M15 12h6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 22V6a2 2 0 0 0-2-2H7A3 3 0 0 0 4 7v15" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
