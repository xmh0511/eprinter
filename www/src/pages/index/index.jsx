import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Input } from '@tarojs/components'
import { AtForm, AtInput, AtButton } from 'taro-ui'
import './index.scss'
import { apiUrl } from "../../assets/url";
export default class Index extends Component {

  config = {
    navigationBarTitleText: '授权'
  }

  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      passWord: ""
    }
  }

  componentWillMount() { }

  componentDidMount() {
    Taro.getStorage({
      key: "token",
      success: (res) => {
        console.log(res);
        if (res.errMsg === "getStorage:ok") {
          Taro.request({
            url: `${apiUrl}/check`,
            data: JSON.stringify({ "openid": res.data }),
            method: "POST",
            success: (res) => {
              console.log(res);
              if (res.data.state === "success") {
                Taro.redirectTo({
                  url: '/pages/upload/upload'
                })
              } else {
                console.log(res.data.message);
              }
            }
          })
        }
      }
    })
  }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    return (
      <View className='index'>
        <View className="FormGroup">
          <View className="FormItem">
            <View className="FormLabel">
              <Text>用户名:</Text>
            </View>
            <View>
              <Input className="mycustomInput" type='text' placeholder='用户' onChange={(e) => {
                this.setState({ userName: e.detail.value  });
              }} />
            </View>
          </View>
          <View className="FormItem">
            <View className="FormLabel">
              <Text>密码:</Text>
            </View>
            <View>
              <Input className="mycustomInput" type='password' placeholder='密码' onChange={(e) => {
                this.setState({ passWord: e.detail.value });
              }} />
            </View>
          </View>

          <View className="getInfoButtonView">
            <Button plain type='primary' onClick={(e) => {
              console.log(e);
              var json = {
                userName: this.state.userName,
                passWord: this.state.passWord
              }
              Taro.request({
                url: `${apiUrl}/login`,
                method: "POST",
                data: JSON.stringify(json),
                success: (res) => {
                  console.log(res);
                  if (res.data.state === "success") {
                    Taro.setStorage({
                      key: "token",
                      data: `${res.data.message}`
                    }).then(() => {
                      Taro.redirectTo({
                        url: '/pages/upload/upload'
                      })
                    })
                  } else {
                    Taro.showToast({
                      title: `${res.data.message}`,
                      icon: 'none',
                      duration: 2000
                    })
                  }
                }
              })
            }}>授权使用</Button>
          </View>
        </View>
      </View>
    )
  }
}
