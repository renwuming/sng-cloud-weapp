import Taro, { Component } from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import { AtButton, AtFab, AtSegmentedControl, AtCard } from "taro-ui";
import CallCloudFunction from "../../lib/CallCloudFunction";
import dayjs from "dayjs";
import "./index.scss";
import EmptyTip from "../../components/EmptyTip/index";

interface IState {
  tabIndex: number;
  newMatchList: Match[];
  historyMatchList: Match[];
}

export default class Index extends Component<any, IState> {
  state = {
    tabIndex: 0,
    newMatchList: [],
    historyMatchList: []
  };

  onShareAppMessage() {
    return {
      title: "德州扑克计时器",
      path: "/pages/index/index",
      imageUrl: "http://cdn.renwuming.cn/static/sng/share.jpg"
    };
  }

  componentDidShow() {
    this.initData();
  }

  initData = async () => {
    const data = await CallCloudFunction({
      name: "getMatchList"
    });
    this.setState(data);
  };

  changeTab = index => {
    this.setState({
      tabIndex: index
    });
    this.initData();
  };

  gotoCreate = () => {
    Taro.navigateTo({
      url: "/pages/create/index"
    });
  };

  gotoMatch = id => {
    Taro.navigateTo({
      url: `/pages/match/index?id=${id}`
    });
  };

  render() {
    const { tabIndex, newMatchList, historyMatchList } = this.state;
    return (
      <View className="container">
        <View className="top-tabs">
          <AtSegmentedControl
            className="tabs"
            values={["正在进行", "历史比赛"]}
            onClick={this.changeTab}
            current={tabIndex}
          />
        </View>
        {tabIndex === 0 &&
          (newMatchList.length > 0 ? (
            newMatchList.map(match => {
              const {
                name,
                updateTime,
                levelList,
                sumTime,
                start,
                startTime,
                own,
                _id
              } = match;
              const { sb, bb, ante } = (levelList as Level[])[0];
              return (
                <AtCard
                  onClick={this.gotoMatch.bind(null, _id)}
                  className={`match-card ${start ? "start" : ""}`}
                  extra={`${sumTime}分钟`}
                  note={own ? "我创建的" : "我参与的"}
                  title={name}
                >
                  {`比赛状态：${start ? "进行中" : "未开始"}`}
                  <View></View>
                  {`初始级别：${sb}/${bb}${ante ? `/${ante}` : ""}`}
                  <View></View>
                  {`升盲时间：${updateTime}分钟`}
                  {start && (
                    <View>
                      <View></View>
                      {`开始时间：${dayjs(startTime).format(
                        "YYYY-MM-DD HH:mm"
                      )}`}
                    </View>
                  )}
                </AtCard>
              );
            })
          ) : (
            <AtButton
              type="secondary"
              className="add-btn2"
              onClick={this.gotoCreate}
            >
              点击此处或右下角 + 创建一个比赛
            </AtButton>
          ))}
        {tabIndex === 1 &&
          (historyMatchList.length > 0 ? (
            historyMatchList.map(match => {
              const {
                name,
                updateTime,
                levelList,
                sumTime,
                startTime,
                own,
                _id
              } = match;
              const { sb, bb, ante } = (levelList as Level[])[0];
              return (
                <View>
                  <AtCard
                    onClick={this.gotoMatch.bind(null, _id)}
                    className="match-card end"
                    extra={`${sumTime}分钟`}
                    note={own ? "我创建的" : "我参与的"}
                    title={name}
                  >
                    {"比赛状态：已结束"}
                    <View></View>
                    {`初始级别：${sb}/${bb}${ante ? `/${ante}` : ""}`}
                    <View></View>
                    {`升盲时间：${updateTime}分钟`}
                    <View></View>
                    {`开始时间：${dayjs(startTime).format("YYYY-MM-DD HH:mm")}`}
                  </AtCard>
                </View>
              );
            })
          ) : (
            <EmptyTip></EmptyTip>
          ))}
        <View className="add-btn">
          <AtFab onClick={this.gotoCreate}>
            <Text className="at-fab__icon at-icon at-icon-add"></Text>
          </AtFab>
        </View>
        <View className="share-btn">
          <AtFab>
            <AtButton openType="share">
              <Text className="at-fab__icon at-icon at-icon-share-2"></Text>
            </AtButton>
          </AtFab>
        </View>
      </View>
    );
  }
}
