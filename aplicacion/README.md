# CodeAtlas

CodeAtlas is a web application that reads structured Markdown documentation files and generates interactive visual diagrams of your application's architecture.

## What it does

Upload your project documentation files and CodeAtlas will generate a visual diagram showing your modules, screens, flows and database entities — and how they all connect.

## Tech stack

- **Frontend**: Vue 3 + Vite + Vue Router + Pinia
- **Backend**: Node.js + Express

## Getting started

### Requirements
- Node.js 18+
- npm

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running in development

```bash
# Backend — http://localhost:3000
cd backend
npm run dev

# Frontend — http://localhost:5173
cd frontend
npm run dev
```

## Project structure

```
aplicacion/
├── backend/        Node.js + Express API
├── frontend/       Vue 3 + Vite app
└── docs/           Internal development documentation
```

## Documentation format

CodeAtlas reads `.md` files following a specific format. See `estructura-proyecto/lector-de-archivos/` for the full format specification.
