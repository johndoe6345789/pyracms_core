-- The icon shown beside a menu entry: the name of a Material icon
-- (e.g. "TrainOutlined"), or '' for none.
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS icon VARCHAR(64)
    NOT NULL DEFAULT '';
