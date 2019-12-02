const cloud = require("wx-server-sdk");

exports.main = async (event, context) => {
  const { env } = event;
  cloud.init({
    env
  });
  const { OPENID } = cloud.getWXContext();
  const db = cloud.database();
  const list = await db
    .collection("matches")
    .where({
      players: OPENID
    })
    .get()
    .then(res => res.data);

  list.forEach(match => {
    const { sumTime, startTime, _openid } = match;
    match.own = _openid === OPENID;
    if (startTime) {
      const endTime = +startTime + sumTime * 60 * 1000;
      const now = new Date().getTime();
      if (now > endTime) {
        match.end = true;
        match.endTime = endTime;
      }
    }
  });

  const newMatchList = list
    .filter(item => !item.end)
    .sort((a, b) => {
      if (a.startTime && b.startTime) {
        return b.startTime - a.startTime;
      }
      if (!a.startTime && !b.startTime) {
        return b.createTime - a.createTime;
      }
      return +b.startTime;
    });

  const historyMatchList = list
    .filter(item => item.end)
    .sort((a, b) => {
      return b.endTime - a.endTime;
    });

  return {
    newMatchList,
    historyMatchList
  };
};
