import Taro, { Component } from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import "./index.scss";

export default class Index extends Component {
  render() {
    return (
      <View className="empty-box">
        <Image
          className="empty-img"
          src="http://cdn.renwuming.cn/static/sng/empty.png"
        ></Image>
        <Text>点击右下角 + 创建一个比赛</Text>
      </View>
    );
  }
}
