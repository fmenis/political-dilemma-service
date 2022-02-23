SELECT 
  users.id, users.first_name, users.last_name, users.user_name, users.email, 
  users.type, users.id_region, users.id_province, users.bio, users.birth_date,  
  users.joined_date, users.sex, users.is_blocked, is_deleted, roles.name AS role
FROM users  
JOIN users_roles 
  ON users_roles.user_id = users.id
JOIN roles 
  ON roles.id = users_roles.role_id 
WHERE users.id = $1