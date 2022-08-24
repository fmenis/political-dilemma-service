import S from 'fluent-json-schema'
import multer from 'fastify-multer'
import { tmpdir } from 'os'
import { join, extname } from 'path'
import { stat, mkdir } from 'fs/promises'

import { CATEGORIES } from './lib/enums.js'
import { calcFileSize, deleteFiles, moveFile } from './lib/utils.js'
import { appConfig } from '../../config/main.js'
import { calculateBaseUrl } from '../../utils/main.js'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpdir())
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

//TODO testare con più file transazioni e cancellazione file
export default async function uploadFile(fastify) {
  fastify.register(multer.contentParser)

  const { massive, config, httpErrors } = fastify

  fastify.route({
    method: 'POST',
    path: '/upload',
    config: {
      public: false,
      // permission: 'file:delete', //TODO
    },
    schema: {
      summary: 'Upload files',
      description: 'Upload files.',
      //TODO capire come fare validazione body
      response: {
        200: S.array()
          .items(
            S.object()
              .additionalProperties(false)
              .prop(
                'id',
                S.string().format('uuid').description('File id').required()
              )
              .prop(
                'url',
                S.string().format('uri').description('File url').required()
              )
          )
          .minItems(1),
      },
    },
    preHandler: upload.array('files', 10),
    handler: onUploadFile,
  })

  async function onUploadFile(req) {
    const { files, user } = req
    const basePath = join(config.STATIC_FILES_DEST, 'articles/images')

    try {
      const populatedFiles = await populateFiles(files, basePath)

      await checkFiles(populatedFiles)

      await moveFiles(populatedFiles, basePath)

      const urls = await indexFiles(populatedFiles, user)

      return urls
    } finally {
      // delete tmp files in any case
      await deleteFiles(files.map(file => file.path))
    }
  }

  function populateFiles(files, basePath) {
    async function populateFile(file) {
      const fileStats = await stat(file.path)
      return {
        ...file,
        destPath: join(basePath, file.originalname),
        extension: extname(file.originalname).slice(1),
        size: calcFileSize(fileStats.blksize, fileStats.blocks),
        url: `${calculateBaseUrl({
          excludePort: true,
        })}/politicaldilemma/static/articles/images/${file.originalname}`,
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

      const fileStats = await stat(file.path)
      const size = calcFileSize(fileStats.blksize, fileStats.blocks)
      if (size > maxSize) {
        throw httpErrors.conflict(
          `File '${file.originalname}' can't be uploaded: size '${size}' exceed limits`
        )
      }
    }

    return Promise.all(files.map(file => checkFile(file)))
  }

  async function moveFiles(files, basePath) {
    await mkdir(basePath, { recursive: true })
    return Promise.all(files.map(file => moveFile(file.path, file.destPath)))
  }

  async function indexFiles(files, user) {
    async function indexFile(file, user, tx) {
      const newFile = await tx.files.save({
        fullPath: file.destPath,
        url: file.url,
        fileName: file.originalname,
        extension: file.extension,
        mimetype: file.mimetype,
        size: file.size,
        ownerId: user.id,
        category: CATEGORIES.ARTICLE_IMAGE,
      })

      return { id: newFile.id, url: file.url }
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
