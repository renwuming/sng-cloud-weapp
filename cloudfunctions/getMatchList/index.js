const cloud = require('wx-server-sdk')

exports.main = async (event, context) => {
  const { env } = event
  cloud.init({
    env
  })
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()
  const list = await db
    .collection('matches')
    .where({
      _openid: OPENID
    })
    .get()
    .then(res => res.data)

  list.forEach(match => {
    const { sumTime, startTime } = match
    if (startTime) {
      const endTime = +startTime + sumTime * 60 * 1000
      const now = new Date().getTime()
      if (now > endTime) {
        match.end = true
      }
    }
  })

  return {
    newMatchList: list.filter(item => !item.end),
    historyMatchList: list.filter(item => item.end)
  }
}
