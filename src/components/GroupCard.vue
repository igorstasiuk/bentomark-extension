<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import draggable from 'vuedraggable'
import { useBookmarksStore, type Item } from '../stores/bookmarks'
import { getMedia } from '../lib/storage'

const props = defineProps<{
  group: { id: string; title: string; childrenIds: string[]; coverImageId?: string }
}>()

const emit = defineEmits<{
  (e: 'edit', id: string): void
}>()

const store = useBookmarksStore()
const imageUrl = ref<string | null>(null)
const isDragOver = ref(false)

// We create a proxy array for the draggable to use as v-model
const dropZoneList = computed({
  get: () => [] as Item[],
  set: (val: Item[]) => {
    isDragOver.value = false
    // When an item is dropped here, the val array will contain it.
    if (val.length > 0) {
      const droppedItem = val[0]
      if (droppedItem) {
        store.moveItemToGroup(droppedItem.id, props.group.id)
      }
    }
  }
})

const loadCoverImage = async () => {
  if (props.group.coverImageId) {
    const file = await getMedia(props.group.coverImageId)
    if (file && file instanceof Blob) {
      if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
      imageUrl.value = URL.createObjectURL(file)
    }
  } else {
    imageUrl.value = null
  }
}

onMounted(loadCoverImage)
watch(() => props.group.coverImageId, loadCoverImage)

onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
})
</script>

<template>
  <div 
    class="group relative flex flex-col justify-end p-4 h-48 rounded-3xl shadow-md backdrop-blur-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border bg-contain bg-center bg-no-repeat glass:backdrop-blur-xl glass:shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] glass:dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]" 
    :class="[
      !imageUrl ? 'bg-white/80 dark:bg-gray-800/80 glass:bg-white/70 glass:dark:bg-black/40' : '',
      isDragOver ? 'border-violet-500 scale-105 ring-4 ring-violet-500/50' : 'border-white/40 dark:border-gray-700/40 glass:border-white/40 glass:dark:border-white/10'
    ]" 
    :style="imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundColor: '#0f172a' } : {}"
  >
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
    <!-- Placeholder Cover Image if no image -->
    <div v-if="!imageUrl" class="absolute inset-0 bg-violet-500/20 z-0 group-hover:scale-105 transition-transform duration-500"></div>

    <!-- Nested Draggable acts as a Dropzone for SortableJS -->
    <draggable
      v-model="dropZoneList"
      :group="{ name: 'board', put: true }"
      item-key="id"
      class="absolute inset-0 z-30 transition-colors"
      ghost-class="opacity-0"
      @dragenter="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop="isDragOver = false"
      @change="isDragOver = false"
    >
      <template #item>
        <div class="hidden"></div>
      </template>
    </draggable>

    <div class="absolute top-4 right-4 flex gap-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
      <button @click.stop="$emit('edit', group.id)" class="p-1.5 rounded-full text-white/50 hover:text-violet-400 bg-black/30">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
      </button>
      <button @click.stop="store.deleteItem(group.id)" class="p-1.5 rounded-full text-white/50 hover:text-red-400 bg-black/30">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>
    </div>

    <div class="relative z-20 mt-auto pointer-events-none">
      <h3 class="text-lg font-bold text-white">{{ group.title }}</h3>
      <p class="text-sm text-gray-200">{{ $t('board.bookmarksCount', { count: group.childrenIds.length }) }}</p>
    </div>
  </div>
</template>