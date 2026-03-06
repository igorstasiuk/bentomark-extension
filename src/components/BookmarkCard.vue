<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useBookmarksStore } from '../stores/bookmarks'
import { getMedia } from '../lib/storage'

const props = defineProps<{
  bookmark: { id: string; title: string; url: string; coverImageId?: string }
}>()

const emit = defineEmits<{
  (e: 'edit', id: string): void
}>()

const store = useBookmarksStore()
const imageUrl = ref<string | null>(null)

const loadCoverImage = async () => {
  if (props.bookmark.coverImageId) {
    const file = await getMedia(props.bookmark.coverImageId)
    if (file && file instanceof Blob) {
      if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
      imageUrl.value = URL.createObjectURL(file)
    }
  } else {
    imageUrl.value = null
  }
}

onMounted(loadCoverImage)
watch(() => props.bookmark.coverImageId, loadCoverImage)

onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
})
</script>

<template>
  <a 
    :href="bookmark.url" 
    target="_blank" 
    class="flex flex-col p-4 h-48 rounded-3xl shadow-sm hover:shadow-lg transition-all border border-white/50 dark:border-gray-700/50 glass:border-white/40 glass:dark:border-white/10 group relative overflow-hidden bg-contain bg-center bg-no-repeat glass:backdrop-blur-xl glass:shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] glass:dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]" 
    :class="{ 'bg-white/90 dark:bg-gray-800/90 glass:bg-white/30 glass:dark:bg-black/40': !imageUrl }" 
    :style="imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundColor: '#0f172a' } : {}"
  >
    <div v-if="imageUrl" class="absolute inset-0 bg-black/40 z-0 group-hover:bg-black/50 transition-colors"></div>
    <div class="flex items-center justify-between mb-4 relative z-10">
      <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden shadow-sm">
        <img :src="`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=64`" :alt="bookmark.title" class="w-6 h-6" />
      </div>
      <div class="flex gap-2">
        <button @click.prevent="$emit('edit', bookmark.id)" class="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 dark:bg-gray-800/80 p-1.5 rounded-full" :class="{ 'text-white/80 hover:text-blue-400 bg-black/30': imageUrl }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </button>
        <button @click.prevent="store.deleteItem(bookmark.id)" class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 dark:bg-gray-800/80 p-1.5 rounded-full" :class="{ 'text-white/80 hover:text-red-400 bg-black/30': imageUrl }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>
    <div class="mt-auto relative z-10">
      <h3 class="text-sm font-semibold truncate" :class="imageUrl ? 'text-white' : 'text-gray-800 dark:text-gray-100'">{{ bookmark.title }}</h3>
      <p class="text-xs truncate mt-1" :class="imageUrl ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'">{{ bookmark.url }}</p>
    </div>
  </a>
</template>
