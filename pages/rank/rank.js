const storage = require("../../utils/storage.js")

const loadingRankData = function(res, _this_page) {
  let users = []
  res.forEach((rank) => {
    const user = rank.get("user")
    const nickname = user.get("nickName")
    const avatarUrl = user.get("avatarUrl")
    const times = rank.get("times")
    users.push({ nickName: nickname, avatarUrl: avatarUrl, times: times })
  })
  _this_page.setData({
    users: users
  })
}

// pages/rank/rank.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    users: [{
      nickName: "wild-flame",
      avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83epwO7nM7ShxZuLzcHic2ra38tkVcVOYlmP1ETITEaLhjUqYvLeEzrslPuNnibibAibhBgdxTbdq5iax8bg/0",
      times: 5
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    const _this = this
      storage.queryRankAll().then(res=> {
        loadingRankData(res, _this)
      }).catch(console.log)
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
    const _this = this
    storage.queryRankAll().then(res => {
      wx.stopPullDownRefresh()
      loadingRankData(res, _this)
    }).catch(console.log)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})