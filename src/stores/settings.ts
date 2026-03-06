import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import i18n from '../i18n';

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  designStyle: 'solid' | 'glass';
  columns: number;
  onboarded: boolean;
  language: 'en' | 'ru';
}
export const useSettingsStore = defineStore('settings', () => {
  const getDefaultLanguage = (): 'en' | 'ru' => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ru' ? 'ru' : 'en';
  };

  const settings = ref<SettingsState>({
    theme: 'system',
    designStyle: 'solid',
    columns: 5,
    onboarded: false,
    language: getDefaultLanguage()
  });

  const isLoaded = ref(false);

  const applyTheme = () => {
    const isDark = 
      settings.value.theme === 'dark' || 
      (settings.value.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (settings.value.designStyle === 'glass') {
      document.documentElement.classList.add('glass-theme');
    } else {
      document.documentElement.classList.remove('glass-theme');
    }
    
    // Apply language
    (i18n.global.locale as any).value = settings.value.language;
  };

  // Load from chrome.storage.sync
  const loadSettings = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      const data = await chrome.storage.sync.get('bentomark_settings');
      if (data.bentomark_settings) {
        settings.value = { ...settings.value, ...data.bentomark_settings };
      }
    }
    isLoaded.value = true;
    applyTheme();
  };

  // Watch for changes and save to chrome.storage.sync
  watch(settings, (newSettings) => {
    if (isLoaded.value && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ bentomark_settings: newSettings });
    }
    applyTheme();
  }, { deep: true });

  const init = async () => {
    await loadSettings();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  }

  return { settings, isLoaded, init, applyTheme };
});