-- PyraCMS Forum
-- Phase 4: Forum categories, forums, threads, posts, votes, tags, and comments

CREATE TABLE IF NOT EXISTS forum_categories (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_forum_categories_tenant_id ON forum_categories(tenant_id);

CREATE TABLE IF NOT EXISTS forums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category_id INTEGER REFERENCES forum_categories(id) ON DELETE CASCADE,
    UNIQUE (name, category_id)
);

CREATE INDEX IF NOT EXISTS idx_forums_category_id ON forums(category_id);

CREATE TABLE IF NOT EXISTS forum_threads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    forum_id INTEGER REFERENCES forums(id) ON DELETE CASCADE,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_forum_id ON forum_threads(forum_id);

CREATE TABLE IF NOT EXISTS forum_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(256) NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    thread_id INTEGER REFERENCES forum_threads(id) ON DELETE CASCADE,
    file_id INTEGER REFERENCES files(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_file_id ON forum_posts(file_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);

CREATE TABLE IF NOT EXISTS forum_post_votes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL,
    UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_post_votes_post_id ON forum_post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_votes_user_id ON forum_post_votes(user_id);

CREATE TABLE IF NOT EXISTS forum_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    thread_id INTEGER REFERENCES forum_threads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_forum_tags_thread_id ON forum_tags(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_tags_name ON forum_tags(name);

CREATE TABLE IF NOT EXISTS forum_comments (
    id SERIAL PRIMARY KEY,
    hash_text VARCHAR(256) UNIQUE NOT NULL,
    thread_id INTEGER REFERENCES forum_threads(id) ON DELETE CASCADE UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_forum_comments_thread_id ON forum_comments(thread_id);
