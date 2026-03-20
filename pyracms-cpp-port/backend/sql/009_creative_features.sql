-- PyraCMS Creative Features Migration
-- Code snippets with execution, analytics, webhooks, achievements, social

-- Code snippets (executable, forkable)
CREATE TABLE IF NOT EXISTS code_snippets (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'python',
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    run_count INTEGER NOT NULL DEFAULT 0,
    forked_from INTEGER REFERENCES code_snippets(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snippets_author ON code_snippets(author_id);
CREATE INDEX IF NOT EXISTS idx_snippets_language ON code_snippets(language);
CREATE INDEX IF NOT EXISTS idx_snippets_tenant ON code_snippets(tenant_id);

-- Snippet executions
CREATE TABLE IF NOT EXISTS snippet_executions (
    id SERIAL PRIMARY KEY,
    snippet_id INTEGER NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    output TEXT NOT NULL DEFAULT '',
    exit_code INTEGER NOT NULL DEFAULT 0,
    execution_time_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Page views (analytics)
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    path VARCHAR(500) NOT NULL,
    referrer VARCHAR(500),
    user_agent VARCHAR(500),
    ip_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_tenant_date ON page_views(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);

-- Search queries (analytics)
CREATE TABLE IF NOT EXISTS search_queries (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    query VARCHAR(500) NOT NULL,
    result_count INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    secret VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Webhook deliveries
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id SERIAL PRIMARY KEY,
    webhook_id INTEGER NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status_code INTEGER,
    response_body TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING GIN(to_tsvector('english', name || ' ' || display_name));
CREATE INDEX IF NOT EXISTS idx_forum_posts_search ON forum_posts USING GIN(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_snippets_search ON code_snippets USING GIN(to_tsvector('english', title || ' ' || code));
CREATE INDEX IF NOT EXISTS idx_gamedep_search ON gamedep_pages USING GIN(to_tsvector('english', name || ' ' || display_name || ' ' || description));

-- User profiles (social features)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation INTEGER NOT NULL DEFAULT 0;

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon VARCHAR(100) NOT NULL DEFAULT 'star',
    criteria JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, followed_id)
);

-- Seed achievements
INSERT INTO achievements (name, display_name, description, icon) VALUES
    ('first_post', 'First Post', 'Created your first forum post', 'forum'),
    ('hundred_posts', 'Century', 'Created 100 forum posts', 'hundred'),
    ('year_member', 'Veteran', 'Member for over a year', 'calendar'),
    ('helpful', 'Helpful', 'Received 50 upvotes', 'thumbup'),
    ('polyglot', 'Polyglot', 'Ran code in 3 different languages', 'code'),
    ('early_adopter', 'Early Adopter', 'One of the first 100 users', 'rocket'),
    ('bug_reporter', 'Bug Reporter', 'Reported a confirmed bug', 'bug'),
    ('first_article', 'Author', 'Published your first article', 'article'),
    ('first_snippet', 'Coder', 'Created your first code snippet', 'code'),
    ('popular', 'Popular', 'A post received 100 upvotes', 'star')
ON CONFLICT (name) DO NOTHING;
