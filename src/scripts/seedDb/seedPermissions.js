export async function seedPermissions(client) {
  const permissions = [
    //permission
    {
      resource: 'permission',
      action: 'create',
      description: 'TODO',
    },
    {
      resource: 'permission',
      action: 'delete',
      description: 'TODO',
    },
    {
      resource: 'permission',
      action: 'list',
      description: 'TODO',
    },
    {
      resource: 'permission',
      action: 'update',
      description: 'TODO',
    },
    // role
    {
      resource: 'role',
      action: 'create',
      description: 'TODO',
    },
    {
      resource: 'role',
      action: 'delete',
      description: 'TODO',
    },
    {
      resource: 'role',
      action: 'list',
      description: 'TODO',
    },
    {
      resource: 'role',
      action: 'add-permission',
      description: 'TODO',
    },
    {
      resource: 'role',
      action: 'remove-permission',
      description: 'TODO',
    },
    {
      resource: 'role',
      action: 'update',
      description: 'TODO',
    },
    {
      resource: 'role',
      action: 'read',
      description: 'TODO',
    },
    {
      resource: 'role',
      action: 'user-assign',
      description: 'TODO',
    },
    // user
    {
      resource: 'user',
      action: 'create',
      description: 'TODO',
    },
    {
      resource: 'user',
      action: 'delete',
      description: 'TODO',
    },
    {
      resource: 'user',
      action: 'list',
      description: 'TODO',
    },
    {
      resource: 'user',
      action: 'read',
      description: 'TODO',
    },
    {
      resource: 'user',
      action: 'update',
      description: 'TODO',
    },
    {
      resource: 'user',
      action: 'block',
      description: 'TODO',
    },
    {
      resource: 'user',
      action: 'unblock',
      description: 'TODO',
    },
    // article
    {
      resource: 'article',
      action: 'create',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'list',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'delete',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'read',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'update',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'review',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'approve',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'rework',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'publish',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'archive',
      description: 'TODO',
    },
    {
      resource: 'article',
      action: 'delete-action',
      description: 'TODO',
    },
  ]

  for (const permission of permissions) {
    await client.permissions.save(permission)
  }
}
