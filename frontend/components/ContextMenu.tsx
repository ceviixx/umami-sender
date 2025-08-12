'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useRef, useState } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { createPortal } from "react-dom";

type MenuTone = "default" | "danger" | "success" | "warning";
export type MenuItem = {
  title: string;
  action: () => void;
  tone?: MenuTone;
  disabled?: boolean;
  icon?: React.ReactNode;
};
type Props = { items: MenuItem[]; buttonClassName?: string; menuClassName?: string; };

const toneClasses: Record<MenuTone, string> = {
  default: "text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-gray-800/60",
  danger: "text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-900/40 font-semibold",
  success: "text-green-600 dark:text-green-400 hover:bg-green-50/70 dark:hover:bg-green-900/40",
  warning: "text-amber-600 dark:text-amber-400 hover:bg-amber-50/70 dark:hover:bg-amber-900/40",
};

const toneIconHover: Record<MenuTone, string> = {
  default: "group-hover/button:text-gray-900 dark:group-hover/button:text-gray-100",
  danger:  "group-hover/button:text-red-600 dark:group-hover/button:text-red-400",
  success: "group-hover/button:text-green-600 dark:group-hover/button:text-green-400",
  warning: "group-hover/button:text-amber-600 dark:group-hover/button:text-amber-400",
};

export default function ContextMenu({ items, buttonClassName, menuClassName }: Props) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  if (items.length === 1) {
    const item = items[0];
    const tone = item.tone ?? "default";

    return (
      <div className="relative" data-row-link-ignore>
        <button
          ref={btnRef}
          type="button"
          onClick={() => !item.disabled && item.action()}
          title={item.title}
          aria-label={item.title}
          disabled={item.disabled}
          className={clsx(
            "group/button inline-flex h-9 w-9 items-center justify-center rounded-full",
            "bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm",
            "border border-gray-200/70 dark:border-gray-800/60",
            "text-gray-600 dark:text-gray-300",
            "hover:bg-gray-100/70 dark:hover:bg-gray-800/60",
            "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
            item.disabled && "opacity-50 cursor-not-allowed",
            buttonClassName
          )}
          data-row-link-ignore
        >
          <span
            className={clsx(
              "inline-flex items-center justify-center h-5 w-5",
              "text-current transition-colors",
              toneIconHover[tone]
            )}
            aria-hidden="true"
          >
            {item.icon ?? <EllipsisHorizontalIcon className="h-5 w-5" />}
          </span>
        </button>
      </div>
    );
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const panel = document.getElementById("cm-panel");
      if (panel && e.target instanceof Node) {
        if (!panel.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const updatePos = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ top: r.bottom + 8, left: r.right });
  };

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div className="relative" data-row-link-ignore>
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        title={locale.ui.context_menu}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={locale.ui.context_menu}
        className={clsx(
          "group inline-flex h-9 w-9 items-center justify-center rounded-full",
          "bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm",
          "border border-gray-200/70 dark:border-gray-800/60",
          "text-gray-600 dark:text-gray-300",
          "hover:bg-gray-100/70 dark:hover:bg-gray-800/60",
          "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
          open && "bg-gray-100/70 dark:bg-gray-800/60",
          buttonClassName
        )}
        data-row-link-ignore
      >
        <EllipsisHorizontalIcon
          className={clsx("h-5 w-5 transition-transform duration-200", open ? "rotate-90" : "group-hover:rotate-90")}
          aria-hidden="true"
        />
      </button>

      {open && pos &&
        createPortal(
          <div
            id="cm-panel"
            className={clsx(
              "fixed z-[1000] min-w-[12rem] rounded-2xl shadow-lg",
              "bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm",
              "border border-gray-200/70 dark:border-gray-800/60",
              "ring-0 origin-top-right animate-[menuPop_.14s_ease-out]",
              menuClassName
            )}
            style={{ top: pos.top, left: pos.left, transform: "translateX(-100%)" }}
            role="menu"
          >
            <ul className="py-1.5 text-sm">
              {items.map((item, idx) => {
                const tone = item.tone ?? "default";
                return (
                  <li key={idx} className="px-1" data-row-link-ignore>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      onClick={() => { if (!item.disabled) { setOpen(false); item.action(); } }}
                      className={clsx(
                        "w-full flex items-center gap-2 px-4 py-2 text-left transition rounded-md",
                        toneClasses[tone],
                        item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                      )}
                    >
                      {item.icon && <span className="shrink-0 text-gray-500 dark:text-gray-400">{item.icon}</span>}
                      <span className="truncate">{item.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>,
          document.body
        )
      }

      <style jsx>{`
        @keyframes menuPop {
          0% { opacity: 0; transform: translateX(-100%) translateY(-4px) scale(0.98); }
          100% { opacity: 1; transform: translateX(-100%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
