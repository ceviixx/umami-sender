'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useRef, useState } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

type MenuTone = "default" | "danger" | "success" | "warning";

export type MenuItem = {
  title: string;
  action: () => void;
  tone?: MenuTone;
  disabled?: boolean;
  icon?: React.ReactNode;
};

type Props = {
  items: MenuItem[];
  buttonClassName?: string;
  menuClassName?: string;
};

const toneClasses: Record<MenuTone, string> = {
  default:
    "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
  danger:
    "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 font-semibold",
  success:
    "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900",
  warning:
    "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900",
};

export default function ContextMenu({ items, buttonClassName, menuClassName }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { locale } = useI18n();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-5 h-5 m-2 rounded-full border border-gray-600 dark:border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-300 hover:text-white dark:hover:text-black flex items-center justify-center transition",
          buttonClassName
        )}
        title={locale.ui.context_menu}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={locale.ui.context_menu}
      >
        <EllipsisHorizontalIcon />
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 z-50 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10",
            menuClassName
          )}
          role="menu"
        >
          <ul className="py-1 text-sm">
            {items.map((item, idx) => {
              const tone = item.tone ?? "default";
              const base =
                "w-full flex items-center gap-2 px-4 py-2 text-left transition";
              const disabledCls =
                "opacity-50 cursor-not-allowed hover:bg-transparent";
              return (
                <li key={idx} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.disabled) return;
                      setOpen(false);
                      item.action();
                    }}
                    className={clsx(
                      base,
                      toneClasses[tone],
                      item.disabled && disabledCls
                    )}
                  >
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
