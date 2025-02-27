SELECT 
{columns}
  users.id, users.first_name, users.last_name, users.user_name, users.email,
  users.joined_date, users.is_blocked, users.is_deleted, users.last_access,
  regions.name AS region, provinces.name AS province, roles.name AS role
  -- (SELECT count(id) FROM articles 
  --   WHERE status <> 'PUBLISHED' AND status <> 'ARCHIVED' AND status <> 'READY' AND "ownerId" = users.id
  -- ) as "draftArticles",
  -- (SELECT count(id) FROM articles 
  --   WHERE status = 'PUBLISHED' OR status = 'ARCHIVED' AND "ownerId" = users.id
  -- ) as "publishedArticles",
  -- (SELECT count(id) FROM activity 
  --   WHERE status <> 'PUBLISHED' AND status <> 'ARCHIVED' AND status <> 'READY' AND "ownerId" = users.id
  -- ) as "draftActivities",
  -- (SELECT count(id) FROM activity 
  --   WHERE status = 'PUBLISHED' OR status = 'ARCHIVED' AND "ownerId" = users.id
  -- ) as "publishedActivities"
{columns}
FROM users
JOIN provinces
  ON users.id_province = provinces.id
JOIN regions
  ON users.id_region = regions.id
JOIN users_roles
  ON users_roles.user_id = users.id
JOIN roles
  ON roles.id = users_roles.role_id