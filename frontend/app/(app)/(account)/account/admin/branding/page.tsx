'use client';

import { useI18n } from '@/locales/I18nContext';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
import { TrashIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { fetchBranding, fetchLogo, uploadLogo, deleteLogo } from '@/lib/api/settings';
import Container from '@/components/layout/Container';
import PageHeader from '@/components/navigation/PageHeader';

type LogoConfig = {
  storage?: 'file';
  url?: string | null;
  path?: string | null;
  mime?: string | null;
  width?: number | null;
  height?: number | null;
  sha256?: string | null;
  size?: number | null;
};

const MAX_BYTES = 1_000_000;
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export default function BrandingSettingsPage() {
  const { locale } = useI18n();
  const [logo, setLogo] = useState<LogoConfig | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [banner, setBanner] = useState<{ type: 'error' | 'success' | 'info'; msg: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cacheBustedSrc = useMemo(() => {
    if (!previewSrc) return null;
    const isBlob = previewSrc.startsWith('blob:');
    if (isBlob) return previewSrc;
    return logo?.sha256 ? `${previewSrc}?v=${logo.sha256}` : previewSrc;
  }, [previewSrc, logo?.sha256]);

  const revokeIfBlob = (url?: string | null) => {
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
  };

  const loadBrandingAndLogo = useCallback(async () => {
    revokeIfBlob(previewSrc);
    try {
      const img = await fetchBranding();
      if (typeof img === 'string') {
        setPreviewSrc(img);
      } else if (img instanceof Blob) {
        setPreviewSrc(URL.createObjectURL(img));
      } else if (img && (img as any).byteLength !== undefined) {
        const blob = new Blob([img as ArrayBuffer], { type: 'image/*' });
        setPreviewSrc(URL.createObjectURL(blob));
      } else {
        setPreviewSrc('/api/logo');
      }
    } catch {
      setPreviewSrc('/api/logo');
    }

    try {
      const meta = await fetchLogo();
      setLogo(meta && Object.keys(meta).length ? meta : null);
    } catch {
      setLogo(null);
    }
  }, [previewSrc]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadBrandingAndLogo();
      setLoading(false);
    })();
    return () => revokeIfBlob(previewSrc);
  }, []);

  const validateFile = (f: File) => {
    if (!ALLOWED_MIMES.includes(f.type)) return `Ungültiger Typ: ${f.type || 'unbekannt'}`;
    if (f.size > MAX_BYTES) return `Datei zu groß: ${(f.size / 1024 / 1024).toFixed(2)} MB (max. 1 MB)`;
    return null;
  };

  const handleUpload = async (f: File) => {
    const err = validateFile(f);
    if (err) {
      setBanner({ type: 'error', msg: err });
      return;
    }
    setBusy(true);
    setBanner(null);
    try {
      const form = new FormData();
      form.append('file', f);
      const data = await uploadLogo(form);
      setLogo(data || null);
      await loadBrandingAndLogo();
      setBanner({ type: 'success', msg: 'Logo aktualisiert.' });
    } catch (e: any) {
      setBanner({ type: 'error', msg: e?.message || 'Upload fehlgeschlagen' });
    } finally {
      setBusy(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await handleUpload(f);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (busy) return;
    const f = e.dataTransfer.files?.[0];
    if (f) await handleUpload(f);
  }, [busy]);

  const onDelete = async () => {
    setBusy(true);
    setBanner(null);
    try {
      await deleteLogo();
      setLogo(null);
      await loadBrandingAndLogo();
      setBanner({ type: 'success', msg: 'Logo entfernt.' });
    } catch (e: any) {
      setBanner({ type: 'error', msg: e?.message || 'Löschen fehlgeschlagen' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container>
      <PageHeader
        title={locale.pages.admin.branding}
      />

      <section
        className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 shadow-sm"
        aria-labelledby="branding-card-title"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-3">
          <h2 id="branding-card-title" className="text-sm font-semibold">
            {locale.admin_branding.sections.brandLogo}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className={clsx(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm',
                'ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800',
                busy && 'opacity-60 cursor-not-allowed'
              )}
              title={locale.buttons.replace}
            >
              <ArrowPathIcon className="h-4 w-4" />
              {locale.buttons.replace}
            </button>
            {previewSrc && (
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm',
                  'ring-1 ring-inset ring-gray-300 dark:ring-red-700 hover:bg-red-50 dark:hover:bg-red-800',
                  busy && 'opacity-60 cursor-not-allowed'
                )}
                title={locale.buttons.delete}
              >
                <TrashIcon className="h-4 w-4" />
                {locale.buttons.delete}
              </button>
            )}
          </div>
        </div>

        {banner && <Banner type={banner.type} message={banner.msg} className="mx-5 mt-3" />}

        <div className="grid gap-6 p-5 lg:grid-cols-[280px,1fr]">
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              className={clsx(
                'relative aspect-[3/1] w-full max-w-[480px] rounded-xl overflow-hidden',
                'border-2 border-dashed transition',
                isDragOver ? 'border-blue-500/70 ring-2 ring-blue-500/30' : 'border-gray-200 dark:border-gray-800'
              )}
              aria-label="Logo Upload Zone"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,_#f3f4f680_25%,_transparent_25%),linear-gradient(-45deg,_#f3f4f680_25%,_transparent_25%),linear-gradient(45deg,_transparent_75%,_#f3f4f680_75%),linear-gradient(-45deg,_transparent_75%,_#f3f4f680_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] dark:bg-[linear-gradient(45deg,_#11182780_25%,_transparent_25%),linear-gradient(-45deg,_#11182780_25%,_transparent_25%),linear-gradient(45deg,_transparent_75%,_#11182780_75%),linear-gradient(-45deg,_transparent_75%,_#11182780_75%)]" />

              <div className="absolute inset-0 flex items-center justify-center p-4">
                {loading ? (
                  <div className="h-10 w-40 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
                ) : cacheBustedSrc ? (
                  <img
                    src={cacheBustedSrc}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain drop-shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                    <div className="h-12 w-12 rounded-md ring-1 ring-inset ring-gray-200 dark:ring-gray-800 flex items-center justify-center bg-white/70 dark:bg-black/20">
                      <PhotoIcon className="h-6 w-6 opacity-70" />
                    </div>
                  </div>
                )}
              </div>

              {isDragOver && (
                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] pointer-events-none" />
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_MIMES.join(',')}
              onChange={onFileChange}
              className="hidden"
            />

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {locale.admin_branding.uploadHint}
            </p>
          </div>

          <div className="grid gap-4 self-start">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {locale.admin_branding.details.title}
              </h3>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Meta label={locale.admin_branding.details.values.type}>{logo?.mime || '–'}</Meta>
                <Meta label={locale.admin_branding.details.values.size}>{logo?.width && logo?.height ? `${logo.width}×${logo.height}px` : '–'}</Meta>
                <Meta label={locale.admin_branding.details.values.hash}>{logo?.sha256 ? <code className="text-xs break-all">{logo.sha256}</code> : '–'}</Meta>
                <Meta label={locale.admin_branding.details.values.storage}>{logo?.storage || '–'}</Meta>
              </dl>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {locale.admin_branding.tips.title}
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>{locale.admin_branding.tips.values.recommendation}</li>
                <li>{locale.admin_branding.tips.values.maxHeight}</li>
                <li>{locale.admin_branding.tips.values.exportInfo}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}

/* ---------- kleine Inline‑UI‑Bausteine ---------- */

function Banner({ type, message, className }: { type: 'error' | 'success' | 'info'; message: string; className?: string }) {
  const palette =
    type === 'error'
      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200'
      : type === 'success'
        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
        : 'border-amber-200 dark:border-yellow-900/50 bg-amber-50/70 dark:bg-yellow-950/30 text-amber-900 dark:text-amber-200';
  return <div className={clsx('rounded-xl border p-3 text-sm', palette, className)}>{message}</div>;
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-gray-900 dark:text-gray-100">{children}</dd>
    </div>
  );
}
