<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import BookmarkCard from './BookmarkCard.vue'
import GroupCard from './GroupCard.vue'
import { useBookmarksStore, type Item, type Group } from '../stores/bookmarks'
import { useSettingsStore } from '../stores/settings'

const store = useBookmarksStore()
const settingsStore = useSettingsStore()
const isBackHovered = ref(false)

const emit = defineEmits<{
  (e: 'edit', item: Item): void
}>()

const handleEdit = (id: string) => {
  const item = store.state.items[id]
  if (item) {
    emit('edit', item)
  }
}

const openGroup = (id: string) => {
  store.openGroup(id);
}

const closeGroup = () => {
  store.closeCurrentGroup();
}

const isFiltering = computed(() => !!store.searchQuery || store.filterType !== 'all')

const displayItems = computed({
  get: () => {
    if (store.searchQuery) {
      return store.searchResults.filter(item => store.filterType === 'all' || item.type === store.filterType)
    }
    
    if (store.currentGroupId) {
      const group = store.state.items[store.currentGroupId] as Group
      if (group && group.childrenIds) {
        return group.childrenIds
          .map(id => store.state.items[id])
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      }
      return []
    }

    if (store.filterType !== 'all') {
      return store.state.layoutOrder
        .map(id => store.state.items[id])
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .filter(item => item.type === store.filterType)
    }
    
    return store.state.layoutOrder
      .map(id => store.state.items[id])
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  },
  set: (val) => {
    if (!store.searchQuery && store.filterType === 'all') {
      if (store.currentGroupId) {
        const group = store.state.items[store.currentGroupId] as Group
        if (group) {
          group.childrenIds = val.filter((item): item is NonNullable<typeof item> => Boolean(item)).map(item => item.id)
        }
      } else {
        store.state.layoutOrder = val.filter((item): item is NonNullable<typeof item> => Boolean(item)).map(item => item.id)
      }
    }
  }
})

const rootDropZoneList = computed({
  get: () => [] as Item[],
  set: (val: Item[]) => {
    isBackHovered.value = false;
    if (val.length > 0) {
      const droppedItem = val[0];
      if (droppedItem && store.currentGroupId) {
        store.moveItemUp(droppedItem.id);
      }
    }
  }
})

const onDragStart = (evt: any) => {
  let draggedId = null;
  if (evt.item && evt.item.__draggable_context) {
    draggedId = evt.item.__draggable_context.element.id;
  } else if (evt.oldIndex !== undefined) {
    draggedId = displayItems.value[evt.oldIndex]?.id;
  }
  
  if (draggedId) {
    store.setDraggedItemId(draggedId);
  }
}

const onDragEnd = () => {
  setTimeout(() => {
    store.setDraggedItemId(null);
  }, 100);
}

const onDragChange = (evt: any) => {
  if (evt.added) {
    const item = evt.added.element;
    if (store.currentGroupId) {
      store.moveItemToGroup(item.id, store.currentGroupId);
    } else {
      store.moveItemToRoot(item.id);
    }
  }
}

const checkMove = (evt: any) => {
  // Allow dropping groups into groups, but we already have a check in store to prevent dropping into itself.
  // Actually, Sortable doesn't let us easily know if a group is dropped into its own descendant.
  // We handle basic self-drop prevention in the store.
  if (evt.draggedContext.element.id === store.currentGroupId) {
    return false; // Cannot drop a group into itself
  }
  return true;
}
</script>

<template>
  <main class="flex-1 flex flex-col overflow-y-auto pb-8 hide-scrollbar">
    
    <!-- Group Navigation Breadcrumb -->
    <div v-if="store.currentGroupId" class="mb-6 flex items-center gap-3 animate-fade-in">
      <draggable
        v-model="rootDropZoneList"
        :group="{ name: 'board', put: true }"
        item-key="id"
        class="flex items-center justify-center"
        @dragenter="isBackHovered = true"
        @dragleave="isBackHovered = false"
        @drop="isBackHovered = false"
        @change="isBackHovered = false"
      >
        <template #header>
          <button 
            @click="closeGroup" 
            class="p-3 rounded-xl shadow-sm glass:backdrop-blur-md glass:border transition-all"
            :class="isBackHovered ? 'bg-indigo-500 text-white glass:bg-indigo-500 glass:border-indigo-400 scale-110' : 'bg-white/50 dark:bg-black/50 glass:bg-white/30 glass:dark:bg-black/40 glass:border-white/30 glass:dark:border-white/10 hover:bg-white dark:hover:bg-black glass:hover:bg-white/50 glass:dark:hover:bg-black/50 text-gray-700 dark:text-gray-200'"
            title="Drop bookmark here to move to main screen"
          >
            <svg class="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
        </template>
        <template #item>
          <div class="hidden"></div>
        </template>
      </draggable>
      <h2 class="text-3xl font-bold text-gray-800 dark:text-white" :class="{'opacity-50 transition-opacity': isBackHovered}">{{ (store.state.items[store.currentGroupId] as Group)?.title }}</h2>
    </div>

    <!-- Search and Filter Results View -->
    <div v-if="isFiltering" class="grid gap-6" :style="{ gridTemplateColumns: `repeat(${settingsStore.settings.columns}, minmax(0, 1fr))` }">
      <template v-for="element in displayItems" :key="element.id">
        <GroupCard v-if="element.type === 'group'" :group="element" @edit="handleEdit" @click="openGroup(element.id)" />
        <BookmarkCard v-else :bookmark="element" @edit="handleEdit" />
      </template>
      <div v-if="displayItems.length === 0" class="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
        No results found{{ store.searchQuery ? ` for "${store.searchQuery}"` : '' }}
      </div>
    </div>

    <!-- Draggable Grid View -->
    <draggable 
      v-else
      v-model="displayItems" 
      item-key="id"
      class="grid gap-6 content-start"
      :style="{ gridTemplateColumns: `repeat(${settingsStore.settings.columns}, minmax(0, 1fr))` }"
      :animation="200"
      ghost-class="opacity-50"
      :group="{ name: 'board', pull: true, put: true }"
      @change="onDragChange"
      :move="checkMove"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div @dragstart="(e) => e.dataTransfer?.setData('text/plain', element.id)">
          <GroupCard v-if="element.type === 'group'" :group="element" @edit="handleEdit" @click="openGroup(element.id)" />
          <BookmarkCard v-else :bookmark="element" @edit="handleEdit" />
        </div>
      </template>
    </draggable>
    
    <div v-if="!isFiltering && displayItems.length === 0" class="flex-1 flex items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
      {{ store.currentGroupId ? 'This group is empty. Drag bookmarks here or click + to add.' : 'Your board is empty. Click the + button to add bookmarks or groups.' }}
    </div>
  </main>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
