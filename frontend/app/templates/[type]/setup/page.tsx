'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchTemplate, 
  updateTemplate 
} from '@/lib/api/templates';
import PageHeader from '@/components/PageHeader';
import FormButtons from '@/components/FormButtons';
import { showSuccess, showError } from '@/lib/toast';
import TextInput from "@/components/TextInput";

export default function SetupPage({ params }: { params: { type: string } }) {
  const senderTypeFromParam = params.type;

  const fullSenderType =
    senderTypeFromParam === 'email'
      ? 'EMAIL'
      : `WEBHOOK_${senderTypeFromParam.toUpperCase()}`;

  const router = useRouter();
  const { locale } = useI18n();

  const [form, setForm] = useState<{
    description: string;
    type: string;
    sender_type: string;
    html?: string;
    json?: string;
  }>({
    description: '',
    type: 'custom',
    sender_type: fullSenderType,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [usedPlaceholders, setUsedPlaceholders] = useState<string[]>([]);  // Verfolgung der verwendeten Platzhalter

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const checkPlaceholders = (template: string | undefined) => {
    const placeholders = [
      '{{ summary.period }}',
      '{{ summary.stats.pageviews }}',
      /{% for entry in summary\.pageviews %}[\s\S]*?{{ entry\.[a-zA-Z0-9_]+ }}[\s\S]*?{% endfor %}/,
      /{% for entry in summary\.referrers %}[\s\S]*?{{ entry\.[a-zA-Z0-9_]+ }}[\s\S]*?{% endfor %}/,
    ];
    if (template != undefined) {
      return placeholders.every((placeholder) => {
        if (typeof placeholder === 'string') {
          return template.includes(placeholder);
        } else if (placeholder instanceof RegExp) {
          return placeholder.test(template);
        }
        return false;
      });
    }
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm((prevState) => {
      if (name === "description" && prevState.description === value) {
        return prevState;
      }

      const updatedForm = { ...prevState, [name]: value };

      // Platzhalter bei html/json dynamisch erkennen
      if (name === "html" || name === "json") {
        const allPlaceholders = categories.flatMap(c => c.placeholders.map(p => p.placeholder));
        const detectedPlaceholders = allPlaceholders.filter(ph => value.includes(ph));
        setUsedPlaceholders(detectedPlaceholders);
      }

      return updatedForm;
    });
  };




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kopiere das aktuelle Form-Objekt
    let payload = { ...form };

    // Überprüfen und Anpassen des Payloads je nach sender_type
    if (form.sender_type === 'EMAIL') {
      delete payload.json;
    } else if (form.sender_type.startsWith('WEBHOOK_')) {
      delete payload.html;
    }

    setIsSaving(true);

    try {
      await updateTemplate(params.type, payload);
      showSuccess('Template erfolgreich erstellt');
      router.push('/templates');
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Fehler beim Speichern';
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };


  useEffect(() => {
    let isValidTemplate = false;

    if (form.sender_type === 'EMAIL') {
      isValidTemplate = checkPlaceholders(form.html);
    } else if (form.sender_type.startsWith('WEBHOOK')) {
      isValidTemplate = checkPlaceholders(form.json);
    }

    setIsSaveDisabled(!isValidTemplate);
  }, [form.sender_type, form.html, form.json]);



  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const templateData = await fetchTemplate(params.type);

        // Extrahiere aktuelle Inhalte
        const html = templateData.html || '';
        const json = templateData.json || '';

        // Finde bereits enthaltene Platzhalter
        const allPlaceholders = categories.flatMap(c => c.placeholders.map(p => p.placeholder));
        const contentToCheck = fullSenderType === 'EMAIL' ? html : json;
        const detectedPlaceholders = allPlaceholders.filter(ph => contentToCheck.includes(ph));

        setForm({
          description: templateData.description || '',
          sender_type: templateData.sender_type,
          html,
          json,
          type: 'custom',
        });

        setUsedPlaceholders(detectedPlaceholders);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    };

    loadTemplate();
  }, [params.type]);



  const handleInsertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById(form.sender_type === 'EMAIL' ? 'templateHtml' : 'templateJson') as HTMLTextAreaElement;

    if (textarea) {
      const cursorPosition = textarea.selectionStart; // aktuelle Cursor-Position
      const currentText = textarea.value;

      // Text vor und nach der Cursor-Position
      const textBeforeCursor = currentText.slice(0, cursorPosition);
      const textAfterCursor = currentText.slice(cursorPosition);

      // Neuer Text mit dem Platzhalter an der Cursor-Position
      const updatedText = textBeforeCursor + placeholder + textAfterCursor;

      // Jetzt den neuen Text setzen
      textarea.value = updatedText;

      // Den Cursor wieder an die richtige Stelle setzen
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + placeholder.length;

      // Zustand aktualisieren
      setForm((prevState) => {
        const updatedValue = prevState.sender_type === 'EMAIL'
          ? updatedText
          : prevState.json + placeholder;

        return {
          ...prevState,
          [prevState.sender_type === 'EMAIL' ? 'html' : 'json']: updatedValue,
        };
      });

      // Verfolgen des verwendeten Platzhalters
      setUsedPlaceholders((prev) => [...prev, placeholder]);
    }
  };


  const senderTypeOptions = [
    { label: 'Email', value: 'EMAIL' },
    { label: 'Webhook Discord', value: 'WEBHOOK_DISCORD' },
    { label: 'Webhook Slack', value: 'WEBHOOK_SLACK' },
    { label: 'Webhook MS Teams', value: 'WEBHOOK_MS_TEAMS' },
    { label: 'Webhook Mattermost', value: 'WEBHOOK_MATTERMOST' },
    { label: 'Webhook Custom', value: 'WEBHOOK_CUSTOM' },
  ];

  const getSenderTypeLabel = (value: string) => {
    const match = senderTypeOptions.find(option => option.value === value);
    return match ? match.label : value; // fallback auf value, falls nichts gefunden wird
  };


  const categories = [
    {
      category: 'Base',
      placeholders: [
        { label: locale.enums.template_insert_placeholder.job_name, placeholder: '{{ summary.name }}' },
        { label: locale.enums.template_insert_placeholder.period, placeholder: '{{ summary.period }}' },
      ],
    },
    {
      category: 'Stats',
      placeholders: [
        { label: locale.enums.template_insert_placeholder.pageviews, placeholder: '{{ summary.stats.pageviews }}' },
        { label: locale.enums.template_insert_placeholder.visits, placeholder: '{{ summary.stats.visits }}' },
        { label: locale.enums.template_insert_placeholder.visitors, placeholder: '{{ summary.stats.visitors }}' },
        { label: locale.enums.template_insert_placeholder.bounce_rate, placeholder: '{{ summary.stats.bounces }}' },
        { label: locale.enums.template_insert_placeholder.visit_duration, placeholder: '{{ summary.stats.totaltime }}' },
      ],
    },
    {
      category: 'Lists',
      placeholders: [
        { label: locale.enums.template_insert_placeholder.top_pageviews, placeholder: '{% for entry in summary.pageviews %}{{ entry.x }}{{ entry.y }}{% endfor %}' },
        { label: locale.enums.template_insert_placeholder.top_referrer, placeholder: '{% for entry in summary.referrers %}{{ entry.x }}{{ entry.y }}{% endfor %}' },
      ],
    },
  ];

  const filteredPlaceholders = categories
    .flatMap(category => category.placeholders)
    .filter(placeholder => !usedPlaceholders.includes(placeholder.placeholder));

  return (
    <div className="max-w-4xl mx-auto p-6">
          <PageHeader title={getSenderTypeLabel(fullSenderType)} />
          <form onSubmit={handleSubmit} className="space-y-4">
            {/*
            <TextInput
              label={locale.forms.labels.description}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={locale.forms.labels.description}
            />
            */}

            {form.sender_type === 'EMAIL' ? (
              <textarea
                id="templateHtml"
                name="html"
                value={form.html}
                onChange={handleChange}
                rows={10}
                className="w-full border p-4 rounded-md"
                placeholder="HTML Template"
                ref={textAreaRef}
              />
            ) : form.sender_type.includes('WEBHOOK') ? (
              <textarea
                id="templateJson"
                name="json"
                value={form.json}
                onChange={handleChange}
                rows={10}
                className="w-full border p-4 rounded-md"
                placeholder="Webhook JSON"
                ref={textAreaRef}
              />
            ) : (
              <span></span>
            )}
    
            {form.sender_type && (
            <div className="overflow-x-auto">
              <div className="whitespace-nowrap">
                {filteredPlaceholders.map((placeholder) => (
                  <button
                    key={placeholder.placeholder}
                    onClick={() => handleInsertPlaceholder(placeholder.placeholder)}
                    className="inline-block px-2 py-1 mx-1 border rounded-full bg-gray-200 text-xs text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    {placeholder.label}
                  </button>
                ))}
              </div>
            </div>
            )}
            
    
            <FormButtons
                cancelLabel={locale.buttons.cancel}
                saveLabel={locale.buttons.save}
                disabled={isSaveDisabled || isSaving}
              />
          </form>
        </div>
  );
}
