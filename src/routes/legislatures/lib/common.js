export async function populateLegislature(legislature, massive) {
  const ministries = await massive.ministry.find(
    { legislatureId: legislature.id },
    {
      fields: ['id', 'name', 'ministerFullName'],
      order: [
        {
          field: 'createdAt',
          direction: 'desc',
        },
      ],
    }
  )

  return {
    ...legislature,
    ministries,
  }
}
