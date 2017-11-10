const AV = require("./libs/av-weapp-min.js")
const config = require("./utils/leancloud.config.js")
const storage = require("./utils/storage.js")
const util = require("./utils/util.js")

console.log('Init leancloud')

AV.init({
  appId: config.appId,
  appKey: config.appKey
});

//app.js
App({
  onLaunch: function () {
    const _this_app = this;
    // console.log(wx.getSystemInfoSync())
    // setup date
    const date = new Date()
    const date_today = util.dateToday()
    _this_app.globalData.date_today = date_today

    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    AV.User.loginWithWeapp().then(user => {
      _this_app.globalData.user = user;
      console.log("Login with weapp success")
    }).then(() => {
      wx.getUserInfo({
        success: res => {
          // 可以将 res 发送给后台解码出 unionId
          _this_app.globalData.userInfo = res.userInfo

          // TODO:同步用户信息到服务器

          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res)
          }
        }
      })
    }).catch(function(err) {
      wx.showToast({
        title: '失败',
        icon: 'failed',
        duration: 2000
      })
      console.log(err)
    })

    // Query question
    storage.queryQuestion(date_today).then(function (ques) {
      wx.showToast({
        title: "查询完成",
        icon: 'success',
        duration: 2000
      })
      if (ques !== false) {
        _this_app.globalData.question = ques
        _this_app.globalData.checkable = true
        if (_this_app.quesReadyCallback) {
          _this_app.quesReadyCallback(ques)
        }
      } else {
        console.log("Question of the day is unset");
      }
    }).catch(function(err) {
      console.log(err);
      wx.showModal({
        title: '获取问题失败',
        content: '请检查网络连接，下拉刷新重试',
        showCancel: false
      })
    })
  },

  globalData: {
    user: null,
    userInfo: null,
    checked: false,
    checkable: false,
    question: null,
    date_today: null,
  }
})