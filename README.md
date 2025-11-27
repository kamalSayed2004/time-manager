# Time Manager

A professional, feature-rich time management application built with modern web technologies.

## Features

- **Task Management**: Create, edit, delete, and organize notes.
- **Categories**: Filter notes by Work, Personal, or Ideas.
- **Search**: Instantly find notes by title or content.
- **Stopwatch & Timer**: Built-in tools for time tracking.
- **Dark Mode**: Beautiful neon-glass dark theme.
- **Data Persistence**: All data is saved locally.
- **Export/Import**: Backup and restore your data via JSON.
- **Modern UI**: Glassmorphism design with responsive layout.

## Architecture

The project follows a modular ES6 architecture:

```
src/
├── css/            # Stylesheets
├── js/
│   ├── components/ # UI Components (Toast, Timer, UI)
│   ├── services/   # Business Logic (Storage, Notes)
│   ├── utils/      # Helper functions
│   └── app.js      # Entry point
```

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/kamalSayed2004/time-manager.git
    ```
2.  Install dependencies (for local server):
    ```bash
    npm install
    ```
3.  Run the application:
    ```bash
    npm start
    ```
    Open `http://localhost:3000` in your browser.

## Technologies

- HTML5
- CSS3 (Variables, Flexbox, Grid)
- JavaScript (ES6 Modules)
- Node.js (for serving locally)

## License

MIT
