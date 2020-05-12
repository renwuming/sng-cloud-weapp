// 云函数入口文件
const cloud = require("wx-server-sdk");

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { env, match } = event;
  cloud.init({
    env
  });
  const db = cloud.database();

  const res = await db.collection("matches").add({
    data: {
      ...match,
      players: [OPENID]
    }
  })

  return res;
};
