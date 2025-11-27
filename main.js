// DOM Elements
const addNoteBtn = document.getElementById("add-note");
const notesContainer = document.getElementById("notes-container");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".nav-item");
const themeToggle = document.getElementById("theme");
const resetBtn = document.getElementById("reset");

// State
let currentFilter = "all";
let currentSearch = "";

// ===================================================================================
// Core Functions
// ===================================================================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getNotes() {
  return JSON.parse(localStorage.getItem("notes") || "[]");
}

function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function loadNotes() {
  const notes = getNotes();
  notesContainer.innerHTML = "";

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesFilter =
      currentFilter === "all" ||
      (note.category || "personal") === currentFilter;
    const matchesSearch =
      note.title?.toLowerCase().includes(currentSearch) ||
      note.content?.toLowerCase().includes(currentSearch);
    return matchesFilter && matchesSearch;
  });

  if (filteredNotes.length === 0) {
    notesContainer.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3>No notes found</h3>
                <p>Try adjusting your search or filter, or create a new note.</p>
            </div>
        `;
    return;
  }

  filteredNotes.forEach(displayNote);
}

function displayNote(note) {
  const noteCard = document.createElement("div");
  noteCard.className = "card";
  noteCard.dataset.noteId = note.id;

  const category = note.category || "personal";

  noteCard.innerHTML = `
        <div class="card-content">
            <h2>${note.title || "Untitled Note"}</h2>
            <p>${note.content || "No content"}</p>
        </div>
        <div class="card-meta">
            <div class="card-tags">
                <span class="tag ${category}">${category}</span>
            </div>
            <span>${new Date(
              note.date || Date.now()
            ).toLocaleDateString()}</span>
        </div>
        <div class="note-actions">
            <button class="overlay-button overlay-button-secondary" onclick="editNote('${
              note.id
            }')">Edit</button>
            <button class="overlay-button overlay-button-secondary" style="color: var(--danger-color); border-color: var(--danger-color);" onclick="deleteNote('${
              note.id
            }')">Delete</button>
        </div>
    `;

  notesContainer.appendChild(noteCard);
}

// ===================================================================================
// Actions
// ===================================================================================

function editNote(noteId) {
  const notes = getNotes();
  const note = notes.find((n) => n.id === noteId);
  if (note) {
    createNoteOverlay(note);
  }
}

function deleteNote(noteId) {
  if (confirm("Are you sure you want to delete this note?")) {
    const notes = getNotes();
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    saveNotes(updatedNotes);
    loadNotes();
    window.toast.show("Note deleted successfully", "success");
  }
}

function createNoteOverlay(existingNote = null) {
  const overlay = document.createElement("div");
  overlay.className = "overlay-backdrop";

  const modal = document.createElement("div");
  modal.className = "overlay-modal";

  modal.innerHTML = `
        <h2>${existingNote ? "Edit Note" : "New Note"}</h2>
        
        <div>
            <label class="overlay-label">Title</label>
            <input type="text" id="note-title" class="overlay-input" placeholder="Enter title..." value="${
              existingNote?.title || ""
            }">
        </div>

        <div>
            <label class="overlay-label">Category</label>
            <select id="note-category" class="overlay-input">
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="ideas">Ideas</option>
            </select>
        </div>

        <div>
            <label class="overlay-label">Content</label>
            <textarea id="note-content" class="overlay-input overlay-textarea" placeholder="Write your thoughts...">${
              existingNote?.content || ""
            }</textarea>
        </div>

        <div>
            <label class="overlay-label">Date</label>
            <input type="date" id="note-date" class="overlay-input" value="${
              existingNote?.date || new Date().toISOString().split("T")[0]
            }">
        </div>

        <div class="overlay-buttons">
            <button class="overlay-button overlay-button-secondary" id="cancel-note">Cancel</button>
            <button class="overlay-button overlay-button-primary" id="save-note">Save Note</button>
        </div>
    `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Set category value if editing
  if (existingNote?.category) {
    document.getElementById("note-category").value = existingNote.category;
  }

  // Event Listeners
  document.getElementById("cancel-note").onclick = () =>
    document.body.removeChild(overlay);

  document.getElementById("save-note").onclick = () => {
    const title = document.getElementById("note-title").value.trim();
    const content = document.getElementById("note-content").value.trim();
    const category = document.getElementById("note-category").value;
    const date = document.getElementById("note-date").value;

    if (!title && !content) {
      window.toast.show("Please enter a title or content", "error");
      return;
    }

    const notes = getNotes();

    if (existingNote) {
      const index = notes.findIndex((n) => n.id === existingNote.id);
      if (index !== -1) {
        notes[index] = {
          ...existingNote,
          title,
          content,
          category,
          date,
          updated: new Date().toISOString(),
        };
        window.toast.show("Note updated successfully");
      }
    } else {
      notes.push({
        id: generateId(),
        title,
        content,
        category,
        date,
        created: new Date().toISOString(),
      });
      window.toast.show("Note created successfully");
    }

    saveNotes(notes);
    loadNotes();
    document.body.removeChild(overlay);
  };

  // Close on backdrop click
  overlay.onclick = (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  };
}

// ===================================================================================
// Event Listeners
// ===================================================================================

// Search
searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value.toLowerCase();
  loadNotes();
});

// Filters
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Update UI
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Update State
    currentFilter = btn.dataset.filter;
    loadNotes();
  });
});

// Add Note
addNoteBtn.addEventListener("click", () => createNoteOverlay());

// Theme Toggle
themeToggle.addEventListener("change", (e) => {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  }
});

// Reset
resetBtn.addEventListener("click", () => {
  if (confirm("Delete all notes? This cannot be undone.")) {
    localStorage.removeItem("notes");
    loadNotes();
    window.toast.show("All notes cleared", "success");
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Load Theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    themeToggle.checked = true;
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // Load Notes
  loadNotes();

  // Initialize Timer (Existing functionality preserved)
  initTimer();
});

// Make global for inline onclick handlers
window.editNote = editNote;
window.deleteNote = deleteNote;

// ===================================================================================
// Timer Logic (Preserved & Adapted)
// ===================================================================================
function initTimer() {
  let timerInterval;
  let timerSeconds = 0;
  const timerDisplay = {
    h: document.getElementById("timer-hours"),
    m: document.getElementById("timer-minutes"),
    s: document.getElementById("timer-seconds"),
  };

  document.getElementById("timer-start").onclick = () => {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
  };

  document.getElementById("timer-stop").onclick = () =>
    clearInterval(timerInterval);

  document.getElementById("timer-reset").onclick = () => {
    clearInterval(timerInterval);
    timerSeconds = 0;
    updateTimerDisplay();
  };

  function updateTimerDisplay() {
    const h = Math.floor(timerSeconds / 3600);
    const m = Math.floor((timerSeconds % 3600) / 60);
    const s = timerSeconds % 60;

    if (timerDisplay.h)
      timerDisplay.h.textContent = h.toString().padStart(2, "0");
    if (timerDisplay.m)
      timerDisplay.m.textContent = m.toString().padStart(2, "0");
    if (timerDisplay.s)
      timerDisplay.s.textContent = s.toString().padStart(2, "0");
  }

  // Countdown Logic
  let countdownInterval;
  const countdownInputs = {
    h: document.getElementById("countdown-hours"),
    m: document.getElementById("countdown-minutes"),
    s: document.getElementById("countdown-seconds"),
  };

  document.getElementById("countdown-start").onclick = () => {
    let h = parseInt(countdownInputs.h.value) || 0;
    let m = parseInt(countdownInputs.m.value) || 0;
    let s = parseInt(countdownInputs.s.value) || 0;
    let totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds <= 0) return;

    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(countdownInterval);
        window.toast.show("Timer finished!", "success");
        return;
      }
      totalSeconds--;

      const dh = Math.floor(totalSeconds / 3600);
      const dm = Math.floor((totalSeconds % 3600) / 60);
      const ds = totalSeconds % 60;

      countdownInputs.h.value = dh.toString().padStart(2, "0");
      countdownInputs.m.value = dm.toString().padStart(2, "0");
      countdownInputs.s.value = ds.toString().padStart(2, "0");
    }, 1000);
  };

  document.getElementById("countdown-stop").onclick = () =>
    clearInterval(countdownInterval);

  document.getElementById("countdown-reset").onclick = () => {
    clearInterval(countdownInterval);
    countdownInputs.h.value = "";
    countdownInputs.m.value = "";
    countdownInputs.s.value = "";
  };
}
