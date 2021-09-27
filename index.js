const { Firestore } = require('@google-cloud/firestore')
const { Translate } = require('@google-cloud/translate').v2
const { Storage } = require('@google-cloud/storage')
const { BUCKET_NAME } = process.env

/**
 * Retrieve an authenticated url with permission to upload a file.
 * This url should requested from PUT method
 *
 * @param {string} fileName
 * @return {*} 
 */
const getUploadUrl = async (fileName) => {
  const [url] = await new Storage()
    .bucket(BUCKET_NAME)
    .file(fileName)
    .getSignedUrl({
      expires: Date.now() + 1000 * 60,
      action: 'write',
      version: 'v4'
    })

  return url

}

const storeFile = async (file, fileName) => {
  const bucket = new Storage({
    // credentials: require('./credentials.json')
  }).bucket(BUCKET_NAME)

  const [savedFile] = await bucket.upload(file, {
    destination: fileName,
  })

  return {
    url: savedFile.publicUrl(),
    signedUrl
  }
}

const store = async (data) => {
  const doc = new Firestore().doc('data/texts')
  await doc.set(data);
  return (await doc.get()).data()
}

const translate = async (text) => {
  const [translation] = await new Translate().translate(text, 'pt')
  return translation
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.producer = async (req, res) => {
  const text = req.query.text || req.body.text || ''

  try {
    const translation = await translate(text)
    // const file = await storeFile('./document.txt', 'document.txt')
    const uploadUrl = await getUploadUrl(req.body.fileName)
    const doc = await store({
      text,
      translation,
      uploadUrl
    })
    res.status(200).json(doc)
  } catch (error) {
    res.status(400).send(error.message)
  }
}
