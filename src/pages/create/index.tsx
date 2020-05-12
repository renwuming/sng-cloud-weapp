import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Picker } from "@tarojs/components";
import {
  AtInput,
  AtIcon,
  AtMessage,
  AtButton,
  AtList,
  AtListItem,
  AtSwitch,
} from "taro-ui";
import "./index.scss";
import CallCloudFunction from "../../lib/CallCloudFunction";

interface IState {
  name: string;
  updateTime: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  levelList: Level[];
  sameBB: boolean;
}

export default class Index extends Component<any, IState> {
  // 升盲时间list
  updateTimeList = [5, 10, 15, 20, 25, 30];

  config: Config = {
    navigationBarTitleText: "创建比赛",
  };
  state = {
    name: "",
    updateTime: 0,
    smallBlind: 0,
    bigBlind: 0,
    ante: 0,
    levelList: [],
    sameBB: false,
  };
  handlename = (value) => {
    this.setState({
      name: value,
    });
    return value;
  };
  handleSmallBlind = (value) => {
    if (isNaN(value)) {
      return 0;
    }
    const { sameBB } = this.state;
    this.setState({
      smallBlind: +value,
      bigBlind: sameBB ? value : value * 2,
    });
    return value;
  };
  handleAnte = (value) => {
    if (isNaN(value)) {
      return 0;
    }
    this.setState({
      ante: +value,
    });
    return value;
  };

  onUpdateTimeChange = (e) => {
    const { updateTimeList } = this;
    this.setState({
      updateTime: updateTimeList[e.detail.value],
    });
  };

  addLevel = () => {
    const { smallBlind, bigBlind, ante, levelList } = this.state;
    if (smallBlind <= 0) {
      Taro.atMessage({
        message: "小盲不能为0",
        type: "warning",
      });
      return;
    }
    const level = levelList.length + 1;
    (levelList as Array<Level>).push({
      level,
      sb: smallBlind,
      bb: bigBlind,
      ante,
    });
    this.setState({
      levelList,
    });
    setTimeout(() => {
      this.setState({
        smallBlind: 0,
        bigBlind: 0,
        ante: 0,
      });
    }, 100);
  };

  getSumTime = () => {
    const { updateTime, levelList } = this.state;
    return updateTime * levelList.length;
  };

  deleteLevel = (index) => {
    const { levelList } = this.state;
    levelList.splice(index, 1);
    levelList.forEach((item, index) => {
      (item as Level).level = index + 1;
    });
    this.setState({
      levelList,
    });
  };

  submit = async () => {
    const { name, updateTime, levelList } = this.state;
    const createTime = new Date();
    if (!name) {
      Taro.atMessage({
        message: "比赛名称不能为空",
        type: "warning",
      });
      return;
    }
    if (updateTime <= 0) {
      Taro.atMessage({
        message: "升盲时间不能为0",
        type: "warning",
      });
      return;
    }
    if (levelList.length < 1) {
      Taro.atMessage({
        message: "至少添加一个盲注级别",
        type: "warning",
      });
      return;
    }
    // 创建比赛
    await CallCloudFunction({
      name: "createMatch",
      data: {
        match: {
          name,
          updateTime,
          levelList,
          sumTime: this.getSumTime(),
          start: false,
          createTime,
        },
      },
    });

    Taro.navigateBack();
  };

  render() {
    const {
      name,
      updateTime,
      smallBlind,
      bigBlind,
      ante,
      levelList,
      sameBB,
    } = this.state;
    const { updateTimeList } = this;
    return (
      <View className="container">
        <AtMessage />
        <AtList className="title">
          <AtListItem title="基本信息" />
        </AtList>
        <AtInput
          name="name"
          title="比赛名称"
          type="text"
          placeholder="输入名称"
          value={name}
          onChange={this.handlename}
        />
        <Picker
          mode="selector"
          onChange={this.onUpdateTimeChange}
          range={updateTimeList}
          value={0}
        >
          <AtInput
            className="show no-bottom-border"
            editable={false}
            name="updateTime"
            title="升盲时间"
            type="text"
            placeholder="选择时间"
            value={updateTime}
            onChange={() => {}}
          >
            <Text className="form-right">分钟</Text>
          </AtInput>
        </Picker>
        <AtList className="title">
          <AtListItem title="盲注级别" />
        </AtList>
        <AtInput
          name="smallBlind"
          title="小盲"
          type="number"
          placeholder="输入小盲"
          value={smallBlind}
          onChange={this.handleSmallBlind}
        />
        <AtInput
          editable={false}
          name="bigBlind"
          title="大盲"
          type="number"
          value={bigBlind}
          onChange={() => {}}
        ></AtInput>
        <AtSwitch
          className="form-right2"
          title="大盲与小盲相同"
          checked={sameBB}
          onChange={() => {
            const { smallBlind } = this.state;
            const newSameBB = !sameBB;
            const bigBlind = newSameBB ? smallBlind : smallBlind * 2;
            this.setState({
              sameBB: !sameBB,
              bigBlind,
            });
          }}
        />
        <AtInput
          className="no-bottom-border"
          name="ante"
          title="ante"
          type="number"
          placeholder="输入ante"
          value={ante}
          onChange={this.handleAnte}
        />
        <AtButton
          circle
          className="add-level-btn"
          type="secondary"
          onClick={this.addLevel}
        >
          添加盲注级别
        </AtButton>
        <View className="level-list">
          <View className="level-line top">
            <Text className="level">级别</Text>
            <Text className="sb">小盲</Text>
            <Text className="bb">大盲</Text>
            <Text className="ante">ante</Text>
            <Text className="delete-btn"></Text>
          </View>
          {levelList.map((item, index) => {
            const { level, sb, bb } = item;
            return (
              <View className="level-line">
                <Text className="level">({level})</Text>
                <Text className="sb">{sb}</Text>
                <Text className="bb">{bb}</Text>
                <Text className="ante">{(item as Level).ante}</Text>
                <AtIcon
                  className="delete-btn"
                  onClick={this.deleteLevel.bind(null, index)}
                  value="subtract-circle"
                  size="25"
                  color="#D81E06"
                ></AtIcon>
              </View>
            );
          })}
        </View>
        <AtList className="title sum-time">
          <AtListItem
            title="比赛总时长"
            extraText={`${this.getSumTime()}分钟`}
          />
        </AtList>

        <AtButton
          circle
          className="submit-btn"
          type="primary"
          onClick={this.submit}
        >
          创建比赛
        </AtButton>
      </View>
    );
  }
}
