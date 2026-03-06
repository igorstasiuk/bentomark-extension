<script setup lang="ts">
import { useSettingsStore } from '../stores/settings'

const store = useSettingsStore()

const dismiss = () => {
  store.settings.onboarded = true
}
</script>

<template>
  <div v-if="store.isLoaded && !store.settings.onboarded" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-white dark:bg-gray-800 glass:bg-white/40 glass:dark:bg-black/40 glass:backdrop-blur-2xl glass:border-white/50 glass:dark:border-white/10 glass:shadow-2xl p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 text-center relative overflow-hidden transition-all">
      <!-- Decorative background elements -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

      <div class="relative z-10">
        <div class="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <img src="/bentomark.svg" alt="BentoMark Logo" class="w-full h-full drop-shadow-xl" />
        </div>
        
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">Welcome to BentoMark</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Organize your bookmarks visually. Drag and drop to reorder, nest links into groups, and customize the background to make it your own.
        </p>

        <div class="grid grid-cols-2 gap-4 text-left mb-8">
          <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div class="font-bold text-gray-800 dark:text-gray-100 mb-1">Drag & Drop</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Sort your layout freely.</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div class="font-bold text-gray-800 dark:text-gray-100 mb-1">Quick Search</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Find links instantly.</div>
          </div>
        </div>

        <button @click="dismiss" class="w-full py-3 rounded-xl font-bold text-lg bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02]">
          Let's Go!
        </button>
      </div>
    </div>
  </div>
</template>
