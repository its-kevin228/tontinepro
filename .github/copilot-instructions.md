# Next.js Best Practices

Apply these rules when writing or reviewing Next.js code in the `frontend/my-app` directory.

## File Conventions
- **Project Structure**: Follow Next.js App Router project structure and special files conventions (`layout.tsx`, `page.tsx`, `error.tsx`, `not-found.tsx`).
- **Routing**: Correctly implement Route segments (dynamic, catch-all, groups).
- **Advanced Routing**: Use Parallel and intercepting routes where appropriate.
- **Middleware**: Note the Middleware rename in v16 (middleware → proxy).

## RSC (React Server Components) Boundaries
- **Invalid Patterns**: Detect and avoid invalid React Server Component patterns.
- **Async Client Components**: Async client components are invalid. Do not use `async` on components with `"use client"`.
- **Serialization**: Non-serializable props detection. Do not pass non-serializable data (like functions or Date objects) from Server Components to Client Components.

## General
- Use `shadcn/ui` and `Tailwind CSS` for styling as per the project guidelines.
- Handle errors gracefully with specific file conventions like `error.tsx` and `not-found.tsx`.
- Keep Server Components and Client Components well separated. Use `"use client"` only when interactivity or browser APIs are strictly needed.