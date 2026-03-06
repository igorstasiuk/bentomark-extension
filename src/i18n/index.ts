import { createI18n } from 'vue-i18n'
import en from './en'
import ru from './ru'

export type MessageSchema = typeof en

const i18n = createI18n<[MessageSchema], 'en' | 'ru'>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    ru
  }
})

export default i18n
