'use client';

import { useI18n } from "@/locales/I18nContext";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchTemplatePreview } from '@/lib/api/templates';
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowsPointingOutIcon,
  MoonIcon,
  SunIcon,
  CodeBracketIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Container from "@/components/layout/Container";
import PageHeader from "@/components/navigation/PageHeader";
import { showError, showSuccess, notification_ids } from "@/lib/toast";

type WidthMode = 'mobile' | 'desktop' | 'full';
type PreviewKind = 'html' | 'json' | 'text' | 'empty';

export default function TemplatePreviewPage() {
  const { locale } = useI18n()
  const { id } = useParams<{ id: string }>();

  const [raw, setRaw] = useState<unknown>(null);
  const [kind, setKind] = useState<PreviewKind>('empty');
  const [html, setHtml] = useState<string>('');
  const [json, setJson] = useState<any>(null);
  const [text, setText] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [width, setWidth] = useState<WidthMode>('desktop');
  const [darkBg, setDarkBg] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [frameVersion, setFrameVersion] = useState(0);

  const loadPreview = async (opt?: { silent?: boolean }) => {
    const silent = opt?.silent ?? false;
    try {
      if (!silent) setLoading(true);
      setErr(null);

      const res = await fetchTemplatePreview(id); // string | object
      setRaw(res);

      // vorher leeren, damit keine alten Inhalte blinken
      setKind('empty');
      setHtml('');
      setJson(null);
      setText('');

      // --- Normalisierung & Heuristik (wie bisher) ---
      if (res && typeof res === 'object' && !Array.isArray(res)) {
        const obj = res as any;
        if (typeof obj.html === 'string') {
          setHtml(obj.html);
          setKind('html');
        } else if (obj.json !== undefined) {
          setJson(obj.json);
          setKind('json');
        } else {
          setJson(obj);
          setKind('json');
        }
      } else if (typeof res === 'string') {
        const trimmed = res.trim();
        if (looksLikeHTML(trimmed)) {
          setHtml(trimmed);
          setKind('html');
        } else if (looksLikeJSON(trimmed)) {
          try {
            const parsed = JSON.parse(trimmed);
            setJson(parsed);
            setKind('json');
          } catch {
            setText(trimmed);
            setKind('text');
          }
        } else {
          setText(trimmed);
          setKind('text');
        }
      } else {
        setKind('empty');
      }

      // ⚠️ wichtig: iframe neu montieren (auch wenn html identisch blieb)
      setFrameVersion(v => v + 1);
    } catch (e: any) {
      setErr(e?.message ?? 'Konnte Preview nicht laden.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  function prepareHtml(input: string, dark: boolean): string {
    if (!input) return input;
    const hasHtml = /<\s*html[\s>]/i.test(input);
    const clsAttr = dark ? ' class="dark"' : '';

    if (hasHtml) {
      return input.replace(
        /<\s*html([^>]*)>/i,
        (_m: string, attrs: string): string => {
          const hasClass = /\bclass\s*=\s*["'][^"']*["']/.test(attrs);

          if (hasClass) {
            const newAttrs = attrs.replace(
              /\bclass\s*=\s*["']([^"']*)["']/,
              (_m2: string, classes: string): string => {
                const list = (classes ?? '').split(/\s+/).filter(Boolean);
                const withoutDark = list.filter((c: string) => c !== 'dark');
                const merged = dark ? [...withoutDark, 'dark'].join(' ') : withoutDark.join(' ');
                return ` class="${merged}"`;
              }
            );
            return `<html${newAttrs}>`;
          }

          return `<html${attrs}${clsAttr}>`;
        }
      );
    }

    // kein <html>: minimaler Wrapper
    return `<!doctype html>
<html${clsAttr}>
<head>
  <meta charset="utf-8">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body>
${input}
</body>
</html>`;
  }

  const iframeHTML = useMemo(() => prepareHtml(html, darkBg), [html, darkBg]);



  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadPreview({ silent: false });
    })();
    return () => { mounted = false; };
  }, [id]);

  const wrapperClass = useMemo(() => {
    switch (width) {
      case 'mobile': return 'w-[390px] max-w-full';
      case 'desktop': return 'w-[900px] max-w-full';
      default: return 'w-full';
    }
  }, [width]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.documentElement.classList.toggle('dark', darkBg);
  }, [darkBg, html, frameVersion]);


  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadPreview({ silent: true });
      showSuccess({id: notification_ids.template_refresh, title: locale.messages.title.success, description: locale.messages.reloaded});
    } catch (error: any) {
      const code = error.message as 'DATA_ERROR'
      showError({id: notification_ids.account, title: locale.messages.title.error, description: locale.api_messages[code]})
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Container>

      <PageHeader
        hasBack={true}
        title={locale.pages.template_preview}
        actions={
          <div className="flex flex-wrap items-center gap-3">

            <div className="inline-flex rounded-full ring-1 ring-gray-300/70 dark:ring-gray-700/70 overflow-hidden">
              <ToggleButton
                active={width === 'mobile'}
                onClick={() => setWidth('mobile')}
                icon={DevicePhoneMobileIcon}
                label={locale.templates.preview_options.mobile}
              />
              <ToggleButton
                active={width === 'desktop'}
                onClick={() => setWidth('desktop')}
                icon={ComputerDesktopIcon}
                label={locale.templates.preview_options.desktop}
              />
              <ToggleButton
                active={width === 'full'}
                onClick={() => setWidth('full')}
                icon={ArrowsPointingOutIcon}
                label={locale.templates.preview_options.full}
              />
            </div>

            <button
              onClick={() => setDarkBg(v => !v)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm 
               ring-1 ring-inset ring-gray-300/70 dark:ring-gray-700/70
               hover:bg-gray-50 dark:hover:bg-gray-800/60
               transition"
              title={darkBg ? 'Hellen Hintergrund' : 'Dunklen Hintergrund'}
            >
              {darkBg ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              {darkBg ? locale.templates.preview_options.mode.light : locale.templates.preview_options.mode.dark}
            </button>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm 
                 ring-1 ring-inset ring-gray-300/70 dark:ring-gray-700/70
                 hover:bg-gray-50 dark:hover:bg-gray-800/60
                 transition"
              title="Refresh"
            >
              <ArrowPathIcon
                className={clsx(
                  'h-5 w-5 transition-transform',
                  refreshing && 'animate-spin'
                )}
              />
              {locale.buttons.refresh}
            </button>
          </div>
        }
      />

      {/* Body */}
      {err && (
        <div className="mb-4 rounded-lg border border-red-300/60 text-red-800 dark:text-red-300 dark:border-red-800/60 bg-red-50/70 dark:bg-red-950/40 p-3 text-sm">
          {err}
        </div>
      )}

      {loading ? (
        <PreviewSkeleton />
      ) : kind === 'html' ? (
        <div className={clsx('mx-auto flex justify-center', wrapperClass)}>
          <div
            className={clsx(
              'w-full rounded-2xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden',
              darkBg ? 'bg-[#0b0b0b]' : 'bg-[#f5f7fb]'
            )}
          >
            <iframe
              key={frameVersion}
              ref={iframeRef}
              title="Template Preview"
              srcDoc={iframeHTML}
              sandbox="allow-same-origin"
              className="w-full h-[75vh] bg-white"
            />
          </div>
        </div>
      ) : kind === 'json' ? (
        <div className={clsx('mx-auto flex justify-center', wrapperClass)}>
          <div className="w-full rounded-2xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden">
            <div className={clsx('px-4 py-2 border-b border-gray-200/70 dark:border-gray-800/70 flex items-center gap-2',
              darkBg ? 'bg-[#0b0b0b] text-gray-200' : 'bg-gray-50 text-gray-900')}>
              <CodeBracketIcon className="h-5 w-5 opacity-80" />
              <span className="text-sm">Webhook JSON Preview</span>
            </div>
            <pre className={clsx('h-[75vh] overflow-auto p-4 text-sm', darkBg ? 'bg-[#0b0b0b] text-gray-200' : 'bg-white text-gray-900')}>
              {prettyJson(json)}
            </pre>
          </div>
        </div>
      ) : kind === 'text' ? (
        <div className={clsx('mx-auto flex justify-center', wrapperClass)}>
          <div className="w-full rounded-2xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden">
            <div className={clsx('px-4 py-2 border-b border-gray-200/70 dark:border-gray-800/70 flex items-center gap-2',
              darkBg ? 'bg-[#0b0b0b] text-gray-200' : 'bg-gray-50 text-gray-900')}>
              <CodeBracketIcon className="h-5 w-5 opacity-80" />
              <span className="text-sm">Text Preview</span>
            </div>
            <pre className={clsx('h-[75vh] overflow-auto p-4 text-sm whitespace-pre-wrap', darkBg ? 'bg-[#0b0b0b] text-gray-200' : 'bg-white text-gray-900')}>
              {text}
            </pre>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300/70 dark:border-gray-700/70 p-10 text-center">
          <p className="text-sm opacity-80">Keine Vorschau verfügbar.</p>
        </div>
      )}
    </Container>
  );
}

/* ------------------------------- Helpers/Utils ------------------------------- */

function looksLikeHTML(s: string): boolean {
  const start = s.slice(0, 200).toLowerCase();
  return start.includes('<html') || start.includes('<!doctype') || start.trim().startsWith('<');
}

function looksLikeJSON(s: string): boolean {
  const first = s.trim()[0];
  const last = s.trim().slice(-1);
  return (first === '{' && last === '}') || (first === '[' && last === ']');
}

function prettyJson(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj ?? '');
  }
}

/* ---------------------------------- UI bits ---------------------------------- */

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        // Basis: pill, kompakt, zentriert
        'inline-flex items-center gap-2 px-3 py-2 text-sm transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        // Rundung/Füllung: pill
        'rounded-full',
        // States
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 ring-0'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800',

      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {label}
    </button>
  );
}

function PreviewSkeleton() {
  return (
    <div className="mx-auto flex justify-center w-full">
      <div className="w-[900px] max-w-full rounded-2xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden">
        <div className="h-10 border-b border-gray-200/70 dark:border-gray-800/70 bg-gray-100/60 dark:bg-gray-800/40" />
        <div className="h-[75vh] bg-gray-100/40 dark:bg-gray-900/40 animate-pulse" />
      </div>
    </div>
  );
}
