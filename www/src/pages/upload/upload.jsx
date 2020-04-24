import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Input } from '@tarojs/components'
import { AtProgress, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
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
      fileName: "",
      uploadProgress: 0,
      dialogVisible: false,
      deleteFileInput: false
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
          <View className="filenameTitle">
            <Text>选择文件名：</Text>
          </View>
          <View className="filenameShow">
            <Text>{this.state.fileName}</Text>
          </View>
          {
            this.state.deleteFileInput === true ? null : <Input type="file" style={{ display: "none" }} ref={this.fileRef} onChange={(e) => {
              console.log(e);
              this.setState({ chooseFile: e.target.files[0], fileName: e.target.files[0].name });
            }}></Input>
          }

        </View>
        <View className="uploadView">
          <View>
            <Button type="primary" onClick={() => {
              this.setState({ deleteFileInput: true }, () => {
                this.setState({ deleteFileInput: false }, () => {
                  setTimeout(() => {
                    this.fileRef.current.inputRef.click();
                  })
                })
              })
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
                          this.setState({ uploadProgress: 0, dialogVisible: false }, () => {
                            setTimeout(() => {
                              Taro.showToast({
                                title: `准备打印`,
                                icon: "success"
                              })
                            }, 40);
                          });
                        } else {
                          this.setState({ uploadProgress: 0, dialogVisible: false }, () => {
                            setTimeout(() => {
                              Taro.showToast({
                                title: `${json.message}`,
                                icon: "none"
                              })
                            }, 40)
                          })
                        }
                      }
                      xml.upload.onprogress = (e) => {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        this.setState({ uploadProgress: percent });
                      }
                      xml.upload.onloadstart = () => {
                        this.setState({ uploadProgress: 0, dialogVisible: true });
                      }
                      xml.onerror = () => {
                        this.setState({ dialogVisible: false, uploadProgress: 0 });
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
        <AtModal isOpened={this.state.dialogVisible} closeOnClickOverlay={false}>
          <AtModalContent className="costumDialog">
            <AtProgress percent={this.state.uploadProgress} color='#13CE66' />
          </AtModalContent>
          <AtModalAction></AtModalAction>
        </AtModal>
      </View>
    )
  }
}
