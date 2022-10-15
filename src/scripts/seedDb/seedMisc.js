export async function seedMisc(client) {
  const categories = [
    {
      name: 'Decreti',
    },
    {
      name: 'Leggi',
    },
    {
      name: 'Ambiente',
    },
  ]

  for (const category of categories) {
    await client.categories.save({
      name: category.name,
    })
  }
}
