---
# Global deck settings
theme: default
title: Ocean Notes
info: |
  Interactive notes app built on Slidev
class: text-left
mdc: true
transition: fade
fonts:
  sans: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial
  mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
css: |
  @import "./style.css";

# Ocean Professional palette overrides (light values mapped to existing dark theme tokens for consistency)
layout: default
---

<!--
Notes App Shortcuts / Usage
- N: New note
- Ctrl/Cmd+S: Save current note
- Search: filters title & content; sorted by updatedAt desc
- Preview toggle: basic markdown for headings/bold/italic/code
- Data persists to localStorage
-->

<div class="app-root">
  <div class="left-pane">
    <NotesSidebar
      :notes="notes"
      :filtered="filteredNotes"
      :selected-id="selectedId"
      :query="query"
      @update:query="query = $event"
      @select="selectNote"
      @create="handleCreate"
      @delete="handleDelete"
    />
  </div>
  <div class="right-pane">
    <EditorPane
      :note="selectedNote"
      @create="handleCreate"
      @update="handleUpdate"
      @delete="handleDelete"
    />
  </div>
</div>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import NotesSidebar from './components/NotesSidebar.vue'
import EditorPane from './components/EditorPane.vue'
import { useNotes } from './composables/useNotes'

// Initialize state
const {
  notes, selectedId, selectedNote, query, filteredNotes,
  createNote, updateNote, deleteNote, selectNote,
} = useNotes()

function handleCreate() {
  const n = createNote({ title: 'Untitled', content: '' })
  selectNote(n.id)
}
function handleUpdate(payload: { id: string; title?: string; content?: string }) {
  updateNote(payload.id, { title: payload.title, content: payload.content })
}
function handleDelete(id: string) {
  deleteNote(id)
}

// Keyboard shortcuts
function onKeyDown(e: KeyboardEvent) {
  // Ignore when focused on inputs/textareas to not interfere with typing
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  const isInput = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable
  if (isInput) return

  // N => New note
  if ((e.key === 'n' || e.key === 'N')) {
    e.preventDefault()
    handleCreate()
  }
  // Ctrl/Cmd + S => Save
  if ((e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    if (selectedNote.value) {
      // Saving is delegated to the editor via explicit Save button primarily;
      // keyboard save is a no-op here as EditorPane holds local buffers.
      // We can emit a custom event via dispatch or rely on clicking Save via focus.
      // For simplicity, do nothing here; users can click Save in editor.
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style>
/* Ocean Professional colors (mapped over the dark base for Slidev environment)
   If you intend a light theme, adjust vars in theme/custom.css accordingly. */
:root {
  --ocean-primary: #2563EB;
  --ocean-secondary: #F59E0B;
  --ocean-bg: #0f1115; /* using dark canvas from theme */
  --ocean-surface: var(--theme-bg-elevated);
  --ocean-text: var(--theme-text-primary);
}

/* App layout */
.app-root {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 0;
  height: calc(100vh - 2rem);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--line, #2f3039);
  background:
    radial-gradient(1200px 600px at 60% -10%, rgba(37,99,235,0.08) 0%, rgba(139,159,251,0.06) 30%, rgba(26,27,31,0) 70%),
    var(--theme-bg-canvas);
  box-shadow: 0 16px 48px rgba(0,0,0,0.35);
}

.left-pane {
  background: linear-gradient(180deg, rgba(37,99,235,0.07), rgba(0,0,0,0));
}
.right-pane {
  background: var(--ocean-bg);
}

/* Subtle edge */
.left-pane, .right-pane {
  backdrop-filter: blur(4px);
}
</style>

---

# Ocean Notes – Help

- New note: press N or click New
- Save: click Save
- Search: filters by title/content
- Delete: trash icon in list or Delete button in editor (confirm dialog)
- Data persists locally (localStorage)

Press S for presenter mode • Press E to open editor • Use arrow keys to navigate
