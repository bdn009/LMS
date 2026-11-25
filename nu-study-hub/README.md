# Nu Study Hub

An independent Next.js App Router frontend with TypeScript, React, Tailwind CSS, and Lucide icons.

## Run locally

```sh
npm ci
npm run dev -- --port 3001
```

Open http://localhost:3001. Run `npm run typecheck` to check types and `npm run build` for the production static export in `out/`.

## Pages and features

- Home and course discovery: `/`
- Searchable and filterable catalog: `/courses`
- Course details, curriculum, preview, and enrollment: `/courses/[id]`
- Saved courses, progress, and certificates: `/dashboard`
- Video/PDF/image lessons, quizzes, notes, and discussions: `/learn/[id]`
- Course creation, editing, modules, and uploads: `/instructor`

Six sample courses include local playable videos, real PDFs, image slides, and quizzes. Profiles, prices, ratings, and analytics are demo data. No payments or backend services are connected.

Enrollment, progress, notes, quiz scores, and course edits persist in `nu-study-hub.workspace.v1`. Uploaded media uses the separate `nu-study-hub-media` IndexedDB database. This project does not share storage or hosting configuration with Forma.

Newsletter preferences and discussions are local demonstrations. Clearing browser storage removes locally saved data.
