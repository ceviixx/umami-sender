'use client'

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/locales/I18nContext";
import { GlobeAltIcon } from '@heroicons/react/20/solid';

const LanguageSwitcher = () => {
  const { lang, setLang } = useI18n();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    // { code: "es", label: "Español" },
  ];

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  // ❌ Click outside → Dropdown schließen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative ml-4" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 transition-colors rounded-md"
        aria-label="Sprache wechseln"
      >
        <GlobeAltIcon className="w-5 h-5" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fadeIn">
          <ul className="py-1">
            {languages.map((language) => (
              <li key={language.code}>
                <button
                  onClick={() => {
                    setLang(language.code);
                    setDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                    lang === language.code ? "bg-blue-50 font-semibold text-blue-700" : ""
                  }`}
                >
                  <span>{language.label}</span>
                  {lang === language.code && (
                    <span className="text-blue-600 text-base">✔</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
