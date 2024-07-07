import { unlink } from 'fs/promises'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'node:stream/promises'

/**
 * Calculate real file size in MB
 * @param {number} blksize file block size
 * @param {number} blocks number of blocks
 * @returns {number} rounded file size
 */
export function calcFileSize(size) {
  const mb = size / (1024 * 1024)
  const rounded = parseFloat(mb.toFixed(2))
  return rounded
}

/**
 * Delete target files
 * @param {string | string[]} filePaths abs file paths
 * @returns {Promise<void>}
 */
export function deleteFiles(filePaths) {
  filePaths = Array.isArray(filePaths) ? filePaths : [filePaths]
  return Promise.all(filePaths.map(filePath => unlink(filePath)))
}

/**
 * Move a file from a location to another (streamed)
 * @param {string} sourcePath source file abs path
 * @param {string} destPath dest file abs path
 * @returns {Promise<void>}
 */
export function moveFile(sourcePath, destPath) {
  return pipeline(createReadStream(sourcePath), createWriteStream(destPath))
}
