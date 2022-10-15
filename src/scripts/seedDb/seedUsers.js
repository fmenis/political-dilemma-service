export async function seedUsers(client) {
  const provinces = await client.provinces.find({})
  const target = provinces.find(item => item.name === 'Udine')

  const users = [
    {
      first_name: 'Filippo',
      last_name: 'Menis',
      user_name: 'menis',
      email: 'filippomeniswork@gmail.com',
      type: 'backoffice',
      password: '$2b$10$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a',
      id_region: target.id_region,
      id_province: target.id,
    },
    {
      first_name: 'Dennis',
      last_name: 'Boanini',
      user_name: 'Boa',
      email: 'dennis.boanini01@gmail.com',
      type: 'backoffice',
      password: '$2b$10$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a',
      id_region: target.id_region,
      id_province: target.id,
    },
    {
      first_name: 'Gaetano',
      last_name: 'Danelli',
      user_name: 'gaetà',
      email: 'gaetano.danelli@me.com',
      type: 'backoffice',
      password: '$2b$10$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a',
      id_region: target.id_region,
      id_province: target.id,
    },
    {
      first_name: 'Luisa',
      last_name: 'Verdi',
      user_name: 'luive',
      email: 'luisa@acme.com',
      type: 'backoffice',
      password: '$2b$10$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a',
      id_region: target.id_region,
      id_province: target.id,
    },
    {
      first_name: 'Mario',
      last_name: 'Rossi',
      user_name: 'mario',
      email: 'mario@acme.com',
      type: 'backoffice',
      password: '$2b$10$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a',
      id_region: target.id_region,
      id_province: target.id,
    },
  ]

  for (const user of users) {
    await client.users.save(user)
  }
}
