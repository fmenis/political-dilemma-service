export async function populateLegislature(legislature, massive) {
  const ministries = await massive.ministry.find(
    { legislatureId: legislature.id },
    {
      fields: ['id', 'name', 'politicianId'],
      order: [
        {
          field: 'createdAt',
          direction: 'desc',
        },
      ],
    }
  )

  const politicians = await massive.politician.find(
    { id: ministries.map(item => item.politicianId) },
    {
      fields: ['id', 'firstName', 'lastName'],
    }
  )

  return {
    ...legislature,
    ministries: ministries.map(ministry => {
      const politician = politicians.find(
        item => item.id === ministry.politicianId
      )
      return {
        ...ministry,
        ministerFullName: `${politician.firstName} ${politician.lastName}`,
      }
    }),
  }
}
