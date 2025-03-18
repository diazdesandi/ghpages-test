import { reactive, computed } from 'vue';
import type { Target } from '@/interfaces';

interface Tab {
  id: string;
  name: string;
  target: Target | 'results';
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
}

const state = reactive<TabsState>({
  tabs: [],
  activeTabId: null,
});

export function useTabs() {
  const tabs = computed(() => state.tabs);
  const activeTabId = computed(() => state.activeTabId);
  const activeTab = computed(() => state.tabs.find((tab) => tab.id === state.activeTabId));

    // Function to check if a target is already used in a tab
    const isTargetUsed = (target: Target): boolean => {
        return state.tabs.some(tab => tab.target === target);
    };

  const addTab = (name: string, target: Target) => {
    // Limit to two tabs
    if (state.tabs.length >= 2) {
      // Replace the tab with the same target
        const existingTabIndex = state.tabs.findIndex(tab => tab.target === target);
        if (existingTabIndex !== -1) {
            const id = state.tabs[existingTabIndex].id;
            state.tabs[existingTabIndex] = { id, name, target };
            state.activeTabId = id;
        }
      return;
    }

    // Check if the target is already used
        if (isTargetUsed(target)) {
            return; // Prevent adding a new tab if the target is already in use
        }

    const id = `${target}-${Date.now()}`; // Unique ID for the tab
    state.tabs.push({ id, name, target });
    state.activeTabId = id;
  };

  // Add a new function to add the results tab
    const addResultsTab = () => {
      const resultsTabId = 'results';
      // Check if results tab already exists
      if (!state.tabs.some(tab => tab.id === resultsTabId)) {
          state.tabs.push({ id: resultsTabId, name: 'Results', target: 'results' });
      }
      state.activeTabId = resultsTabId;
    };

  const removeTab = (id: string) => {
    state.tabs = state.tabs.filter((tab) => tab.id !== id);
    if (state.activeTabId === id) {
      state.activeTabId = state.tabs.length > 0 ? state.tabs[0].id : null;
    }
  };

  const setActiveTab = (id: string) => {
    state.activeTabId = id;
  };

  return {
    tabs,
    activeTabId,
    activeTab,
    addTab,
    removeTab,
    setActiveTab,
    // export addResultsTab
    addResultsTab
  };
} 