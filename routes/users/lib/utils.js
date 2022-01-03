export async function populateUser(user, pg) {
  async function getRegion(regionId) {
    const res = await pg.execQuery(
      'SELECT name FROM regions WHERE id=$1',
      [regionId],
      { findOne: true }
    )
    return res.name
  }

  async function getProvince(provinceId) {
    const res = await pg.execQuery(
      'SELECT name FROM provinces WHERE id=$1',
      [provinceId],
      { findOne: true }
    )
    return res.name
  }

  const [regionName, provinceName] = await Promise.all([
    getRegion(user.idRegion),
    getProvince(user.idProvince),
  ])

  user.region = regionName
  user.province = provinceName

  return user
}
