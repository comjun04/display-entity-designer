import i18n, { Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from './en/translation.json'

export const defaultNS = 'translation'
export const resources = {
  en: {
    translation: enTranslation,
  },
} as const satisfies Resource

void i18n.use(initReactI18next).init({
  lng: 'en',
  resources,
  defaultNS,
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
})

export default i18n
