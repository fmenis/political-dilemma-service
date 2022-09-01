import S from 'fluent-json-schema'
import multipart from '@fastify/multipart'
import { join, extname } from 'path'
import { stat, mkdir } from 'fs/promises'

import { CATEGORIES } from './lib/enums.js'
import { calcFileSize, deleteFiles, moveFile } from './lib/utils.js'
import { appConfig } from '../../config/main.js'
import { calculateBaseUrl } from '../../utils/main.js'

export default async function uploadFile(fastify) {
  // fastify.register(multipart, {
  //   // limits: {
  //   //   fieldNameSize: 100,
  //   //   fieldSize: 100,
  //   //   fields: 10,
  //   //   fileSize: 1000000,
  //   //   files: 1,
  //   //   headerPairs: 2000,
  //   // },
  // })

  fastify.register(multipart)

  const { massive, config, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/upload',
    config: {
      public: false,
    },
    schema: {
      summary: 'Upload files',
      description: 'Upload files.',
      // body: S.object().additionalProperties(false).prop('files'),
      response: {
        200: S.array()
          .items(
            S.object()
              .additionalProperties(false)
              .description('Uploaded file/s.')
              .prop('id', S.string().format('uuid'))
              .description('File id.')
              .required()
              .prop('url', S.string().format('uri'))
              .description('File url.')
              .required()
          )
          .minItems(1)
          .maxItems(appConfig.upload.maxUploadsForRequeset),
      },
    },
    handler: onUploadFile,
  })

  async function onUploadFile(req) {
    const { user, log } = req
    const basePath = join(config.STATIC_FILES_DEST, 'articles/images')
    let urls

    const files = await req.saveRequestFiles()

    try {
      const populatedFiles = await populateFiles(files, basePath)

      await checkFiles(populatedFiles)

      await moveFiles(populatedFiles, basePath)

      urls = await indexFiles(populatedFiles, user)
    } catch (error) {
      log.error('Error trying to upload file', error)
      // delete tmp files in any case
      await deleteFiles(files.map(file => file.filepath))
    }

    return urls
  }

  function populateFiles(files, basePath) {
    async function populateFile(file) {
      const fileStats = await stat(file.filepath)
      return {
        ...file,
        destPath: join(basePath, file.filename),
        extension: extname(file.filename).slice(1),
        size: calcFileSize(fileStats.blksize, fileStats.blocks),
        url: `${calculateBaseUrl({
          excludePort: true,
        })}/static/articles/images/${file.filename}`,
      }
    }

    return Promise.all(files.map(async file => populateFile(file)))
  }

  function checkFiles(files) {
    const { allowedFileExts, maxSize } = appConfig.upload

    async function checkFile(file) {
      if (!allowedFileExts.includes(file.extension)) {
        throw httpErrors.conflict(
          `File '${file.originalname}' can't be uploaded: extension '${file.extension}' not allowed`
        )
      }

      const fileStats = await stat(file.filepath)
      const size = calcFileSize(fileStats.blksize, fileStats.blocks)
      if (size > maxSize) {
        throw httpErrors.conflict(
          `File '${file.filename}' can't be uploaded: size '${size}' exceed limits`
        )
      }
    }

    return Promise.all(files.map(file => checkFile(file)))
  }

  async function moveFiles(files, basePath) {
    await mkdir(basePath, { recursive: true })
    return Promise.all(
      files.map(file => moveFile(file.filepath, file.destPath))
    )
  }

  async function indexFiles(files, user) {
    async function indexFile(file, user, tx) {
      const { destPath, url, filename, extension, mimetype, size } = file
      const newFile = await tx.files.save({
        fullPath: destPath,
        url: encodeURI(url),
        fileName: filename,
        extension,
        mimetype,
        size,
        ownerId: user.id,
        category: CATEGORIES.ARTICLE_IMAGE,
      })

      return { id: newFile.id, url: newFile.url }
    }

    const filesData = await massive.withTransaction(async tx => {
      const fileData = await Promise.all(
        files.map(file => indexFile(file, user, tx))
      )
      return fileData
    })

    return filesData
  }
}
