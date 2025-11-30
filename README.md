Learn-search

A lightning-fast, clean, and minimal semantic search interface for learning resources — built with React, TypeScript, Tailwind, shadcn-ui, and Supabase.

Learn-search is built to experiment with modern search UX patterns, vector-based search workflows, and clean component architecture.
This is a foundational project that can scale into a full GenAI-powered learning platform.

👀 Demo

(If deployed, add link here. Example:)
🔗 https://learn-search.vercel.app

🚀 Features
🔍 Semantic Search UI

Minimal, distraction-free search interface

Smart debounced input

Clean results layout with responsive grid

🎨 Beautiful Modern UI

TailwindCSS for utility-first styles

shadcn/ui components

Smooth animations & subtle interactions

Mobile-first responsive layout

⚙️ Powered by Supabase

Supabase project configuration included

Ready for vector embeddings / semantic index

Scalable backend structure

🧩 Developer-Friendly Setup

Vite + React + TS = extremely fast DX

ESLint + Prettier configured

Organized folder structure for scaling UI

.env.example included for easy onboarding

🏗️ Tech Stack

Frontend

React

TypeScript

Vite

TailwindCSS

shadcn/ui

Backend / Infra

Supabase

Postgres (optional vector search enabled)

Tooling

ESLint

Prettier

pnpm / npm / yarn

📂 Project Structure
learn-search/
│
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities, API helpers
│   ├── pages/            # Main screens
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
│
├── supabase/             # Supabase config + schema
├── .env.example          # Environment variables template
├── eslint.config.js
├── tailwind.config.js
├── vite.config.ts
└── package.json

⚙️ Environment Setup

Clone the repo

git clone https://github.com/harshmriduhash/Learn-search
cd Learn-search


Install dependencies

npm install
# or pnpm install


Add environment variables
Create a .env file based on .env.example

VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key


Run the app

npm run dev

🧠 How Search Works (Architecture Overview)

User enters query → frontend captures & debounces

Optionally convert text → embeddings (client or server)

Send to Supabase RPC function / vector index

Retrieve & rank results

Render clean UI with scores + metadata

This architecture can scale to:

GPT-powered answer generation

Document chunking + RAG

Multiple dataset search

AI tutor features

Multi-tenant SaaS

📈 Roadmap

 Add semantic embeddings

 Add fuzzy search

 Add “Sources” sidebar

 Add dark mode

 Deploy on Vercel

 Convert to a full SaaS (auth + multi-tenant workspace)

🤝 Contributing

PRs are welcome.
For big changes, open an issue first to discuss.

📜 License

MIT License.

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6dc473b5-816b-45ae-af75-cf534a607bc9

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6dc473b5-816b-45ae-af75-cf534a607bc9) and start prompting.
