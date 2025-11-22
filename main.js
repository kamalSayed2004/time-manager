let addNote = document.getElementById('add-note');
let timerHours = document.getElementById('timer-hours');
let timerMinutes = document.getElementById('timer-minutes');
let timerSeconds = document.getElementById('timer-seconds');
let timerStartButton = document.getElementById('timer-start');
let timerStopButton = document.getElementById('timer-stop');
let timerResetButton = document.getElementById('timer-reset');
let countdownHours = document.getElementById('countdown-hours');
let countdownMinutes = document.getElementById('countdown-minutes');
let countdownSeconds = document.getElementById('countdown-seconds');
let countdownStartButton = document.getElementById('countdown-start');
let countdownStopButton = document.getElementById('countdown-stop');
let countdownResetButton = document.getElementById('countdown-reset');

// ===================================================================================
// Function to generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Function to load and display all notes
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const notesContainer = document.getElementById('notes-container');
    
    // Clear existing notes display
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        // Show empty state
        notesContainer.innerHTML = `
            <div class="empty-notes">
                <h3>No Notes Yet</h3>
                <p>Click the + button to create your first note!</p>
            </div>
        `;
        return;
    }
    
    // Display each note
    notes.forEach(note => {
        displayNote(note);
    });
}

// Function to display a single note
function displayNote(note) {
    const notesContainer = document.getElementById('notes-container');
    
    const noteCard = document.createElement('div');
    noteCard.className = 'card';
    noteCard.dataset.noteId = note.id;
    
    noteCard.innerHTML = `
        <h2>${note.title || 'Untitled Note'}</h2>
        <p>${note.content || 'No content'}</p>
        <input type="date" class="date-input" value="${note.date || ''}" readonly />
        <div class="note-actions">
            <button class="edit" onclick="editNote('${note.id}')">Edit</button>
            <button class="delete" onclick="deleteNote('${note.id}')">Delete</button>
        </div>
    `;
    
    notesContainer.appendChild(noteCard);
}

// Function to edit a note
function editNote(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const note = notes.find(n => n.id === noteId);
    
    if (note) {
        createNoteOverlay(note);
    }
}

// Function to delete a note
function deleteNote(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const updatedNotes = notes.filter(n => n.id !== noteId);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    loadNotes();
}

// Make functions globally accessible
window.editNote = editNote;
window.deleteNote = deleteNote;

// Overlay for adding/editing a note
function createNoteOverlay(existingNote = null) {
    // Create overlay elements
    let overlay = document.createElement('div');
    overlay.className = 'overlay-backdrop';

    let modal = document.createElement('div');
    modal.className = 'overlay-modal';

    let titleLabel = document.createElement('label');
    titleLabel.textContent = 'Note Title';
    titleLabel.className = 'overlay-label';

    let titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Enter note title...';
    titleInput.className = 'overlay-input';

    let contentLabel = document.createElement('label');
    contentLabel.textContent = 'Note Content';
    contentLabel.className = 'overlay-label';

    let contentInput = document.createElement('textarea');
    contentInput.placeholder = 'Enter your note content...';
    contentInput.className = 'overlay-input overlay-textarea';

    let dateLabel = document.createElement('label');
    dateLabel.textContent = 'Date';
    dateLabel.className = 'overlay-label';

    let dateInput = document.createElement('input');
    dateInput.type = 'text';
    dateInput.placeholder = 'Click to select date...';
    dateInput.className = 'overlay-input custom-date-input';
    dateInput.readOnly = true;

    let buttonRow = document.createElement('div');
    buttonRow.className = 'overlay-buttons';

    let saveBtn = document.createElement('button');
    saveBtn.textContent = existingNote ? 'Update' : 'Save';
    saveBtn.className = 'overlay-button overlay-button-primary';

    let cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'overlay-button overlay-button-secondary';

    buttonRow.appendChild(cancelBtn);
    buttonRow.appendChild(saveBtn);

    // Pre-fill form if editing existing note
    if (existingNote) {
        titleInput.value = existingNote.title || '';
        contentInput.value = existingNote.content || '';
        dateInput.value = existingNote.date || '';
    }

    // Custom date picker functionality
    dateInput.addEventListener('click', function() {
        createCustomDatePicker(dateInput);
    });

    modal.appendChild(titleLabel);
    modal.appendChild(titleInput);
    modal.appendChild(contentLabel);
    modal.appendChild(contentInput);
    modal.appendChild(dateLabel);
    modal.appendChild(dateInput);
    modal.appendChild(buttonRow);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus on title input
    titleInput.focus();

    // Cancel closes overlay
    cancelBtn.onclick = function() {
        document.body.removeChild(overlay);
    };

    // Save stores note in localStorage and closes overlay
    saveBtn.onclick = function() {
        let title = titleInput.value.trim();
        let content = contentInput.value.trim();
        let date = dateInput.value;

        if (!title && !content) {
            return;
        }

        let notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        if (existingNote) {
            // Update existing note
            const noteIndex = notes.findIndex(n => n.id === existingNote.id);
            if (noteIndex !== -1) {
                notes[noteIndex] = {
                    ...existingNote,
                    title: title,
                    content: content,
                    date: date,
                    updated: new Date().toISOString()
                };
            }
        } else {
            // Add new note
            notes.push({
                id: generateId(),
                title: title,
                content: content,
                date: date,
                created: new Date().toISOString()
            });
        }
        
        localStorage.setItem('notes', JSON.stringify(notes));
        document.body.removeChild(overlay);
        
        // Reload notes to update the display
        loadNotes();
    };

    // Close overlay when clicking outside
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });

    // Close overlay with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }
    });
}

// Custom date picker function
function createCustomDatePicker(dateInput) {
    const currentDate = new Date();
    let selectedYear = currentDate.getFullYear();
    let selectedMonth = currentDate.getMonth();
    let selectedDay = currentDate.getDate();

    // Parse existing date if any
    if (dateInput.value) {
        const parts = dateInput.value.split('-');
        if (parts.length === 3) {
            selectedYear = parseInt(parts[0]);
            selectedMonth = parseInt(parts[1]) - 1;
            selectedDay = parseInt(parts[2]);
        }
    }

    // Create date picker overlay
    const dateOverlay = document.createElement('div');
    dateOverlay.className = 'custom-date-overlay';

    const datePicker = document.createElement('div');
    datePicker.className = 'custom-date-picker';

    // Header with month/year and navigation
    const header = document.createElement('div');
    header.className = 'date-picker-header';

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&#8249;';
    prevBtn.className = 'date-nav-btn';

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&#8250;';
    nextBtn.className = 'date-nav-btn';

    const monthYear = document.createElement('div');
    monthYear.className = 'month-year-display';

    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);

    // Calendar grid
    const calendar = document.createElement('div');
    calendar.className = 'calendar-grid';

    // Day headers
    const dayHeaders = document.createElement('div');
    dayHeaders.className = 'day-headers';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        dayHeaders.appendChild(dayHeader);
    });

    calendar.appendChild(dayHeaders);

    // Days grid
    const daysGrid = document.createElement('div');
    daysGrid.className = 'days-grid';

    function updateCalendar() {
        daysGrid.innerHTML = '';
        monthYear.textContent = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        const firstDay = new Date(selectedYear, selectedMonth, 1);
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';

            const isCurrentMonth = date.getMonth() === selectedMonth;
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.getDate() === selectedDay && 
                             date.getMonth() === selectedMonth && 
                             date.getFullYear() === selectedYear;

            if (!isCurrentMonth) {
                dayElement.classList.add('other-month');
            }
            if (isToday) {
                dayElement.classList.add('today');
            }
            if (isSelected) {
                dayElement.classList.add('selected');
            }

            dayElement.textContent = date.getDate();
            dayElement.addEventListener('click', () => {
                selectedDay = date.getDate();
                selectedMonth = date.getMonth();
                selectedYear = date.getFullYear();
                updateCalendar();
            });

            daysGrid.appendChild(dayElement);
        }
    }

    // Navigation event listeners
    prevBtn.addEventListener('click', () => {
        selectedMonth--;
        if (selectedMonth < 0) {
            selectedMonth = 11;
            selectedYear--;
        }
        updateCalendar();
    });

    nextBtn.addEventListener('click', () => {
        selectedMonth++;
        if (selectedMonth > 11) {
            selectedMonth = 0;
            selectedYear++;
        }
        updateCalendar();
    });

    // Footer with today button
    const footer = document.createElement('div');
    footer.className = 'date-picker-footer';

    const todayBtn = document.createElement('button');
    todayBtn.textContent = 'Today';
    todayBtn.className = 'today-btn';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'close-btn';

    footer.appendChild(todayBtn);
    footer.appendChild(closeBtn);

    // Event listeners
    todayBtn.addEventListener('click', () => {
        const today = new Date();
        selectedDay = today.getDate();
        selectedMonth = today.getMonth();
        selectedYear = today.getFullYear();
        updateCalendar();
    });

    closeBtn.addEventListener('click', () => {
        document.body.removeChild(dateOverlay);
    });

    // Close when clicking outside
    dateOverlay.addEventListener('click', (e) => {
        if (e.target === dateOverlay) {
            document.body.removeChild(dateOverlay);
        }
    });

    // Assemble date picker
    calendar.appendChild(daysGrid);
    datePicker.appendChild(header);
    datePicker.appendChild(calendar);
    datePicker.appendChild(footer);
    dateOverlay.appendChild(datePicker);
    document.body.appendChild(dateOverlay);

    // Initialize calendar
    updateCalendar();

    // Handle date selection
    daysGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('calendar-day')) {
            const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            dateInput.value = formattedDate;
            document.body.removeChild(dateOverlay);
        }
    });
}

// Attach overlay to add-note button if it exists
if (addNote) {
    addNote.addEventListener('click', () => createNoteOverlay());
}

// Load notes when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadNotes();
});
// ===================================================================================
// Timer functionality
let timerInterval = null;
let timerRunning = false;
let timerTime = {
    hours: 0,
    minutes: 0,
    seconds: 0
};

let countdownInterval = null;
let countdownRunning = false;
let countdownTime = {
    hours: 0,
    minutes: 0,
    seconds: 0
};

// Timer functions
function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        timerInterval = setInterval(() => {
            timerTime.seconds++;
            if (timerTime.seconds >= 60) {
                timerTime.seconds = 0;
                timerTime.minutes++;
                if (timerTime.minutes >= 60) {
                    timerTime.minutes = 0;
                    timerTime.hours++;
                }
            }
            updateTimerDisplay();
        }, 1000);
    }
}

function stopTimer() {
    if (timerRunning) {
        timerRunning = false;
        clearInterval(timerInterval);
    }
}

function resetTimer() {
    stopTimer();
    timerTime = { hours: 0, minutes: 0, seconds: 0 };
    updateTimerDisplay();
}

function updateTimerDisplay() {
    if (timerHours) timerHours.textContent = timerTime.hours.toString().padStart(2, '0');
    if (timerMinutes) timerMinutes.textContent = timerTime.minutes.toString().padStart(2, '0');
    if (timerSeconds) timerSeconds.textContent = timerTime.seconds.toString().padStart(2, '0');
}
// Countdown functions
function startCountdown() {
    if (!countdownRunning) {
        // Get values from inputs
        const hours = parseInt(countdownHours.value) || 0;
        const minutes = parseInt(countdownMinutes.value) || 0;
        const seconds = parseInt(countdownSeconds.value) || 0;
        
        if (hours === 0 && minutes === 0 && seconds === 0) {
            return; // Don't start if no time is set
        }
        
        countdownTime = { hours, minutes, seconds };
        countdownRunning = true;
        
        countdownInterval = setInterval(() => {
            if (countdownTime.seconds > 0) {
                countdownTime.seconds--;
            } else if (countdownTime.minutes > 0) {
                countdownTime.minutes--;
                countdownTime.seconds = 59;
            } else if (countdownTime.hours > 0) {
                countdownTime.hours--;
                countdownTime.minutes = 59;
                countdownTime.seconds = 59;
            } else {
                // Countdown finished
                stopCountdown();
                return;
            }
            updateCountdownDisplay();
        }, 1000);
    }
}

function stopCountdown() {
    if (countdownRunning) {
        countdownRunning = false;
        clearInterval(countdownInterval);
    }
}

function resetCountdown() {
    stopCountdown();
    countdownTime = { hours: 0, minutes: 0, seconds: 0 };
    updateCountdownDisplay();
    // Clear input fields
    if (countdownHours) countdownHours.value = '';
    if (countdownMinutes) countdownMinutes.value = '';
    if (countdownSeconds) countdownSeconds.value = '';
}

function updateCountdownDisplay() {
    if (countdownHours) countdownHours.value = countdownTime.hours.toString().padStart(2, '0');
    if (countdownMinutes) countdownMinutes.value = countdownTime.minutes.toString().padStart(2, '0');
    if (countdownSeconds) countdownSeconds.value = countdownTime.seconds.toString().padStart(2, '0');
}

// Input validation for countdown
function validateCountdownInput(input) {
    let value = parseInt(input.value) || 0;
    if (value < 0) value = 0;
    if (value > 59) value = 59;
    input.value = value.toString().padStart(2, '0');
}

// Attach timer event listeners
if (timerStartButton) {
    timerStartButton.addEventListener('click', startTimer);
}

if (timerStopButton) {
    timerStopButton.addEventListener('click', stopTimer);
}

if (timerResetButton) {
    timerResetButton.addEventListener('click', resetTimer);
}

// Attach countdown event listeners
if (countdownStartButton) {
    countdownStartButton.addEventListener('click', startCountdown);
}

if (countdownStopButton) {
    countdownStopButton.addEventListener('click', stopCountdown);
}

if (countdownResetButton) {
    countdownResetButton.addEventListener('click', resetCountdown);
}

// Add input validation for countdown inputs
if (countdownHours) {
    countdownHours.addEventListener('blur', () => validateCountdownInput(countdownHours));
    countdownHours.addEventListener('input', () => {
        let value = countdownHours.value.replace(/\D/g, '');
        if (value.length > 2) value = value.slice(0, 2);
        countdownHours.value = value;
    });
}

if (countdownMinutes) {
    countdownMinutes.addEventListener('blur', () => validateCountdownInput(countdownMinutes));
    countdownMinutes.addEventListener('input', () => {
        let value = countdownMinutes.value.replace(/\D/g, '');
        if (value.length > 2) value = value.slice(0, 2);
        countdownMinutes.value = value;
    });
}

if (countdownSeconds) {
    countdownSeconds.addEventListener('blur', () => validateCountdownInput(countdownSeconds));
    countdownSeconds.addEventListener('input', () => {
        let value = countdownSeconds.value.replace(/\D/g, '');
        if (value.length > 2) value = value.slice(0, 2);
        countdownSeconds.value = value;
    });
}

// Initialize timer display
updateTimerDisplay();
updateCountdownDisplay();
// ===================================================================================
