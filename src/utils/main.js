/**
 * Find duplicated inside the target array
 */
export function findArrayDuplicates(array) {
  return array.reduce((acc, id, index, array) => {
    if (array.indexOf(id) !== index && !acc.includes(id)) {
      acc.push(id)
    }
    return acc
  }, [])
}
