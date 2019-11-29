const cloud = require("wx-server-sdk");

function getDetailData(data) {
  const { OPENID } = cloud.getWXContext();
  const { start, levelList, updateTime, startTime, _id, _openid } = data;
  const levelTime = updateTime * 60;
  let currentLevelIndex = 0;
  let nextLevelIndex = 1;
  let timer = 0;
  let end = false;
  if (start) {
    const now = new Date();
    const pastTime = Math.floor((now - startTime) / 1000);
    currentLevelIndex = Math.floor(pastTime / levelTime);
    if (currentLevelIndex < levelList.length) {
      timer = levelTime - Math.floor(pastTime % levelTime);
    } else {
      currentLevelIndex = levelList.length - 1;
      end = true;
    }
    nextLevelIndex = currentLevelIndex + 1;
  } else {
    timer = levelTime;
  }

  return {
    timer,
    end,
    currentLevelIndex,
    currentLevel: levelList[currentLevelIndex],
    nextLevel: levelList[nextLevelIndex] || null,
    own: OPENID === _openid
  };
}

function formatTimer(timer) {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  return `${minutes >= 10 ? minutes : `0${minutes}`} : ${
    seconds >= 10 ? seconds : `0${seconds}`
  }`;
}

async function updateMatchData(id, data) {
  const db = cloud.database();
  await db
    .collection("matches")
    .doc(id)
    .update({
      data
    });
}

exports.main = async (event, context) => {
  const { env, id } = event;
  cloud.init({
    env
  });
  const db = cloud.database();
  const matchData = await db
    .collection("matches")
    .doc(id)
    .get()
    .then(res => res.data);

  const detail = getDetailData(matchData);

  return Object.assign({}, matchData, detail);
};
