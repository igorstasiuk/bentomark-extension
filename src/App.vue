<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Header from './components/Header.vue'
import GridBoard from './components/GridBoard.vue'
import AddModal from './components/AddModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import OnboardingModal from './components/OnboardingModal.vue'
import { useBookmarksStore, type Item } from './stores/bookmarks'
import { useSettingsStore } from './stores/settings'
import { getMedia } from './lib/storage'

const bookmarksStore = useBookmarksStore()
const settingsStore = useSettingsStore()

const isAddModalOpen = ref(false)
const isSettingsModalOpen = ref(false)
const backgroundUrl = ref<string | null>(null)
const editItem = ref<Item | null>(null)
const initialUrl = ref<string>('')

const loadBackground = async () => {
  const bg = await getMedia('background')
  if (bg && bg instanceof Blob) {
    if (backgroundUrl.value) {
      URL.revokeObjectURL(backgroundUrl.value)
    }
    backgroundUrl.value = URL.createObjectURL(bg)
  } else {
    backgroundUrl.value = null
  }
}

onMounted(async () => {
  await bookmarksStore.init()
  await settingsStore.init()
  await loadBackground()
})

// Theme handler
watch(() => settingsStore.settings.theme, (theme) => {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, { immediate: true })

// Design Style handler
watch(() => settingsStore.settings.designStyle, (style) => {
  if (style === 'glass') {
    document.documentElement.classList.add('glass')
  } else {
    document.documentElement.classList.remove('glass')
  }
}, { immediate: true })

const openAddModal = () => {
  editItem.value = null
  initialUrl.value = ''
  isAddModalOpen.value = true
}

const openEditModal = (item: Item) => {
  editItem.value = item
  initialUrl.value = ''
  isAddModalOpen.value = true
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (event.dataTransfer) {
    const url = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain')
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      editItem.value = null
      initialUrl.value = url
      isAddModalOpen.value = true
    }
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}
</script>

<template>
  <div 
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col relative w-full h-full p-4 overflow-hidden"
    @drop="handleDrop"
    @dragover="handleDragOver"
  >
    <!-- Abstract Background or Custom Image -->
    <div 
      class="absolute inset-0 z-0 opacity-80 pointer-events-none transition-all duration-700 bg-cover bg-center"
      :class="{ 'bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-indigo-950 dark:via-gray-900 dark:to-purple-900': !backgroundUrl }"
      :style="backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : {}"
    ></div>

    <div class="relative z-10 w-full h-full flex flex-col gap-6 px-8">
      <Header @add="openAddModal" @settings="isSettingsModalOpen = true" />
      <GridBoard @edit="openEditModal" />
    </div>

    <AddModal :is-open="isAddModalOpen" :edit-item="editItem" :initial-url="initialUrl" @close="isAddModalOpen = false" />
    <SettingsModal :is-open="isSettingsModalOpen" @close="isSettingsModalOpen = false" @background-updated="loadBackground" />
    <OnboardingModal />
  </div>
</template>

<style scoped>
</style>
