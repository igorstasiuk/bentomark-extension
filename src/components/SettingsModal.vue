<script setup lang="ts">
import { useSettingsStore } from '../stores/settings'
import { useBookmarksStore } from '../stores/bookmarks'
import { saveMedia } from '../lib/storage'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'background-updated'): void
}>()

const store = useSettingsStore()
const bookmarksStore = useBookmarksStore()

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      await saveMedia('background', file)
      emit('background-updated')
    }
  }
}

const handleClearBackground = async () => {
  await saveMedia('background', '')
  emit('background-updated')
}

const exportData = () => {
  const data = JSON.stringify(bookmarksStore.state, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bentomark-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importData = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (data && typeof data === 'object' && data.items && Array.isArray(data.layoutOrder)) {
        bookmarksStore.state = data
        alert('Import successful!')
      } else {
        alert('Invalid backup file format.')
      }
    } catch (e) {
      alert('Error parsing JSON file.')
    }
  }
}

const importFromChrome = () => {
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const processNodes = (nodes: chrome.bookmarks.BookmarkTreeNode[], parentId?: string) => {
        for (const node of nodes) {
          if (node.url) {
            bookmarksStore.addBookmark(node.title || 'Untitled', node.url, parentId)
          } else {
            let newParentId = parentId;
            // Skip the absolute root node which has no title
            if (node.title) {
              newParentId = bookmarksStore.addGroup(node.title, parentId)
            }
            if (node.children) {
              processNodes(node.children, newParentId)
            }
          }
        }
      }
      processNodes(bookmarkTreeNodes)
      alert('Bookmarks imported successfully!')
    })
  } else {
    alert('Chrome Bookmarks API is not available. Ensure you are running as an extension with "bookmarks" permission.')
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 glass:bg-white/70 glass:dark:bg-black/40 glass:backdrop-blur-2xl glass:border-white/50 glass:dark:border-white/10 glass:shadow-2xl p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto transition-all">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>
      
      <div class="space-y-6">
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
            <select v-model="store.settings.theme" class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 glass:border-white/40 glass:dark:border-white/10 bg-white dark:bg-gray-700 glass:bg-white/50 glass:dark:bg-black/50 text-gray-900 dark:text-white outline-none">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Style</label>
            <select v-model="store.settings.designStyle" class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 glass:border-white/40 glass:dark:border-white/10 bg-white dark:bg-gray-700 glass:bg-white/50 glass:dark:bg-black/50 text-gray-900 dark:text-white outline-none">
              <option value="solid">Solid</option>
              <option value="glass">Liquid Glass</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Columns: {{ store.settings.columns }}</label>
          <input type="range" v-model.number="store.settings.columns" min="2" max="8" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Image</label>
          <input type="file" accept="image/*" @change="handleFileUpload" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
          <button @click="handleClearBackground" class="mt-2 text-xs text-red-500 hover:underline block">Clear Background</button>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Management</label>
          <button @click="importFromChrome" class="w-full mb-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white transition-colors text-sm font-medium">Fetch Chrome Bookmarks</button>
          
          <div class="flex gap-4">
            <button @click="exportData" class="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium">Export JSON</button>
            <label class="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer text-center text-sm font-medium block">
              <span class="leading-loose">Import JSON</span>
              <input type="file" accept=".json" @change="importData" class="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-8">
        <button @click="$emit('close')" class="px-5 py-2 rounded-xl font-medium bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/30 transition-all">Done</button>
      </div>
    </div>
  </div>
</template>
