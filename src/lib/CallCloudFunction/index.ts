import Taro from '@tarojs/taro'
const CLOUD_ENV = process.env.CLOUD_ENV
export default function CallCloudFunction(params) {
  if (params.data) {
    params.data.env = CLOUD_ENV
  } else {
    params.data = {
      env: CLOUD_ENV
    }
  }
  Taro.cloud.init({
    env: CLOUD_ENV
  })
  return Taro.cloud.callFunction(params).then(res => res.result)
}
