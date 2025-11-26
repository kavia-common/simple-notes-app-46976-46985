<script setup lang="ts">
import { computed } from 'vue';
import type { Note } from '../composables/useNotes';

const props = defineProps<{
  notes: Note[];
  filtered: Note[];
  selectedId: string | null;
  query: string;
}>();

const emit = defineEmits<{
  (e: 'update:query', v: string): void;
  (e: 'select', id: string): void;
  (e: 'create'): void;
  (e: 'delete', id: string): void;
}>();

const hasSearch = computed(() => props.query.trim().length > 0);

function onKeydownEnter(e: KeyboardEvent) {
  // Prevent slide navigation in Slidev when interacting
  e.stopPropagation();
}
</script>

<template>
  <aside
    class="sidebar"
    aria-label="Notes list sidebar"
  >
    <div class="sidebar-header">
      <div class="title">Notes</div>
      <button
        class="btn btn-primary"
        aria-label="Create New Note"
        title="New Note (N)"
        @click="$emit('create')"
      >
        + New
      </button>
    </div>

    <div class="search-wrap">
      <input
        class="search"
        type="text"
        :value="query"
        placeholder="Search notes..."
        aria-label="Search notes"
        @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
        @keydown.stop
        @keydown.enter="onKeydownEnter"
      />
    </div>

    <div class="notes-list" role="list">
      <template v-if="filtered.length">
        <button
          v-for="n in filtered"
          :key="n.id"
          role="listitem"
          class="note-row"
          :class="{ active: n.id === selectedId }"
          @click="$emit('select', n.id)"
          :aria-pressed="n.id === selectedId"
        >
          <div class="meta">
            <div class="title" :title="n.title || 'Untitled'">{{ n.title || 'Untitled' }}</div>
            <div class="date">{{ new Date(n.updatedAt).toLocaleString() }}</div>
          </div>
          <button
            class="icon-btn"
            aria-label="Delete note"
            title="Delete note"
            @click.stop="$emit('delete', n.id)"
          >
            🗑️
          </button>
        </button>
      </template>
      <div v-else class="empty">
        <div class="eyebrow">No Results</div>
        <p class="muted">
          {{ hasSearch ? 'No notes match your search.' : 'Create your first note to get started.' }}
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: grid;
  grid-template-rows: auto auto 1fr;
  height: 100%;
  background: var(--theme-bg-elev-2, #0b1220);
  border-right: 1px solid var(--line, #2a2b31);
  padding: 14px;
  gap: 12px;
  min-width: 280px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-weight: 800;
  letter-spacing: -0.02em;
}

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--line-subtle);
  background: var(--theme-btn-ghost-hover-bg);
  color: var(--theme-btn-ghost-fg);
}
.btn:hover { background: color-mix(in oklab, var(--theme-btn-ghost-hover-bg) 80%, #000); }
.btn:focus-visible { outline: 2px solid var(--theme-focus-ring); outline-offset: 2px; }

.btn-primary {
  background: var(--theme-btn-primary-bg);
  color: var(--theme-btn-primary-fg);
  border: 0;
  box-shadow: 0 6px 16px rgba(107,127,235,0.26);
}
.btn-primary:hover { background: var(--theme-btn-primary-hover); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.search-wrap { display: grid; }
.search {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--line, #2f3039);
  padding: 10px 12px;
  background: var(--theme-bg-elevated);
  color: var(--theme-text-primary);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
}
.search:focus-visible { outline: 2px solid var(--theme-focus-ring); outline-offset: 2px; }

.notes-list {
  overflow-y: auto;
  display: grid;
  gap: 8px;
  padding-right: 4px;
}

.note-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--theme-bg-elevated);
  border: 1px solid var(--line, #2f3039);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 160ms ease;
}
.note-row:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--theme-primary-500) 30%, var(--line));
  box-shadow: 0 10px 24px rgba(0,0,0,0.25);
}
.note-row.active {
  border-color: var(--theme-primary-500);
  box-shadow: 0 10px 24px rgba(107,127,235,0.25);
}

.meta { display: grid; gap: 4px; }
.meta .title { font-weight: 700; }
.meta .date { font-size: 12px; color: var(--theme-text-secondary); }

.icon-btn {
  background: transparent;
  border: 0;
  color: var(--theme-text-secondary);
  border-radius: 8px;
  padding: 6px 8px;
}
.icon-btn:hover { background: var(--theme-btn-ghost-hover-bg); color: var(--theme-text-primary); }
.icon-btn:focus-visible { outline: 2px solid var(--theme-focus-ring); outline-offset: 2px; }

.empty {
  text-align: center;
  padding: 16px 10px;
  border: 1px dashed var(--line, #2f3039);
  border-radius: 12px;
  color: var(--theme-text-secondary);
}
</style>
