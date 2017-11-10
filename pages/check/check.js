//index.js
const storage = require("../../utils/storage.js")
const AV = require("../../libs/av-weapp-min.js")
const util = require("../../utils/util");
const Promise = require('../../libs/es6-promise.min.js').Promise

//获取应用实例
const app = getApp()

const check = function (user, question, date, imageUrl) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '打卡中',
    })
    // update check
    let check = null;
    let rank = null;
    let checktime = 0;
    let longestAttendance = 0;
    storage.queryCheck(user, date).then((res) => {
      if (res === false) {
        check = new AV.Object("Check")
        check.set("user", user)
        check.set("question", question)
        check.set("date", new Date(date))
        check.set("image", imageUrl)
      } else {
        throw new Error("已打卡")
      }
      const lastcheckDate = user.get("lastcheckDate")
      if (lastcheckDate >= date - 86400003) {
        console.log("连续打卡")
        user.increment("longestAttendance", 1)
      } else {
        console.log("新打卡")
        user.set("longestAttendance", 1)
      }
      user.set("lastcheckDate", new Date(date))
      user.increment("checktime", 1)
      return storage.queryRank(user)
    }).then(res => {
      console.log("设置 Rank")
      if (res === false) {
        rank = new AV.Object("Rank")
        rank.set("user", user)
        rank.increment("times", 1)
      } else {
        rank = res
        rank.increment("times", 1)
      }
      return AV.Object.saveAll([user, rank, check])
    }).then(function () {
      console.log("打卡成功")
      wx.hideLoading()
      wx.showToast({
        title: '打卡成功',
        duration: 2000
      }) 
      longestAttendance = user.get("longestAttendance")
      checktime = user.get("checktime")
      resolve()
    }).catch((err) => { 
      wx.hideLoading()
      console.log(err);
      wx.showToast({
        title: '打卡失败',
        icon: 'loading',
        duration: 2000
      }) 
      reject();
      })
  })
}

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    checktime: 0,
    longestAttendance: 0,
    checked: true,
    checkable: false,
    imageFile: { uploaded: false, tempFilePath:"", url: ""}
  },

  checkTap: function () {
    const _thisPage = this
    check(app.globalData.user, app.globalData.question, util.dateToday(),_thisPage.data.imageFile.url).then(() => {
      _thisPage.setData({
        checked: true,
        checktime: app.globalData.user.attributes.checktime,
        longestAttendance: app.globalData.user.attributes.longestAttendance
      })
    })
  },

  uploadImage: function() {
    const _thisPage = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({title: '上传中'})
        const tempFilePath = res.tempFilePaths[0];
        new AV.File('file-name', {
          blob: {
            uri: tempFilePath,
          },
        }).save().then(
          file => {
            _thisPage.setData({
              imageFile: { 
                uploaded: true, 
                tempFilePath: tempFilePath,
                url: file.url()
                }
            })
            wx.hideLoading()
            wx.showToast({
              title:"上传成功"
            })
          }
          ).catch(function(err) {
            wx.hideLoading()
            wx.showToast({
              title: "上传失败",
              icon: "loading"
            })
            console.error(err)
          });
      }
    });
  },

  //事件处理函数
  bindViewTap: function () {
    if (this.data.checked) {
      wx.navigateTo({
        url: '../rank/rank'
      })
    }
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        checkable: app.globalData.checkable,
        hasUserInfo: true,
        longestAttendance: app.globalData.user.get("longestAttendance"),
        checktime: app.globalData.user.get("checktime")
      })

      // update userinfo
      const user = AV.User.current();
      user.set(app.globalData.userInfo).save().then(user => {
        // 成功，此时可在控制台中看到更新后的用户信息
        app.globalData.user = user;
      }).catch(console.error);
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })

          // update userinfo to user in callback
          const user = AV.User.current();
          user.set(res.userInfo).save().then(user => {
            // 成功，此时可在控制台中看到更新后的用户信息
            app.globalData.user = user;
            this.setData({
              longestAttendance: app.globalData.user.get("longestAttendance"),
              checktime: app.globalData.user.get("checktime")
            })
          }).catch(console.error);

        }
      })
    }

    // querycheck
    if (app.globalData.checkable === true) {
      storage.queryCheck(app.globalData.user, util.dateToday()).then((res) => {
        console.log(res)
        if (res === false) {
          app.globalData.checked = false
          this.setData({
            checked: false
          })
        } else {
          app.globalData.checked = true
          this.setData({
            checked: true
          })
        }
      })
    }
  },
})
