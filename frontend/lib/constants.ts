'use client'

import { useI18n } from "@/locales/I18nContext"

export function useWeekdays() {
  const { locale } = useI18n()

  return [
    { value: 0, label: locale.weekdays.monday },
    { value: 1, label: locale.weekdays.tuesday },
    { value: 2, label: locale.weekdays.wednesday },
    { value: 3, label: locale.weekdays.thursday },
    { value: 4, label: locale.weekdays.friday },
    { value: 5, label: locale.weekdays.saturday },
    { value: 6, label: locale.weekdays.sunday },
  ]
}

export function useOptions() {
  const { locale } = useI18n()

  return [
    { value: 'stats', label: locale.enums.metrics.stats },
    { value: 'url', label: locale.enums.metrics.url },
    { value: 'referrer', label: locale.enums.metrics.referrer },
    { value: 'channel', label: locale.enums.metrics.channel },
    { value: 'browser', label: locale.enums.metrics.browser },
    { value: 'os', label: locale.enums.metrics.os },
    { value: 'device', label: locale.enums.metrics.device },
    { value: 'country', label: locale.enums.metrics.country },
    { value: 'region', label: locale.enums.metrics.region },
    { value: 'city', label: locale.enums.metrics.city },
    { value: 'language', label: locale.enums.metrics.language },
    { value: 'screen', label: locale.enums.metrics.screen },
    { value: 'event', label: locale.enums.metrics.event },
    { value: 'query', label: locale.enums.metrics.query },
    { value: 'host', label: locale.enums.metrics.host },
    { value: 'tag', label: locale.enums.metrics.tag },
  ];
}