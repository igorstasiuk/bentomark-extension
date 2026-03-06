<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useBookmarksStore, type Item, type Bookmark, type Group } from '../stores/bookmarks'
import { saveMedia } from '../lib/storage'

const props = defineProps<{
  isOpen: boolean
  editItem?: Item | null
  initialUrl?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useBookmarksStore()

const type = ref<'bookmark' | 'group'>('bookmark')
const title = ref('')
const url = ref('')
const imageFile = ref<File | null>(null)
const selectedGroupId = ref<string>('')

const availableGroups = computed(() => {
  return Object.values(store.state.items)
    .filter((item): item is Group => item.type === 'group' && (!props.editItem || item.id !== props.editItem.id))
})

// Find if the item is currently in a group to set the initial selectedGroupId for editing
const findParentGroupId = (itemId: string) => {
  for (const group of Object.values(store.state.items)) {
    if (group.type === 'group' && group.childrenIds.includes(itemId)) {
      return group.id;
    }
  }
  return '';
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.editItem) {
      type.value = props.editItem.type
      title.value = props.editItem.title
      selectedGroupId.value = findParentGroupId(props.editItem.id)
      if (props.editItem.type === 'bookmark') {
        url.value = (props.editItem as Bookmark).url
      } else {
        url.value = ''
      }
    } else {
      type.value = 'bookmark'
      title.value = ''
      url.value = props.initialUrl || ''
      selectedGroupId.value = store.currentGroupId || '' // Default to current open group if any
    }
    imageFile.value = null
  }
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      imageFile.value = file
    }
  }
}

const handleSubmit = async () => {
  let coverImageId: string | undefined = undefined
  
  if (imageFile.value) {
    coverImageId = `cover_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    await saveMedia(coverImageId, imageFile.value)
  }

  if (props.editItem) {
    if (type.value === 'bookmark') {
      store.updateBookmark(props.editItem.id, title.value, url.value, coverImageId)
    } else {
      store.updateGroup(props.editItem.id, title.value, coverImageId)
    }
    // Handle moving item if group changed
    const currentParentId = findParentGroupId(props.editItem.id);
    if (currentParentId !== selectedGroupId.value) {
      if (selectedGroupId.value) {
        store.moveItemToGroup(props.editItem.id, selectedGroupId.value);
      } else {
        store.moveItemToRoot(props.editItem.id);
      }
    }
  } else {
    if (type.value === 'bookmark') {
      if (title.value && url.value) {
        store.addBookmark(title.value, url.value, selectedGroupId.value || undefined, coverImageId)
      }
    } else {
      if (title.value) {
        store.addGroup(title.value, selectedGroupId.value || undefined, coverImageId)
      }
    }
  }
  close()
}

const close = () => {
  title.value = ''
  url.value = ''
  imageFile.value = null
  selectedGroupId.value = ''
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="close">
    <div class="bg-white dark:bg-gray-800 glass:bg-white/40 glass:dark:bg-black/40 glass:backdrop-blur-2xl glass:border-white/50 glass:dark:border-white/10 glass:shadow-2xl p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 transition-all max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">{{ editItem ? 'Edit' : 'Add New' }}</h2>
      
      <div v-if="!editItem" class="flex gap-4 mb-6">
        <button 
          class="flex-1 py-2 rounded-lg font-medium transition-colors"
          :class="type === 'bookmark' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
          @click="type = 'bookmark'"
        >Bookmark</button>
        <button 
          class="flex-1 py-2 rounded-lg font-medium transition-colors"
          :class="type === 'group' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
          @click="type = 'group'"
        >Group</button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input 
            v-model="title" 
            type="text" 
            required 
            class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="E.g., Dribbble"
          />
        </div>
        
        <div v-if="type === 'bookmark'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
          <input 
            v-model="url" 
            type="url" 
            required 
            class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="https://..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Folder</label>
          <select 
            v-model="selectedGroupId"
            class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">(None - Main Screen)</option>
            <option v-for="group in availableGroups" :key="group.id" :value="group.id">
              {{ group.title }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image (Optional)</label>
          <input type="file" accept="image/*" @change="handleFileUpload" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 w-full" />
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button type="button" @click="close" class="px-5 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button type="submit" class="px-5 py-2 rounded-xl font-medium bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transition-all">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>