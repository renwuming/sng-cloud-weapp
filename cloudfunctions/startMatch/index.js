const cloud = require('wx-server-sdk')

exports.main = async (event, context) => {
  const { env, id } = event
  cloud.init({
    env
  })
  const db = cloud.database()
  const startTime = new Date()
  const matchData = await db
    .collection('matches')
    .doc(id)
    .update({
      data: {
        start: true,
        startTime
      }
    })

  return null
}
