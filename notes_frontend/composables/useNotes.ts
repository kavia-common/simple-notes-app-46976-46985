import { ref, computed, watch } from 'vue';

export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
};

const STORAGE_KEY = 'notes.app.list.v1';

// PUBLIC_INTERFACE
export function useNotes() {
  /** This composable manages notes state with localStorage persistence, search, sort, and CRUD. */

  const notes = ref<Note[]>([]);
  const selectedId = ref<string | null>(null);
  const query = ref('');
  const isLoaded = ref(false);
  const error = ref<string | null>(null);

  // Safe localStorage read
  function loadFromStorage(): Note[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((n) => ({
          id: String(n.id),
          title: typeof n.title === 'string' ? n.title : '',
          content: typeof n.content === 'string' ? n.content : '',
          updatedAt: typeof n.updatedAt === 'number' ? n.updatedAt : Date.now(),
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (_e) {
      console.warn('Failed to parse notes from localStorage, resetting storage.');
      error.value = 'Stored notes were corrupted and have been reset.';
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value));
    } catch (e) {
      console.error('Failed to save notes:', e);
      error.value = 'Failed to save notes. Check storage settings.';
    }
  }

  // Initialize
  if (typeof window !== 'undefined') {
    notes.value = loadFromStorage();
    isLoaded.value = true;
    if (!selectedId.value && notes.value.length) {
      selectedId.value = notes.value[0].id;
    }
  }

  // Persist on change
  watch(notes, saveToStorage, { deep: true });

  const selectedNote = computed<Note | null>(() => {
    return notes.value.find((n) => n.id === selectedId.value) ?? null;
  });

  const filteredNotes = computed<Note[]>(() => {
    const q = query.value.trim().toLowerCase();
    const base = [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return base;
    return base.filter((n) => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    });
  });

  // PUBLIC_INTERFACE
  function createNote(initial?: Partial<Note>): Note {
    /** Create a new note and select it. */
    const now = Date.now();
    const newNote: Note = {
      id: crypto.randomUUID?.() ?? String(now) + '-' + Math.random().toString(36).slice(2),
      title: initial?.title ?? 'Untitled',
      content: initial?.content ?? '',
      updatedAt: now,
    };
    notes.value.unshift(newNote);
    selectedId.value = newNote.id;
    return newNote;
  }

  // PUBLIC_INTERFACE
  function updateNote(id: string, patch: Partial<Pick<Note, 'title' | 'content'>>) {
    /** Update note by id with title/content and timestamp. */
    const idx = notes.value.findIndex((n) => n.id === id);
    if (idx === -1) return;
    const updated: Note = {
      ...notes.value[idx],
      ...patch,
      updatedAt: Date.now(),
    };
    notes.value.splice(idx, 1, updated);
  }

  // PUBLIC_INTERFACE
  function deleteNote(id: string) {
    /** Delete a note by id and adjust selection. */
    const idx = notes.value.findIndex((n) => n.id === id);
    if (idx === -1) return;
    const wasSelected = selectedId.value === id;
    notes.value.splice(idx, 1);
    if (wasSelected) {
      selectedId.value = notes.value[0]?.id ?? null;
    }
  }

  // PUBLIC_INTERFACE
  function selectNote(id: string | null) {
    /** Select a note by id (or null). */
    selectedId.value = id;
  }

  // PUBLIC_INTERFACE
  function clearAllNotes(confirmFn?: (message: string) => boolean) {
    /** Clear all notes with optional confirmation function. */
    const ok = confirmFn ? confirmFn('Delete all notes? This cannot be undone.') : true;
    if (!ok) return;
    notes.value = [];
    selectedId.value = null;
  }

  return {
    // state
    notes,
    selectedId,
    selectedNote,
    query,
    filteredNotes,
    isLoaded,
    error,
    // actions
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    clearAllNotes,
  };
}
