import S from 'fluent-json-schema'
import multer from 'fastify-multer'
import { tmpdir } from 'os'
import { join } from 'path'

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

  const { massive, config } = fastify

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
        200: S.object()
          .additionalProperties(false)
          .prop('urls', S.array().items(S.string().minLength(3)).minItems(1))
          .description('TODO')
          .required(),
      },
    },
    preHandler: upload.array('files', 12),
    handler: onUploadFile,
  })

  async function onUploadFile(req) {
    const { files, body, user } = req
    const { relativePath } = body

    //TODO creare funzione e lanciare in parallelo
    for (const file of files) {
      const fullPath = join(
        config.STATIC_FILES_DEST,
        relativePath,
        file.originalname
      )

      //TODO spostare file mediante streams e cancellare quello dentro /tmp

      await massive.files.save({
        fullPath,
        fileName: file.originalname,
        extension: file.originalname.split('.')[1], //TODO c'era un modo migliore
        ownerId: user.id,
        category: 'ARTICLE-IMAGE', //TODO fare enum
      })
    }

    return {
      urls: ['test', 'ciao'],
    }
  }
}
