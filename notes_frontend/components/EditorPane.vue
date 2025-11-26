<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Note } from '../composables/useNotes';

// Simple markdown: extremely basic for bold, italics, inline code, and headings
function basicMarkdownToHtml(md: string): string {
  let html = md
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n$/gim, '<br />');
  // Paragraphs - naive split
  html = html
    .split('\n\n')
    .map((p) => {
      if (/^<h[1-6]>/.test(p)) return p;
      return `<p>${p}</p>`;
    })
    .join('\n');
  return html;
}

const props = defineProps<{
  note: Note | null;
}>();

const emit = defineEmits<{
  (e: 'update', payload: { id: string; title?: string; content?: string }): void;
  (e: 'create'): void;
  (e: 'delete', id: string): void;
}>();

const localTitle = ref('');
const localContent = ref('');
const showPreview = ref(false);

watch(
  () => props.note?.id,
  () => {
    localTitle.value = props.note?.title ?? '';
    localContent.value = props.note?.content ?? '';
  },
  { immediate: true }
);

const previewHtml = computed(() => {
  return basicMarkdownToHtml(localContent.value || '');
});

function onSave() {
  if (!props.note) return;
  emit('update', {
    id: props.note.id,
    title: localTitle.value,
    content: localContent.value,
  });
}

function onDelete() {
  if (!props.note) return;
  const ok = confirm('Delete this note? This cannot be undone.');
  if (!ok) return;
  emit('delete', props.note.id);
}

function onTitleKeydown(e: KeyboardEvent) {
  e.stopPropagation();
}
function onContentKeydown(e: KeyboardEvent) {
  e.stopPropagation();
}

</script>

<template>
  <section class="editor" aria-label="Note editor">
    <div class="header">
      <div class="left">
        <h2 class="app-title">Ocean Notes</h2>
      </div>
      <div class="right">
        <button class="btn btn-secondary" aria-label="New note" title="New (N)" @click="$emit('create')">New</button>
        <button class="btn btn-primary" aria-label="Save note" title="Save (Ctrl/Cmd+S)" @click="onSave">Save</button>
        <button class="btn danger" aria-label="Delete note" title="Delete" @click="onDelete" :disabled="!note">Delete</button>
      </div>
    </div>

    <div class="fields">
      <input
        class="title"
        placeholder="Note title"
        :value="localTitle"
        aria-label="Note title"
        @input="localTitle = ($event.target as HTMLInputElement).value"
        @keydown.stop="onTitleKeydown"
      />
      <div class="toolbar">
        <div class="hint">Supports basic markdown: # ## ###, **bold**, *italic*, `code`</div>
        <label class="switch">
          <input type="checkbox" :checked="showPreview" @change="showPreview = ($event.target as HTMLInputElement).checked" aria-label="Toggle preview" />
          <span>Preview</span>
        </label>
      </div>

      <transition name="fade">
        <textarea
          v-if="!showPreview"
          key="editor"
          class="content"
          placeholder="Write your note here..."
          :value="localContent"
          aria-label="Note content"
          @input="localContent = ($event.target as HTMLTextAreaElement).value"
          @keydown.stop="onContentKeydown"
        ></textarea>
        <div
          v-else
          key="preview"
          class="preview card"
          v-html="previewHtml"
          aria-label="Note preview"
        ></div>
      </transition>
    </div>

    <div v-if="note" class="updated-at muted small">
      Last updated: {{ new Date(note.updatedAt).toLocaleString() }}
    </div>
    <div v-else class="empty-state card">
      <div class="eyebrow">No note selected</div>
      <p class="muted">Create a new note or select one from the list.</p>
    </div>
  </section>
</template>

<style scoped>
.editor {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  padding: 16px;
  gap: 12px;
}

.header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
}
.app-title {
  font-weight: 800;
  letter-spacing: -0.02em;
}

.right { display: flex; gap: 8px; align-items: center; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--line-subtle);
  background: var(--theme-btn-ghost-hover-bg);
  color: var(--theme-btn-ghost-fg);
}
.btn:hover { background: color-mix(in oklab, var(--theme-btn-ghost-hover-bg) 80%, #000); }
.btn:focus-visible { outline: 2px solid var(--theme-focus-ring); outline-offset: 2px; }
.btn[disabled] { opacity: 0.6; cursor: not-allowed; }

.btn-primary {
  background: var(--theme-btn-primary-bg);
  color: var(--theme-btn-primary-fg);
  border: 0;
  box-shadow: 0 6px 16px rgba(107,127,235,0.26);
}
.btn-primary:hover { background: var(--theme-btn-primary-hover); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.btn.danger {
  background: color-mix(in oklab, #ff6b6b 30%, var(--theme-bg-elevated));
  color: var(--theme-text-primary);
  border: 1px solid color-mix(in oklab, #ff6b6b 40%, var(--line));
}

.fields {
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 10px;
}

.title {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line, #2f3039);
  padding: 12px 14px;
  background: var(--theme-bg-elevated);
  color: var(--theme-text-primary);
  font-weight: 700;
  font-size: 18px;
}
.title:focus-visible { outline: 2px solid var(--theme-focus-ring); outline-offset: 2px; }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--theme-text-secondary);
}
.switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.switch input { accent-color: var(--theme-primary-500); }

.content {
  width: 100%;
  height: 100%;
  resize: none;
  border-radius: 12px;
  border: 1px solid var(--line, #2f3039);
  padding: 12px 14px;
  background: var(--theme-bg-elevated);
  color: var(--theme-text-primary);
  line-height: 1.5;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
}
.content:focus-visible { outline: 2px solid var(--theme-focus-ring); outline-offset: 2px; }

.preview {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.updated-at {
  padding: 6px 8px;
  color: var(--theme-text-secondary);
}

.empty-state {
  display: grid;
  gap: 8px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 150ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
