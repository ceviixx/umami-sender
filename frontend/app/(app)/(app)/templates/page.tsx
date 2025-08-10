'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchTemplatePreview, fetchTemplates } from '@/lib/api/templates'
import { Template } from '@/types'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { showSuccess, showError } from "@/lib/toast";
import { Button } from "@headlessui/react";
import {
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/20/solid'
import CardItem from "@/components/CardItem";

function Modal({
  isOpen,
  onClose,
  content,
  templateType,
  onRefresh,
}: {
  isOpen: boolean,
  onClose: () => void,
  content: string,
  templateType: string,
  onRefresh: (templateType: string) => void
}) {
  const { locale } = useI18n()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {locale.ui.template_preview}
          </h3>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onRefresh(templateType)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-bold"
              title={locale.buttons.refresh}
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-bold"
              title={locale.buttons.close}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div
          className="mt-4 overflow-auto max-h-[70vh] text-gray-900 dark:text-gray-100"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<string>("")
  const [currentTemplateType, setCurrentTemplateType] = useState<string | null>(null)
  const router = useRouter()
  const { locale } = useI18n()
  const [networkError, setHasNetworkError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch((error) => {
        setHasNetworkError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const openModal = (templateType: string) => {
    setCurrentTemplateType(templateType);
    fetchTemplatePreview(templateType)
      .then((html) => {
        setModalContent(html);
        setIsModalOpen(true);
      })
      .catch((error) => {
        showError("Failed to load preview: " + error.message);
      });
  };

  const handleRefresh = (templateType: string) => {
    fetchTemplatePreview(templateType)
      .then((html) => {
        setModalContent(html);
        showSuccess(locale.ui.preview_refreshed || "Preview refreshed");
      })
      .catch((error) => {
        showError("Failed to refresh preview: " + error.message);
      });
  };

  if (loading) { return <LoadingSpinner title={locale.pages.templates} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title={locale.pages.templates} />

      {templates.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3">
          {templates.map(t => (
            <CardItem
              key={t.id}
              rightSlot={
                <Button
                  onClick={() => openModal(t.sender_type)}
                  className="w-5 h-5 m-2 rounded-full border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white flex items-center justify-center transition"
                  title={locale.ui.preview}
                >
                  <EyeIcon className="w-4 h-4" />
                </Button>
              }
            >
              <div>
                <div className="font-semibold whitespace-nowrap">
                  {locale.enums.sender_report_template_type[t.sender_type as "EMAIL_SUMMARY"] || t.sender_type}
                </div>
                <div className="text-sm text-gray-600">
                  {t.sender_type.includes("EMAIL") && (
                    <span className="text-sm text-gray-500">{locale.ui.mail}</span>
                  )}
                  {t.sender_type.includes("WEBHOOK") && (
                    <span className="text-sm text-gray-500">{locale.ui.webhook}</span>
                  )}
                </div>
              </div>
            </CardItem>
          ))}
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={modalContent}
        templateType={currentTemplateType ?? ""}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
