import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Input } from '@tarojs/components'
import './upload.scss'
import { apiUrl } from "../../assets/url";

export default class Upload extends Component {

  config = {
    navigationBarTitleText: '打印'
  }

  constructor(props) {
    super(props);
    this.state = {
      chooseFile: null,
      fileName: ""
    }
    this.fileRef = Taro.createRef();
  }

  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    return (
      <View className='upload'>
        <View className="subTitle">
          <View>
            <Text>选择文件名：</Text>
          </View>
          <View>
            <Text>{this.state.fileName}</Text>
          </View>
          <Input type="file" style={{ display: "none" }} ref={this.fileRef} onChange={(e) => {
            console.log(e);
            this.setState({ chooseFile: e.target.files[0], fileName: e.target.files[0].name });
          }}></Input>
        </View>
        <View className="uploadView">
          <View>
            <Button plain type="primary" onClick={() => {
              this.fileRef.current.inputRef.click();
            }}>上传文件</Button>
          </View>
          <View className="confirmPrintView">
            <Button type="primary" onClick={(e) => {
              if (this.state.filePath !== "") {
                Taro.getStorage({
                  key: "token",
                  success: (token) => {
                    if (token.errMsg === "getStorage:ok") {
                      var formData = new FormData();
                      formData.append("file", this.state.chooseFile);
                      formData.append("openid", token.data);
                      formData.append("original_name", this.state.fileName);
                      var xml = new XMLHttpRequest();
                      xml.onload = (e) => {
                        console.log(e);
                        var json = JSON.parse(e.currentTarget.responseText);
                        if (json.state === "success") {
                          Taro.showToast({
                            title: `准备打印`,
                            icon: "success"
                          })
                        } else {
                          Taro.showToast({
                            title: `${json.message}`,
                            icon: "none"
                          })
                        }
                      }
                      xml.open("POST", `${apiUrl}/upload`, true);
                      xml.send(formData);
                    } else {
                      Taro.showToast({
                        title: `身份获取失败`,
                        icon: "none"
                      })
                    }
                  },
                  fail: () => {
                    Taro.showToast({
                      title: `身份获取失败`,
                      icon: "none"
                    });
                    setTimeout(() => {
                      Taro.redirectTo({
                        url: '/pages/index/index'
                      })
                    }, 1000);
                  }
                })
              }
            }}>确认打印</Button>
          </View>
        </View>
      </View>
    )
  }
}
