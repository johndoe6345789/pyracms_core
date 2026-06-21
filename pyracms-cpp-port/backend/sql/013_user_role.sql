-- Add role column to users table (UserRole enum stored as int: 0=Guest,1=User,2=Moderator,3=SiteAdmin,4=SuperAdmin)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role INTEGER NOT NULL DEFAULT 1;
