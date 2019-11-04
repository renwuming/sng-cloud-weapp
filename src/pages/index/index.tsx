import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton, AtFab, AtSegmentedControl, AtCard } from 'taro-ui'
import CallCloudFunction from '../../lib/CallCloudFunction'
import dayjs from 'dayjs'
import './index.scss'

interface IState {
  tabIndex: number
  newMatchList: Match[]
  historyMatchList: Match[]
}

export default class Index extends Component<any, IState> {
  state = {
    tabIndex: 0,
    newMatchList: [],
    historyMatchList: []
  }

  onShareAppMessage() {
    return {
      title: '德州扑克计时器',
      path: '/pages/index/index',
      imageUrl: 'http://cdn.renwuming.cn/static/sng/share.jpg'
    }
  }

  componentDidShow() {
    this.initData()
  }

  initData = async () => {
    const data = await CallCloudFunction({
      name: 'getMatchList'
    })
    this.setState(data)
  }

  changeTab = index => {
    this.setState({
      tabIndex: index
    })
    this.initData()
  }

  gotoCreate = () => {
    Taro.navigateTo({
      url: '/pages/create/index'
    })
  }

  gotoMatch = id => {
    Taro.navigateTo({
      url: `/pages/match/index?id=${id}`
    })
  }

  render() {
    const { tabIndex, newMatchList, historyMatchList } = this.state
    return (
      <View className="container">
        <AtSegmentedControl
          className="tabs"
          values={['正在进行', '历史比赛']}
          onClick={this.changeTab}
          current={tabIndex}
        />
        {tabIndex === 0 &&
          newMatchList.map(match => {
            const {
              name,
              updateTime,
              levelList,
              sumTime,
              start,
              startTime,
              _id
            } = match
            const { sb, bb, ante } = (levelList as Level[])[0]
            return (
              <AtCard
                onClick={this.gotoMatch.bind(null, _id)}
                className="match-card"
                extra={`${sumTime}分钟`}
                note={start ? '进行中' : '未开始'}
                title={name}
              >
                {`初始级别：${sb}/${bb}${ante ? `/${ante}` : ''}`}
                <View></View>
                {`升盲时间：${updateTime}分钟`}
                {start && (
                  <View>
                    <View></View>
                    {`开始时间：${dayjs(startTime).format('YYYY-MM-DD HH:mm')}`}
                  </View>
                )}
              </AtCard>
            )
          })}
        {tabIndex === 1 &&
          historyMatchList.map(match => {
            const {
              name,
              updateTime,
              levelList,
              sumTime,
              startTime,
              _id
            } = match
            const { sb, bb, ante } = (levelList as Level[])[0]
            return (
              <View>
                <AtCard
                  onClick={this.gotoMatch.bind(null, _id)}
                  className="match-card"
                  extra={`${sumTime}分钟`}
                  note="已结束"
                  title={name}
                >
                  {`初始级别：${sb}/${bb}${ante ? `/${ante}` : ''}`}
                  <View></View>
                  {`升盲时间：${updateTime}分钟`}
                  <View></View>
                  {`开始时间：${dayjs(startTime).format('YYYY-MM-DD HH:mm')}`}
                </AtCard>
              </View>
            )
          })}
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
    )
  }
}
