#!/bin/bash
# Idempotent seed script — runs only if no tenants exist yet.

API="http://localhost:8080"

echo "Checking if seed data already exists..."
TENANTS=$(curl -s "$API/api/tenants" 2>/dev/null || echo "[]")
if [ "$TENANTS" != "[]" ]; then
  echo "Seed data already exists, skipping."
  exit 0
fi

echo "Seeding database..."

# ── Register users ──────────────────────────────────────
echo "  Creating users..."
ADMIN_RES=$(curl -s -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@pyracms.com","password":"password123","fullName":"Admin User"}')
TOKEN=$(echo "$ADMIN_RES" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
AUTH="Authorization: Bearer $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "  ERROR: Failed to get auth token."
  exit 1
fi
echo "    admin user created (token obtained)"

curl -s -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@pyracms.com","password":"password123","fullName":"Alice Johnson"}' > /dev/null 2>&1
echo "    alice user created"

# ── Create tenant ───────────────────────────────────────
echo "  Creating tenant..."
curl -s -X POST "$API/api/tenants" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"slug":"demo","displayName":"Demo Site","description":"A demo PyraCMS site with sample content"}' > /dev/null 2>&1

# Fetch tenant by slug to get the ID
TENANT_ID=$(curl -s "$API/api/tenants/demo" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

if [ -z "$TENANT_ID" ]; then
  echo "  ERROR: Failed to get tenant ID."
  exit 1
fi
echo "    tenant_id=$TENANT_ID"

# ── Create articles ─────────────────────────────────────
echo "  Creating articles..."
for art in \
  '{"name":"getting-started","displayName":"Getting Started with PyraCMS","content":"<h2>Welcome</h2><p>PyraCMS is a modern multi-tenant CMS.</p>","renderer":"html","tenant_id":'"$TENANT_ID"'}' \
  '{"name":"typescript-patterns","displayName":"TypeScript Patterns","content":"<h2>Introduction</h2><p>Advanced TypeScript patterns.</p>","renderer":"html","tenant_id":'"$TENANT_ID"'}' \
  '{"name":"rest-api-design","displayName":"REST API Design","content":"<h2>Principles</h2><p>Good REST API design follows consistent conventions.</p>","renderer":"html","tenant_id":'"$TENANT_ID"'}' \
  '{"name":"docker-guide","displayName":"Docker for Developers","content":"<h2>Why Docker?</h2><p>Consistent environments and simple deployments.</p>","renderer":"html","tenant_id":'"$TENANT_ID"'}' \
  '{"name":"css-grid-layout","displayName":"Mastering CSS Grid","content":"<h2>Grid Basics</h2><p>CSS Grid for 2D layouts.</p>","renderer":"html","tenant_id":'"$TENANT_ID"'}'; do
  curl -s -X POST "$API/api/articles" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d "$art" > /dev/null 2>&1
done
echo "    5 articles created"

# ── Create forum content ────────────────────────────────
echo "  Creating forum content..."
curl -s -X POST "$API/api/forum/categories" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"General Discussion\",\"tenantId\":$TENANT_ID}" > /dev/null 2>&1
curl -s -X POST "$API/api/forum/categories" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"Development\",\"tenantId\":$TENANT_ID}" > /dev/null 2>&1

# Get category IDs from the list endpoint
CATS=$(curl -s "$API/api/forum/categories?tenant_id=$TENANT_ID")
CAT1=$(echo "$CATS" | sed -n 's/.*\[{"id":\([0-9]*\).*/\1/p')
CAT2=$(echo "$CATS" | sed -n 's/.*},{"id":\([0-9]*\).*/\1/p')
echo "    categories: $CAT1, $CAT2"

# Create forums
curl -s -X POST "$API/api/forum/forums" -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"Introductions\",\"description\":\"Introduce yourself.\",\"categoryId\":${CAT1:-1}}" > /dev/null 2>&1
curl -s -X POST "$API/api/forum/forums" -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"Frontend Development\",\"description\":\"HTML, CSS, JS, React.\",\"categoryId\":${CAT2:-2}}" > /dev/null 2>&1
curl -s -X POST "$API/api/forum/forums" -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"Backend Development\",\"description\":\"APIs and databases.\",\"categoryId\":${CAT2:-2}}" > /dev/null 2>&1

# Get forum IDs from categories (they include forums array)
CATS_FULL=$(curl -s "$API/api/forum/categories?tenant_id=$TENANT_ID")
# Extract first 3 forum IDs using grep
FORUM_IDS=$(echo "$CATS_FULL" | grep -o '"id":[0-9]*' | sed 's/"id"://' | tail -3)
FORUM1=$(echo "$FORUM_IDS" | sed -n '1p')
FORUM2=$(echo "$FORUM_IDS" | sed -n '2p')
FORUM3=$(echo "$FORUM_IDS" | sed -n '3p')
echo "    forums: $FORUM1, $FORUM2, $FORUM3"

# Create threads
for td in \
  "{\"title\":\"Welcome!\",\"content\":\"Introduce yourselves here.\",\"forumId\":${FORUM1:-1}}" \
  "{\"title\":\"Next.js vs Remix\",\"content\":\"Which should I choose?\",\"forumId\":${FORUM2:-2}}" \
  "{\"title\":\"State management 2026\",\"content\":\"Redux, Zustand, or Jotai?\",\"forumId\":${FORUM2:-2}}" \
  "{\"title\":\"REST vs GraphQL\",\"content\":\"Trade-offs for new APIs?\",\"forumId\":${FORUM3:-3}}" \
  "{\"title\":\"DB migration strategies\",\"content\":\"Best practices?\",\"forumId\":${FORUM3:-3}}"; do
  curl -s -X POST "$API/api/forum/threads" -H "Content-Type: application/json" -H "$AUTH" \
    -d "$td" > /dev/null 2>&1
done
echo "    5 threads created"

# ── Create gallery albums ───────────────────────────────
echo "  Creating gallery content..."
curl -s -X POST "$API/api/gallery/albums" -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"displayName\":\"Nature Photography\",\"description\":\"Landscapes and wildlife.\",\"tenantId\":$TENANT_ID}" > /dev/null 2>&1
curl -s -X POST "$API/api/gallery/albums" -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"displayName\":\"Architecture\",\"description\":\"Modern buildings.\",\"tenantId\":$TENANT_ID}" > /dev/null 2>&1

# Get album IDs from list
ALBUMS=$(curl -s "$API/api/gallery/albums?tenant_id=$TENANT_ID")
ALBUM1=$(echo "$ALBUMS" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
ALBUM2=$(echo "$ALBUMS" | grep -o '"id":[0-9]*' | tail -1 | sed 's/"id"://')
echo "    albums: $ALBUM1, $ALBUM2"

for i in 1 2 3 4; do
  curl -s -X POST "$API/api/gallery/albums/${ALBUM1:-1}/pictures" -H "Content-Type: application/json" -H "$AUTH" \
    -d "{\"title\":\"Nature Photo $i\",\"description\":\"Nature.\",\"url\":\"https://picsum.photos/seed/nature$i/800/600\"}" > /dev/null 2>&1
done
for i in 1 2 3; do
  curl -s -X POST "$API/api/gallery/albums/${ALBUM2:-2}/pictures" -H "Content-Type: application/json" -H "$AUTH" \
    -d "{\"title\":\"Architecture Photo $i\",\"description\":\"Architecture.\",\"url\":\"https://picsum.photos/seed/arch$i/800/600\"}" > /dev/null 2>&1
done
echo "    7 pictures created"

# ── Create code snippets ────────────────────────────────
echo "  Creating code snippets..."
curl -s -X POST "$API/api/snippets" -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Fibonacci\",\"language\":\"python\",\"code\":\"def fib(n):\\n    a, b = 0, 1\\n    for _ in range(n):\\n        a, b = b, a+b\\n    return a\\nprint(fib(10))\",\"tenant_id\":$TENANT_ID}" > /dev/null 2>&1
curl -s -X POST "$API/api/snippets" -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Quick Sort\",\"language\":\"javascript\",\"code\":\"const qs = a => a.length < 2 ? a : [...qs(a.filter(x=>x<a[0])), a[0], ...qs(a.filter(x=>x>a[0]))];\\nconsole.log(qs([3,1,4,1,5,9]));\",\"tenant_id\":$TENANT_ID}" > /dev/null 2>&1
curl -s -X POST "$API/api/snippets" -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"Hello World\",\"language\":\"go\",\"code\":\"package main\\nimport \\\"fmt\\\"\\nfunc main() { fmt.Println(\\\"Hello!\\\") }\",\"tenant_id\":$TENANT_ID}" > /dev/null 2>&1
echo "    3 snippets created"

# ── Create menu group + items ───────────────────────────
echo "  Creating menus..."
curl -s -X POST "$API/api/menu-groups" -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"name\":\"main\",\"tenantId\":$TENANT_ID}" > /dev/null 2>&1
MG=$(curl -s "$API/api/menu-groups?tenant_id=$TENANT_ID" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
if [ -n "$MG" ]; then
  for item in \
    '{"name":"Home","route":"/","position":0}' \
    '{"name":"Articles","route":"/articles","position":1}' \
    '{"name":"Forum","route":"/forum","position":2}' \
    '{"name":"Gallery","route":"/gallery","position":3}' \
    '{"name":"Code","route":"/snippets","position":4}'; do
    curl -s -X POST "$API/api/menu-groups/$MG/items" -H "Content-Type: application/json" -H "$AUTH" \
      -d "$item" > /dev/null 2>&1
  done
  echo "    menu group $MG with 5 items"
fi

# ── Create settings ─────────────────────────────────────
echo "  Creating settings..."
for kv in "site_name:Demo Site" "site_description:A demo PyraCMS site" "default_language:en" "registration_enabled:true"; do
  KEY="${kv%%:*}"
  VAL="${kv#*:}"
  curl -s -X PUT "$API/api/settings/$KEY?tenant_id=$TENANT_ID" -H "Content-Type: application/json" -H "$AUTH" \
    -d "{\"name\":\"$KEY\",\"value\":\"$VAL\"}" > /dev/null 2>&1
done
echo "    4 settings created"

echo "Seed complete!"
