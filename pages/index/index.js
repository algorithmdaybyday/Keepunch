const util = require("../../utils/util");
const dateFormat = require("../../utils/date_format")
const storage = require("../../utils/storage")
const app = getApp();

// pages/check/check.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    question_of_the_day: {
      title: "Question of the Day is not ready yet",
       url:""},
    checkable: false,
    date: "Oct.00 2000"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const now = new Date()
    this.setData({
      date: now.format("dd mmm. yyyy")
    })
    if (app.globalData.question !== null) {
      this.setData({
        question_of_the_day: app.globalData.question.attributes,
        checkable: true
      })
      console.log("setdata")
    } else {
      app.quesReadyCallback = ques => {
        this.setData({
          question_of_the_day: ques.attributes,
          checkable: true
        })
        app.globalData.checkable = true
        console.log("callback")
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    storage.queryQuestion(util.dateToday()).then(function (ques) {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: "查询完成",
        icon: 'success',
        duration: 2000
      })
      if (ques !== false) {
        app.globalData.question = ques
        app.globalData.checkable = true
        if (app.quesReadyCallback) {
          app.quesReadyCallback(ques)
        }
      } else {
        console.log("Question of the day is unset");
      }
    }).catch(function (err) {
      console.log(err);
      wx.stopPullDownRefresh()
      wx.showToast({
        title: "获取问题失败",
        icon: 'loading',
        duration: 2000,
      })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  bindCheckTap: function () {
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        app.globalData.userInfo = res.userInfo
        wx.navigateTo({
          url: '../check/check'
        })
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})