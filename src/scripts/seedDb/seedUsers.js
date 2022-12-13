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
    {
      first_name: 'Virna',
      last_name: 'Seconda',
      user_name: 'virna',
      email: 'virna@acme.com',
      type: 'backoffice',
      password: '$2b$10$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a',
      id_region: target.id_region,
      id_province: target.id,
    },
    {
      first_name: 'Andrea',
      last_name: 'Storto',
      user_name: 'andre',
      email: 'andrea@acme.com',
      type: 'backoffice',
      password: '$2b$10$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a',
      id_region: target.id_region,
      id_province: target.id,
    },
    {
      first_name: 'Corto',
      last_name: 'Ignazio',
      user_name: 'ignà',
      email: 'ignazio@acme.com',
      type: 'backoffice',
      password: '$2b$10$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a',
      id_region: target.id_region,
      id_province: target.id,
    },
    {
      first_name: 'Valeria',
      last_name: 'Incastrata',
      user_name: 'vale',
      email: 'vale@acme.com',
      type: 'backoffice',
      password: '$2b$10$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a',
      id_region: target.id_region,
      id_province: target.id,
    },
    {
      first_name: 'Lontana',
      last_name: 'Alzazia',
      user_name: 'alsa',
      email: 'alsa@acme.com',
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
