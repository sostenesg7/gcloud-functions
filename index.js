const { Firestore } = require('@google-cloud/firestore')
const { Translate } = require('@google-cloud/translate').v2

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
    const doc = await store({ text, translation })
    res.status(200).json(doc)
  } catch (error) {

    res.status(400).send(error.message)
  }

}
