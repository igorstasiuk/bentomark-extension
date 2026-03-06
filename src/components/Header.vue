<script setup lang="ts">
import { useBookmarksStore } from '../stores/bookmarks'
const store = useBookmarksStore()

defineEmits<{
  (e: 'add'): void
  (e: 'settings'): void
}>()

const toggleFilter = (type: 'group' | 'bookmark') => {
  if (store.filterType === type) {
    store.filterType = 'all'
  } else {
    store.filterType = type
  }
}
</script>

<template>
  <header class="flex items-center justify-between py-4">
    <!-- Left: Toggles -->
    <div class="flex items-center gap-4">
      <button 
        @click="toggleFilter('group')"
        class="p-2 rounded-xl shadow-sm glass:backdrop-blur-md glass:border glass:border-white/30 glass:dark:border-white/10 transition-all"
        :class="store.filterType === 'group' ? 'bg-violet-500 text-white glass:bg-violet-500/80' : 'bg-white/50 dark:bg-black/50 glass:bg-white/70 glass:dark:bg-black/40 hover:bg-white dark:hover:bg-black glass:hover:bg-white/90 glass:dark:hover:bg-black/50'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
      </button>
      <button 
        @click="toggleFilter('bookmark')"
        class="p-2 rounded-xl shadow-sm glass:backdrop-blur-md glass:border glass:border-white/30 glass:dark:border-white/10 transition-all"
        :class="store.filterType === 'bookmark' ? 'bg-violet-500 text-white glass:bg-violet-500/80' : 'bg-white/50 dark:bg-black/50 glass:bg-white/70 glass:dark:bg-black/40 hover:bg-white dark:hover:bg-black glass:hover:bg-white/90 glass:dark:hover:bg-black/50'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
      </button>
    </div>

    <!-- Center: Search -->
    <div class="flex-1 max-w-xl mx-8">
      <div class="relative flex items-center w-full h-12 rounded-full bg-white/70 dark:bg-gray-800/70 glass:bg-white/70 glass:dark:bg-black/40 glass:backdrop-blur-xl glass:border glass:border-white/30 glass:dark:border-white/10 shadow-sm overflow-hidden backdrop-blur-md transition-all">
        <div class="grid place-items-center h-full w-12 text-gray-400">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input v-model="store.searchQuery" class="h-full w-full outline-none text-sm text-gray-700 dark:text-gray-200 pr-2 bg-transparent" type="text" id="search" placeholder="Search bookmarks and groups..." />
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-4">
      <button @click="$emit('add')" class="p-2 bg-bento-lime text-slate-900 rounded-full shadow-lg hover:bg-bento-lime-hover transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      </button>
      <button @click="$emit('settings')" class="p-2 bg-white/50 dark:bg-black/50 glass:bg-white/70 glass:dark:bg-black/40 glass:backdrop-blur-md glass:border glass:border-white/30 glass:dark:border-white/10 rounded-xl shadow-sm hover:bg-white dark:hover:bg-black glass:hover:bg-white/90 glass:dark:hover:bg-black/50 transition-all">
         <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </div>
  </header>
</template>
