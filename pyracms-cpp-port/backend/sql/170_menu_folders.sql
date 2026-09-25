-- Folders in a site's menu: an item of type 'folder' has no link of its own
-- and shows its children as a dropdown. One level deep. Deleting a folder
-- leaves its links in place at the top level.
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS parent_id INTEGER
    REFERENCES menu_items(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON menu_items(parent_id);

-- Items were only ever 'route' or 'url'; a folder is the third kind.
-- (the table used to be called menus; older databases kept that name)
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menus_type_check;
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_type_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_type_check
    CHECK (type IN ('route', 'url', 'folder'));
