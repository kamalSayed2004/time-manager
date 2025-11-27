import { NoteService } from "../services/NoteService.js";
import { StorageService } from "../services/StorageService.js";
import { Utils } from "../utils/Utils.js";
import { toast } from "./Toast.js";

export class UI {
  constructor() {
    this.notesContainer = document.getElementById("notes-container");
    this.searchInput = document.getElementById("search-input");
    this.filterButtons = document.querySelectorAll(".nav-item");
    this.themeToggle = document.getElementById("theme");
    this.currentFilter = "all";
    this.currentSearch = "";

    this.initEventListeners();
    this.renderNotes();
  }

  initEventListeners() {
    // Search
    this.searchInput.addEventListener("input", (e) => {
      this.currentSearch = e.target.value.toLowerCase();
      this.renderNotes();
    });

    // Filters
    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentFilter = btn.dataset.filter;
        this.renderNotes();
      });
    });

    // Add Note
    document
      .getElementById("add-note")
      .addEventListener("click", () => this.createNoteOverlay());

    // Theme
    this.themeToggle.addEventListener("change", (e) => {
      const theme = e.target.checked ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      StorageService.set("theme", theme);
    });

    // Reset
    document.getElementById("reset").addEventListener("click", () => {
      if (confirm("Delete all notes? This cannot be undone.")) {
        StorageService.remove("notes");
        this.renderNotes();
        toast.show("All notes cleared", "success");
      }
    });

    // Export/Import
    document.getElementById("export-data").addEventListener("click", () => {
      StorageService.exportData(NoteService.getNotes());
      toast.show("Data exported successfully");
    });

    document
      .getElementById("import-data")
      .addEventListener("click", () =>
        document.getElementById("import-file").click()
      );

    document.getElementById("import-file").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const notes = JSON.parse(event.target.result);
          if (Array.isArray(notes)) {
            NoteService.saveNotes(notes);
            this.renderNotes();
            toast.show("Data imported successfully");
          } else {
            throw new Error("Invalid format");
          }
        } catch (err) {
          toast.show("Error importing data", "error");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

    // Load Theme
    const savedTheme = StorageService.get("theme");
    if (savedTheme === "dark") {
      this.themeToggle.checked = true;
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }

  renderNotes() {
    const notes = NoteService.filterNotes(
      this.currentFilter,
      this.currentSearch
    );
    this.notesContainer.innerHTML = "";

    if (notes.length === 0) {
      this.notesContainer.innerHTML = `
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

    notes.forEach((note) => this.displayNote(note));
  }

  displayNote(note) {
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
                <span>${Utils.formatDate(note.date)}</span>
            </div>
            <div class="note-actions">
                <button class="overlay-button overlay-button-secondary edit-btn">Edit</button>
                <button class="overlay-button overlay-button-secondary delete-btn" style="color: var(--danger-color); border-color: var(--danger-color);">Delete</button>
            </div>
        `;

    // Bind events directly to avoid global scope issues
    noteCard.querySelector(".edit-btn").onclick = () =>
      this.createNoteOverlay(note);
    noteCard.querySelector(".delete-btn").onclick = () => {
      if (confirm("Are you sure you want to delete this note?")) {
        NoteService.deleteNote(note.id);
        this.renderNotes();
        toast.show("Note deleted successfully", "success");
      }
    };

    this.notesContainer.appendChild(noteCard);
  }

  createNoteOverlay(existingNote = null) {
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

    if (existingNote?.category) {
      document.getElementById("note-category").value = existingNote.category;
    }

    document.getElementById("cancel-note").onclick = () =>
      document.body.removeChild(overlay);

    document.getElementById("save-note").onclick = () => {
      const title = document.getElementById("note-title").value.trim();
      const content = document.getElementById("note-content").value.trim();
      const category = document.getElementById("note-category").value;
      const date = document.getElementById("note-date").value;

      if (!title && !content) {
        toast.show("Please enter a title or content", "error");
        return;
      }

      if (existingNote) {
        const updated = NoteService.updateNote({
          ...existingNote,
          title,
          content,
          category,
          date,
        });
        if (updated) toast.show("Note updated successfully");
      } else {
        NoteService.addNote({ title, content, category, date });
        toast.show("Note created successfully");
      }

      this.renderNotes();
      document.body.removeChild(overlay);
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    };
  }
}
