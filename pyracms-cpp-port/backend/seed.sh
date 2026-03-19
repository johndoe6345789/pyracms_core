#!/bin/bash
# Idempotent seed script — runs only if no tenants exist yet.
set -e

API="http://localhost:8080"

echo "Checking if seed data already exists..."
TENANTS=$(curl -sf "$API/api/tenants" || echo "[]")
if [ "$TENANTS" != "[]" ]; then
  echo "Seed data already exists, skipping."
  exit 0
fi

echo "Seeding database..."

# ── Register users ──────────────────────────────────────
echo "  Creating users..."
ADMIN_RES=$(curl -sf -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@pyracms.com","password":"password123","fullName":"Admin User"}')
TOKEN=$(echo "$ADMIN_RES" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
AUTH="Authorization: Bearer $TOKEN"

curl -sf -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@pyracms.com","password":"password123","fullName":"Alice Johnson"}' > /dev/null

# ── Create tenant ───────────────────────────────────────
echo "  Creating tenant..."
TENANT_RES=$(curl -sf -X POST "$API/api/tenants" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"slug":"demo","displayName":"Demo Site","description":"A demo PyraCMS site with sample content"}')
TENANT_ID=$(echo "$TENANT_RES" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

# ── Create articles ─────────────────────────────────────
echo "  Creating articles..."
for article in \
  '{"name":"getting-started","displayName":"Getting Started with PyraCMS","content":"<h2>Welcome</h2><p>PyraCMS is a modern multi-tenant content management system built with C++ and Next.js.</p><h2>Features</h2><p>PyraCMS offers articles, forums, galleries, code snippets, and a game/dependency manager — all within a multi-tenant architecture.</p><h2>Quick Start</h2><p>Create your first tenant, then start adding content through the admin panel or the API.</p>","rendererName":"html","tags":["tutorial","getting-started"]}' \
  '{"name":"typescript-patterns","displayName":"TypeScript Patterns","content":"<h2>Introduction</h2><p>TypeScript provides powerful type-level programming capabilities. This article explores advanced patterns.</p><h2>Conditional Types</h2><p>Conditional types let you express non-uniform type mappings, useful for creating flexible utility types.</p><h2>Mapped Types</h2><p>Mapped types allow you to transform existing types by iterating over their properties.</p>","rendererName":"html","tags":["typescript","patterns"]}' \
  '{"name":"rest-api-design","displayName":"REST API Design","content":"<h2>Principles</h2><p>Good REST API design follows consistent naming conventions, proper HTTP methods, and meaningful status codes.</p><h2>Resource Naming</h2><p>Use plural nouns for collections and nested paths for relationships.</p><h2>Error Handling</h2><p>Return consistent error objects with status codes, messages, and optional details.</p>","rendererName":"html","tags":["api","backend","architecture"]}' \
  '{"name":"docker-guide","displayName":"Docker for Developers","content":"<h2>Why Docker?</h2><p>Docker provides consistent development environments and simplifies deployment workflows.</p><h2>Dockerfiles</h2><p>A Dockerfile describes how to build your application image step by step.</p><h2>Docker Compose</h2><p>Compose lets you define multi-container applications in a single YAML file.</p>","rendererName":"html","tags":["docker","devops"]}' \
  '{"name":"css-grid-layout","displayName":"Mastering CSS Grid","content":"<h2>Grid Basics</h2><p>CSS Grid is a two-dimensional layout system that lets you place items in rows and columns.</p><h2>Template Areas</h2><p>Named grid areas make complex layouts readable and maintainable.</p><h2>Responsive Grids</h2><p>Combine minmax(), auto-fill, and media queries for fluid responsive designs.</p>","rendererName":"html","tags":["css","frontend","layout"]}'; do
  curl -sf -X POST "$API/api/articles?tenant_id=$TENANT_ID" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d "$article" > /dev/null
done

# ── Create forum categories, forums, threads, posts ─────
echo "  Creating forum content..."
CAT1=$(curl -sf -X POST "$API/api/forum/categories" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"General Discussion\",\"tenant_id\":$TENANT_ID}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

CAT2=$(curl -sf -X POST "$API/api/forum/categories" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"Development\",\"tenant_id\":$TENANT_ID}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

FORUM1=$(curl -sf -X POST "$API/api/forum/forums" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"Introductions\",\"description\":\"Introduce yourself to the community.\",\"categoryId\":$CAT1}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

FORUM2=$(curl -sf -X POST "$API/api/forum/forums" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"Frontend Development\",\"description\":\"Discuss HTML, CSS, JavaScript, React, and other frontend topics.\",\"categoryId\":$CAT2}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

FORUM3=$(curl -sf -X POST "$API/api/forum/forums" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"Backend Development\",\"description\":\"Topics related to server-side development, APIs, and databases.\",\"categoryId\":$CAT2}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

# Threads
T1=$(curl -sf -X POST "$API/api/forum/threads" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Welcome to the Community!\",\"content\":\"Hello everyone! Feel free to introduce yourselves here.\",\"forumId\":$FORUM1}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

T2=$(curl -sf -X POST "$API/api/forum/threads" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Next.js vs Remix: Which should I choose?\",\"content\":\"I am starting a new project and trying to decide between Next.js and Remix. Looking for advice.\",\"forumId\":$FORUM2}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

T3=$(curl -sf -X POST "$API/api/forum/threads" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Best state management in 2026?\",\"content\":\"What are people using for state management these days? Redux, Zustand, Jotai?\",\"forumId\":$FORUM2}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

T4=$(curl -sf -X POST "$API/api/forum/threads" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"REST vs GraphQL for new projects\",\"content\":\"Starting a new API — should I go with REST or GraphQL? What are the trade-offs?\",\"forumId\":$FORUM3}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

T5=$(curl -sf -X POST "$API/api/forum/threads" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Database migration strategies\",\"content\":\"How do you handle database migrations in production? Looking for best practices.\",\"forumId\":$FORUM3}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

# Posts (replies)
for post in \
  "{\"content\":\"Welcome! I am a full-stack developer from London. Excited to be here.\",\"threadId\":$T1}" \
  "{\"content\":\"Hey everyone! I have been using PyraCMS for a few months and love it.\",\"threadId\":$T1}" \
  "{\"content\":\"I have used both. Next.js has a larger ecosystem, but Remix has better form handling.\",\"threadId\":$T2}" \
  "{\"content\":\"For content-heavy sites, Next.js is the way to go. Remix shines for dashboards.\",\"threadId\":$T2}" \
  "{\"content\":\"Next.js 16 with the App Router is really mature now. I would recommend it.\",\"threadId\":$T2}" \
  "{\"content\":\"Zustand has been my go-to. Simple API, minimal boilerplate, great TypeScript support.\",\"threadId\":$T3}" \
  "{\"content\":\"Jotai for atomic state, Zustand for global stores. Use both when needed.\",\"threadId\":$T3}" \
  "{\"content\":\"REST is simpler to start with. GraphQL shines when you have many clients with different data needs.\",\"threadId\":$T4}" \
  "{\"content\":\"We use both — REST for public APIs, GraphQL for internal dashboards.\",\"threadId\":$T4}" \
  "{\"content\":\"Always use versioned SQL migrations. Tools like Flyway or golang-migrate help a lot.\",\"threadId\":$T5}"; do
  curl -sf -X POST "$API/api/forum/posts" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d "$post" > /dev/null
done

# ── Create gallery albums with pictures ─────────────────
echo "  Creating gallery content..."
ALBUM1=$(curl -sf -X POST "$API/api/gallery/albums" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"displayName\":\"Nature Photography\",\"description\":\"Beautiful landscapes and wildlife.\",\"tenant_id\":$TENANT_ID}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

ALBUM2=$(curl -sf -X POST "$API/api/gallery/albums" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"displayName\":\"Architecture\",\"description\":\"Modern buildings and structures.\",\"tenant_id\":$TENANT_ID}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

for i in 1 2 3 4; do
  curl -sf -X POST "$API/api/gallery/albums/$ALBUM1/pictures" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d "{\"title\":\"Nature Photo $i\",\"description\":\"A beautiful nature photograph.\",\"url\":\"https://picsum.photos/seed/nature$i/800/600\"}" > /dev/null
done

for i in 1 2 3; do
  curl -sf -X POST "$API/api/gallery/albums/$ALBUM2/pictures" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d "{\"title\":\"Architecture Photo $i\",\"description\":\"Modern architecture.\",\"url\":\"https://picsum.photos/seed/arch$i/800/600\"}" > /dev/null
done

# ── Create code snippets ────────────────────────────────
echo "  Creating code snippets..."
curl -sf -X POST "$API/api/snippets" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Fibonacci Sequence\",\"language\":\"python\",\"code\":\"def fibonacci(n):\\n    a, b = 0, 1\\n    result = []\\n    for _ in range(n):\\n        result.append(a)\\n        a, b = b, a + b\\n    return result\\n\\nprint(fibonacci(10))\",\"tenant_id\":$TENANT_ID}" > /dev/null

curl -sf -X POST "$API/api/snippets" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Quick Sort\",\"language\":\"javascript\",\"code\":\"function quickSort(arr) {\\n  if (arr.length <= 1) return arr;\\n  const pivot = arr[Math.floor(arr.length / 2)];\\n  const left = arr.filter(x => x < pivot);\\n  const mid = arr.filter(x => x === pivot);\\n  const right = arr.filter(x => x > pivot);\\n  return [...quickSort(left), ...mid, ...quickSort(right)];\\n}\\n\\nconsole.log(quickSort([3,6,8,10,1,2,1]));\",\"tenant_id\":$TENANT_ID}" > /dev/null

curl -sf -X POST "$API/api/snippets" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Hello World\",\"language\":\"go\",\"code\":\"package main\\n\\nimport \\\"fmt\\\"\\n\\nfunc main() {\\n    fmt.Println(\\\"Hello, World!\\\")\\n}\",\"tenant_id\":$TENANT_ID}" > /dev/null

# ── Create menu items ───────────────────────────────────
echo "  Creating menus..."
MG=$(curl -sf -X POST "$API/api/menu-groups" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"main\",\"tenant_id\":$TENANT_ID}" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

for item in \
  '{"name":"Home","route":"/","position":0}' \
  '{"name":"Articles","route":"/articles","position":1}' \
  '{"name":"Forum","route":"/forum","position":2}' \
  '{"name":"Gallery","route":"/gallery","position":3}' \
  '{"name":"Code","route":"/snippets","position":4}'; do
  curl -sf -X POST "$API/api/menu-groups/$MG/items" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d "$item" > /dev/null
done

# ── Create default settings ─────────────────────────────
echo "  Creating settings..."
for setting in \
  '{"name":"site_name","value":"Demo Site"}' \
  '{"name":"site_description","value":"A demo PyraCMS site"}' \
  '{"name":"default_language","value":"en"}' \
  '{"name":"registration_enabled","value":"true"}'; do
  curl -sf -X PUT "$API/api/settings/$(echo "$setting" | sed -n 's/.*"name":"\([^"]*\)".*/\1/p')?tenant_id=$TENANT_ID" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d "$setting" > /dev/null
done

echo "Seed complete!"
