import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  type: 'bookmark';
  coverImageId?: string;
}

export interface Group {
  id: string;
  title: string;
  type: 'group';
  coverImageId?: string; // Reference to IndexedDB
  childrenIds: string[]; // IDs of bookmarks inside this group
}

export type Item = Bookmark | Group;

export interface BookmarksState {
  items: Record<string, Item>;
  layoutOrder: string[]; // Root level layout order
}

export const useBookmarksStore = defineStore('bookmarks', () => {
  const state = ref<BookmarksState>({
    items: {},
    layoutOrder: [],
  });

  const isLoaded = ref(false);
  const searchQuery = ref('');
  const filterType = ref<'all' | 'bookmark' | 'group'>('all');
  const currentGroupId = ref<string | null>(null);
  const groupHistory = ref<string[]>([]); // Track navigation path for nested groups
  const hoveredGroupId = ref<string | null>(null);
  const draggedItemId = ref<string | null>(null);

  const setHoveredGroupId = (id: string | null) => {
    hoveredGroupId.value = id;
  };

  const setDraggedItemId = (id: string | null) => {
    draggedItemId.value = id;
  };

  const openGroup = (id: string) => {
    if (currentGroupId.value) {
      groupHistory.value.push(currentGroupId.value);
    }
    currentGroupId.value = id;
  };

  const closeCurrentGroup = () => {
    if (groupHistory.value.length > 0) {
      currentGroupId.value = groupHistory.value.pop() || null;
    } else {
      currentGroupId.value = null;
    }
  };

  const moveItemToGroup = (itemId: string, targetGroupId: string) => {
    const item = state.value.items[itemId];
    const targetGroup = state.value.items[targetGroupId];
    
    if (!item || !targetGroup || targetGroup.type !== 'group') return;
    
    // Prevent dropping a group into itself or its descendants (simple check for itself for now)
    if (itemId === targetGroupId) return;

    // Remove from root layout
    state.value.layoutOrder = state.value.layoutOrder.filter(id => id !== itemId);
    
    // Remove from any other group
    Object.values(state.value.items).forEach(group => {
      if (group.type === 'group') {
        group.childrenIds = group.childrenIds.filter(id => id !== itemId);
      }
    });

    // Add to target group
    if (!targetGroup.childrenIds.includes(itemId)) {
      targetGroup.childrenIds.push(itemId);
    }
  };

  const moveItemUp = (itemId: string) => {
    const item = state.value.items[itemId];
    if (!item) return;

    // Remove from any group
    Object.values(state.value.items).forEach(group => {
      if (group.type === 'group') {
        group.childrenIds = group.childrenIds.filter(id => id !== itemId);
      }
    });

    // Add to parent group (from history) or root
    if (groupHistory.value.length > 0) {
      const parentId = groupHistory.value[groupHistory.value.length - 1];
      if (parentId) {
        const parentGroup = state.value.items[parentId];
        if (parentGroup && parentGroup.type === 'group') {
          if (!parentGroup.childrenIds.includes(itemId)) {
            parentGroup.childrenIds.push(itemId);
          }
        } else {
           if (!state.value.layoutOrder.includes(itemId)) {
            state.value.layoutOrder.push(itemId);
          }
        }
      } else {
        if (!state.value.layoutOrder.includes(itemId)) {
          state.value.layoutOrder.push(itemId);
        }
      }
    } else {
      // Add to root layout
      if (!state.value.layoutOrder.includes(itemId)) {
        state.value.layoutOrder.push(itemId);
      }
    }
  };

  const moveItemToRoot = (itemId: string) => {
    const item = state.value.items[itemId];
    if (!item) return;

    // Remove from any group
    Object.values(state.value.items).forEach(group => {
      if (group.type === 'group') {
        group.childrenIds = group.childrenIds.filter(id => id !== itemId);
      }
    });

    // Add to root layout
    if (!state.value.layoutOrder.includes(itemId)) {
      state.value.layoutOrder.push(itemId);
    }
  };

  // Load from chrome.storage.sync
  const loadState = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      const data = await chrome.storage.sync.get('bentomark_data');
      if (data.bentomark_data) {
        state.value = data.bentomark_data as BookmarksState;
      }
    }
    isLoaded.value = true;
  };

  // Watch for changes and save to chrome.storage.sync
  watch(state, async (newState) => {
    if (isLoaded.value && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      try {
        await chrome.storage.sync.set({ bentomark_data: JSON.parse(JSON.stringify(newState)) });
      } catch (e) {
        console.error("Failed to sync to chrome.storage.sync, falling back to local:", e);
        // Fallback to local if sync quota is exceeded
        if (chrome.storage.local) {
           await chrome.storage.local.set({ bentomark_data: JSON.parse(JSON.stringify(newState)) });
        }
      }
    }
  }, { deep: true });

  const init = async () => {
    await loadState();
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addBookmark = (title: string, url: string, parentId?: string, coverImageId?: string) => {
    const id = generateId();
    const newBookmark: Bookmark = { id, title, url, type: 'bookmark', coverImageId };
    state.value.items[id] = newBookmark;
    
    if (parentId && state.value.items[parentId] && state.value.items[parentId].type === 'group') {
      (state.value.items[parentId] as Group).childrenIds.push(id);
    } else {
      state.value.layoutOrder.push(id);
    }
    return id;
  };

  const addGroup = (title: string, parentId?: string, coverImageId?: string) => {
    const id = generateId();
    const newGroup: Group = { id, title, type: 'group', childrenIds: [], coverImageId };
    state.value.items[id] = newGroup;
    
    if (parentId && state.value.items[parentId] && state.value.items[parentId].type === 'group') {
      (state.value.items[parentId] as Group).childrenIds.push(id);
    } else {
      state.value.layoutOrder.push(id);
    }
    return id;
  };

  const updateBookmark = (id: string, title: string, url: string, coverImageId?: string) => {
    const item = state.value.items[id];
    if (item && item.type === 'bookmark') {
      item.title = title;
      item.url = url;
      if (coverImageId !== undefined) {
        item.coverImageId = coverImageId;
      }
    }
  };

  const updateGroup = (id: string, title: string, coverImageId?: string) => {
    const item = state.value.items[id];
    if (item && item.type === 'group') {
      item.title = title;
      if (coverImageId !== undefined) {
        item.coverImageId = coverImageId;
      }
    }
  };

  const deleteItem = (id: string) => {
    const item = state.value.items[id];
    if (!item) return;

    if (item.type === 'group') {
      item.childrenIds.forEach(childId => {
        delete state.value.items[childId];
      });
    }

    // Remove from layoutOrder
    state.value.layoutOrder = state.value.layoutOrder.filter(itemId => itemId !== id);

    // Remove from any parent group's childrenIds
    Object.values(state.value.items).forEach(potentialParent => {
      if (potentialParent.type === 'group') {
        potentialParent.childrenIds = potentialParent.childrenIds.filter(childId => childId !== id);
      }
    });

    delete state.value.items[id];
  };

  const searchResults = computed(() => {
    if (!searchQuery.value) return [];
    
    const query = searchQuery.value.toLowerCase();
    const results: Item[] = [];

    Object.values(state.value.items).forEach(item => {
      if (!item) return;
      
      const titleMatch = item.title?.toLowerCase().includes(query) || false;
      
      if (item.type === 'bookmark') {
        const urlMatch = item.url?.toLowerCase().includes(query) || false;
        if (titleMatch || urlMatch) {
          results.push(item);
        }
      } else if (item.type === 'group') {
        if (titleMatch) {
          results.push(item);
        }
      }
    });

    return results;
  });

  return { state, isLoaded, init, addBookmark, addGroup, updateBookmark, updateGroup, deleteItem, searchQuery, filterType, searchResults, currentGroupId, hoveredGroupId, setHoveredGroupId, draggedItemId, setDraggedItemId, moveItemToGroup, moveItemToRoot, moveItemUp, groupHistory, openGroup, closeCurrentGroup };
});