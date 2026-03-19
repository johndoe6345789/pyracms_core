-- PyraCMS Articles
-- Phase 3: Article renderers, articles, revisions, tags, and votes

CREATE TABLE IF NOT EXISTS article_renderers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL
);

INSERT INTO article_renderers (name) VALUES
    ('HTML'),
    ('BBCODE'),
    ('RESTRUCTUREDTEXT'),
    ('MARKDOWN')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    display_name VARCHAR(256) NOT NULL DEFAULT '',
    private BOOLEAN NOT NULL DEFAULT FALSE,
    hide_display_name BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    renderer_id INTEGER REFERENCES article_renderers(id) ON DELETE SET NULL,
    view_count INTEGER NOT NULL DEFAULT 0,
    thread_id INTEGER NOT NULL DEFAULT -1,
    album_id INTEGER NOT NULL DEFAULT -1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_articles_tenant_id ON articles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_renderer_id ON articles(renderer_id);
CREATE INDEX IF NOT EXISTS idx_articles_name ON articles(name);

CREATE TABLE IF NOT EXISTS article_revisions (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    summary VARCHAR(512) NOT NULL DEFAULT '',
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_revisions_article_id ON article_revisions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_revisions_user_id ON article_revisions(user_id);

CREATE TABLE IF NOT EXISTS article_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_name ON article_tags(name);

CREATE TABLE IF NOT EXISTS article_votes (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL,
    UNIQUE (article_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_article_votes_article_id ON article_votes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_votes_user_id ON article_votes(user_id);
