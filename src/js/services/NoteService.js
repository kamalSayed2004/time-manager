import { StorageService } from "./StorageService.js";
import { Utils } from "../utils/Utils.js";

export class NoteService {
  static getNotes() {
    return StorageService.get("notes", []);
  }

  static saveNotes(notes) {
    StorageService.set("notes", notes);
  }

  static addNote(note) {
    const notes = this.getNotes();
    const newNote = {
      id: Utils.generateId(),
      ...note,
      created: new Date().toISOString(),
    };
    notes.push(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  static updateNote(updatedNote) {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === updatedNote.id);
    if (index !== -1) {
      notes[index] = { ...updatedNote, updated: new Date().toISOString() };
      this.saveNotes(notes);
      return true;
    }
    return false;
  }

  static deleteNote(noteId) {
    const notes = this.getNotes();
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    this.saveNotes(updatedNotes);
  }

  static filterNotes(filter, search) {
    const notes = this.getNotes();
    return notes.filter((note) => {
      const matchesFilter =
        filter === "all" || (note.category || "personal") === filter;
      const matchesSearch =
        note.title?.toLowerCase().includes(search) ||
        note.content?.toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    });
  }
}
