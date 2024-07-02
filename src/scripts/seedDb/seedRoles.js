export async function seedRoles(client) {
  const role = await client.roles.save({
    name: 'Root',
    description: 'Full powers',
  })

  const permissions = await client.permissions.find({})

  for (const permission of permissions) {
    // it's not allowed to have both ownership for the same permission
    if (!permission.ownership || permission.ownership === 'any') {
      await client.permissions_roles.save({
        role_id: role.id,
        permission_id: permission.id,
      })
    }
  }

  const users = await client.users.find({})

  for (const user of users) {
    await client.users_roles.save({
      user_id: user.id,
      role_id: role.id,
      assign_by: user.id,
    })
  }
}
