import i18n, { Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { getStoredSettings } from '@/services/settings'

import enTranslation from './en/translation.json'
import koTranslation from './ko/translation.json'

export const defaultNS = 'translation'
export const resources = {
  en: {
    translation: enTranslation,
  },
  ko: {
    translation: koTranslation,
  },
} as const satisfies Resource

const storedSettings = getStoredSettings()

i18n
  .use(initReactI18next)
  .init({
    lng: storedSettings.general.language,
    fallbackLng: 'en',
    debug: true,
    resources,
    defaultNS,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })
  .catch(console.error)

export default i18n
