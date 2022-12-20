export async function seedMisc(client) {
  const categories = [
    {
      name: 'Decreti',
      type: 'ARTICLE',
    },
    {
      name: 'Leggi',
      type: 'ARTICLE',
    },
    {
      name: 'Ambiente',
      type: 'ARTICLE',
    },
    //TODO
    {
      name: 'FOO',
      type: 'ACTIVITY',
    },
  ]

  for (const category of categories) {
    await client.categories.save({
      name: category.name,
      type: category.type,
    })
  }
}
