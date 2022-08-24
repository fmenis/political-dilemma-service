import { unlink } from 'fs/promises'

/**
 * Calculate real file size in MB
 * @param {number} blksize file block size
 * @param {number} blocks number of blocks
 * @returns {number} rouded file size
 */
export function calcFileSize(blksize, blocks) {
  const realSize = blksize * blocks //TODO controllare calcolo
  const mb = realSize / (1024 * 1024)
  const rounded = parseFloat(mb.toFixed(2))
  return rounded
}

/**
 * Delete target files
 * @param {string[]} filePaths abs file paths
 * @returns {Promise<void>}
 */
export function deleteFiles(filePaths) {
  return Promise.all(filePaths.map(filePath => unlink(filePath)))
}
