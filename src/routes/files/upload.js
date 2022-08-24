import S from 'fluent-json-schema'
import multer from 'fastify-multer'
import { tmpdir } from 'os'
import { join, extname } from 'path'
import { stat } from 'fs/promises'

import { CATEGORIES } from './lib/enums.js'
import { calcFileSize, deleteFiles } from './lib/utils.js'
import { appConfig } from '../../config/main.js'
import { calculateBaseUrl } from '../../utils/main.js'

//##TODO fare utility di check STATIC_FILES_DEST e creazione directoty recusive

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpdir())
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

export default async function uploadFile(fastify) {
  fastify.register(multer.contentParser)

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
      //TODO capire come fare validazione
      // body: S.object()
      //   .additionalProperties(false)
      //   .prop('relativePath', S.string().minLength(3).maxLength(200))
      //   .description('TODO')
      //   .required(),
      response: {
        // 200: S.object() //TODO
        //   .additionalProperties(false)
        //   .prop('urls', S.array().items(S.string().minLength(3)).minItems(1))
        //   .description('TODO')
        //   .required(),
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
    preHandler: upload.array('files', 12),
    handler: onUploadFile,
  })

  async function onUploadFile(req) {
    const { body, files, user } = req
    const { relativePath } = body

    const populatedFiles = await populateFiles(files, relativePath)

    await checkFiles(populatedFiles)

    // await moveFiles(populatedFiles)

    const urls = await indexFiles(populatedFiles, user)

    return urls
  }

  function populateFiles(files, relativePath) {
    async function populateFile(file) {
      const fileStats = await stat(file.path)
      return {
        ...file,
        realPath: join(
          config.STATIC_FILES_DEST,
          relativePath,
          file.originalname
        ),
        extension: extname(file.originalname).slice(1),
        size: calcFileSize(fileStats.blksize, fileStats.blocks),
        url: `${calculateBaseUrl()}/static/images/articles/${
          file.originalname
        }`,
      }
    }

    return Promise.all(files.map(async file => populateFile(file)))
  }

  async function checkFiles(files) {
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

    try {
      await Promise.all(files.map(file => checkFile(file)))
    } catch (error) {
      // delete all uploaded files
      // TODO capire dov'è meglio metterlo
      await deleteFiles(files.map(file => file.path))
    }
  }

  // async function moveFiles(files) {
  //   return true //TODO
  // }

  async function indexFiles(files, user) {
    async function indexFile(file, user, tx) {
      const newFile = await tx.files.save({
        fullPath: file.realPath,
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
