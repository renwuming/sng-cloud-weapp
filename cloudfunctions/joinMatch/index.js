const cloud = require("wx-server-sdk");

exports.main = async (event, context) => {
  const { env, id } = event;
  cloud.init({
    env
  });
  const { OPENID } = cloud.getWXContext();
  const db = cloud.database();

  // 先查找原有比赛数据
  const matchData = await db
    .collection("matches")
    .doc(id)
    .get()
    .then(res => res.data);

  const { players } = matchData;

  // 更新players
  if (!players.includes(OPENID)) {
    players.push(OPENID);
  }
  await db
    .collection("matches")
    .doc(id)
    .update({
      data: {
        players
      }
    });

  return null;
};
