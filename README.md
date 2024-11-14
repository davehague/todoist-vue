# Todoist Task Viewer

A Vue.js application for viewing and managing Todoist tasks with a clean, responsive interface.

## Features

- View all Todoist tasks in a clean interface
- Search tasks by content, project name, or due date
- Sort tasks by creation date
- Copy tasks to clipboard (All, Top 10/20/50)
- View detailed task information in a modal

## Setup

1. Install dependencies:

```bash
npm install
```

2. Get your Todoist API token:
   - Log into Todoist
   - Go to Settings → Integrations → Developer
   - Copy your API token

## Development

Run the development server:

```bash
npm run dev
```

## Dependencies

- Vue 3
- Headless UI
- Heroicons
- Marked (for Markdown rendering)


## Usage

1. Launch the application
2. Enter your Todoist API token
3. Use the search bar to filter tasks
4. Click any task to view details
5. Use the Copy Tasks dropdown to export tasks

## Security Notes

- API tokens are stored in memory only
- No data is persisted locally
- Use HTTPS in production
