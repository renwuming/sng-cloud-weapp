import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { AtButton, AtIcon, AtFloatLayout } from "taro-ui";
import CallCloudFunction from "../../lib/CallCloudFunction";
import dayjs from "dayjs";
import "./index.scss";

interface IState {
  matchData: Match | {};
  showDetail: boolean;
}

export default class Index extends Component<any, IState> {
  config: Config = {
    navigationBarBackgroundColor: "#000",
    navigationBarTextStyle: "white"
  };
  countTimer: any;
  initTimer: any;

  state = {
    matchData: {
      start: true
    },
    showDetail: false
  };

  formatTimer = timer => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return (
      `${minutes >= 10 ? minutes : "0" + minutes}` +
      ` : ${seconds >= 10 ? seconds : "0" + seconds}`
    );
  };

  onShareAppMessage() {
    const { id } = this.$router.params;
    const { matchData } = this.state;
    const { name } = matchData as Match;
    return {
      title: name ? `${name} 正在进行!` : "德州扑克计时器",
      path: `/pages/match/index?id=${id}`,
      imageUrl: "http://cdn.renwuming.cn/static/sng/share.jpg"
    };
  }

  componentDidShow() {
    this.initData();
    this.countTimer = setInterval(() => {
      const { matchData } = this.state;
      let { timer, end, start } = matchData as Match;
      if (!start) {
        this.initData();
        return;
      }
      if (timer === 0 && !end) {
        this.initData();
      } else if (timer) {
        timer--;
        (matchData as Match).timer = timer;
        this.setState({
          matchData
        });
      }
    }, 1000);

    this.initTimer = setInterval(() => {
      const { matchData } = this.state;
      const { end } = matchData as Match;
      if (!end) {
        this.initData();
      }
    }, 30 * 1000);
  }

  componentDidHide() {
    clearInterval(this.countTimer);
    clearInterval(this.initTimer);
  }
  componentWillUnmount() {
    clearInterval(this.countTimer);
    clearInterval(this.initTimer);
  }

  initData = async () => {
    const { id } = this.$router.params;
    const matchData = await CallCloudFunction({
      name: "getMatchData",
      data: {
        id
      }
    });
    this.setState({
      matchData
    });
    // 加入比赛
    this.joinMatch(matchData);
    // 修改title为比赛名
    const { name } = matchData;
    Taro.setNavigationBarTitle({
      title: name
    });
  };

  // 加入比赛
  async joinMatch(matchData) {
    const { own, _id } = matchData;
    if (!own) {
      await CallCloudFunction({
        name: "joinMatch",
        data: {
          id: _id
        }
      });
    }
  }

  startMatch = async () => {
    const { id } = this.$router.params;
    await CallCloudFunction({
      name: "startMatch",
      data: {
        id
      }
    });
    this.initData();
  };

  showDetail = () => {
    this.setState({
      showDetail: true
    });
  };
  hideDetail = () => {
    this.setState({
      showDetail: false
    });
  };

  render() {
    const { matchData, showDetail } = this.state;
    const {
      name,
      updateTime,
      sumTime,
      currentLevel,
      currentLevelIndex,
      nextLevel,
      start,
      timer,
      startTime,
      levelList,
      end,
      own
    } = matchData as Match;
    return (
      <View className="container">
        <View className="top-line">
          <AtButton openType="share">
            <AtIcon value="share-2" size="24" color="#fff"></AtIcon>
          </AtButton>
          <AtButton onClick={this.showDetail}>
            <AtIcon value="list" size="24" color="#fff"></AtIcon>
          </AtButton>
        </View>
        <View className={`line ${timer < 60 ? "warning" : ""}`}>
          <Text className="timer">
            {isNaN(timer) ? "" : this.formatTimer(timer)}
          </Text>
        </View>
        <View className="line main">
          <Text className="level">
            {currentLevel.sb} / {currentLevel.bb}
            {currentLevel.ante ? ` / ${currentLevel.ante}` : ""}
          </Text>
        </View>
        <View className="line next">
          {nextLevel && nextLevel.sb && (
            <Text className="level next-level">
              下一级别盲注：{nextLevel.sb} / {nextLevel.bb}
              {nextLevel.ante ? ` / ${nextLevel.ante}` : ""}
            </Text>
          )}
          {end && <Text className="level next-level">已结束</Text>}
        </View>

        {!start && own && (
          <AtButton
            circle
            className="start-btn"
            type="secondary"
            onClick={this.startMatch}
          >
            开始
          </AtButton>
        )}

        {startTime && !end && (
          <View className="line next">
            <Text className="level tip-text">
              开始时间：{dayjs(startTime).format("YYYY-MM-DD HH:mm")}
            </Text>
          </View>
        )}

        <AtFloatLayout
          isOpened={showDetail}
          onClose={this.hideDetail}
          title={name}
        >
          <View className="info-box">
            <View className="level-line">
              <Text className="left">比赛名称</Text>
              <Text className="right">{name}</Text>
            </View>
            {startTime && (
              <View className="level-line">
                <Text className="left">开始时间</Text>
                <Text className="right">
                  {dayjs(startTime).format("YYYY-MM-DD HH:mm")}
                </Text>
              </View>
            )}
            <View className="level-line">
              <Text className="left">升盲时间</Text>
              <Text className="right">{`${updateTime}分钟`}</Text>
            </View>
            <View className="level-line">
              <Text className="left">比赛总时长</Text>
              <Text className="right">{`${sumTime}分钟`}</Text>
            </View>
          </View>
          <View className="info-box">
            <View className="level-line">
              <Text className="level-index">级别</Text>
              <Text className="sb">小盲</Text>
              <Text className="bb">大盲</Text>
              <Text className="ante">ante</Text>
            </View>
            {levelList &&
              levelList.map((item, index) => {
                const { level, sb, bb } = item;
                return (
                  <View
                    className={`level-line ${
                      currentLevelIndex === index && start && !end
                        ? "active"
                        : ""
                    }`}
                  >
                    <Text className="level-index">({level})</Text>
                    <Text className="sb">{sb}</Text>
                    <Text className="bb">{bb}</Text>
                    <Text className="ante">{item.ante ? item.ante : ""}</Text>
                  </View>
                );
              })}
          </View>
        </AtFloatLayout>
      </View>
    );
  }
}
