const { Firestore } = require('@google-cloud/firestore')

const store = (data) => {
  const doc = new Firestore().doc('analysis/sostenes')
  return doc.set(data)
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.producer = async (req, res) => {
  const status = req.query.status || req.body.status || ''

  try {
    const doc = await store({ status });
    res.status(200).json(doc)
  } catch (error) {

    res.status(400).send(error.message)
  }

}
