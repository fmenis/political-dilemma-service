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
    ministries: ministries.map(minister => {
      const politician = politicians.find(
        item => item.id === minister.politicianId
      )
      return {
        ...minister,
        ministry: {
          id: politician.id,
          firstName: politician.firstName,
          lastName: politician.lastName,
        },
      }
    }),
  }
}
