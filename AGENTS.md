<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Dev server

After CSS/UI changes, restart with a clean cache so styles are visible:

```bash
npm run dev:fresh
```

Kill any process on port 3000 first if needed. Tell the user to hard-refresh (Cmd+Shift+R).
