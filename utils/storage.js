var AV = require('../libs/av-weapp-min.js'),
  config = require('leancloud.config.js');

const Promise = require('../libs/es6-promise.min.js').Promise

module.exports = {

  init: function () {
    AV.init({
      appId: config.appId,
      appKey: config.appKey
    });
    console.log('初始化 leancloud...')
  },

  update(objectId, className, data) {
    return new Promise((resolve, reject) => {
      console.log('更新...');
      let klass = AV.Object.createWithoutData(className, objectId);
      // 保存更新
      klass.save(data).then(
        function (res) {
          console.log('数据更新成功');
          resolve()
        },
        err => { console.error(err); reject(); }
      );
    })
  },

  queryQuestion: function (date) {
    // get today's question
    // data Format year-mm-dd
    return new Promise((resolve, reject) => {
      console.log("查询今天的题目")
      wx.showLoading({
        title: '查询题目',
      })
      let query = new AV.Query("Question");
      query.greaterThanOrEqualTo("date", new Date(date))
      query.find().then(res => {
        if (res.length === 0) {
          console.log("尚无今日题目");
          resolve(false)
        } else {
          console.log(res[0])
          console.log("获取题目成功");
          resolve(res[0])
        }
        wx.hideLoading()
      }).catch((err) => {
        wx.hideLoading()
        console.log(err);
        reject(err);
      })
    })
  },

  queryCheck(user, date) {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '查询打卡结果',
      })
      let query = new AV.Query("Check");
      query.equalTo("user", user)
      query.equalTo("date", new Date(date))
      query.include(["user", "question"])
      query.find().then(res => {
        if (res.length !== 0) {
          console.log("查询打卡结果")
          resolve(res)
        } else {
          console.log("无打卡")
          resolve(false)
        }
        wx.hideLoading()
      }).catch(function (err) {
        wx.hideLoading()
        console.log(err); reject(err)
      })
    })
  },

  queryRank(user) {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '查询排名',
      })
      let query = new AV.Query("Rank")
      query.equalTo("user", user)
      query.find().then(function (res) {
        if (res.length === 0) {
          console.log("用户无排名")
          resolve(false)
        } else {
          console.log("用户有排名")
          resolve(res[0])
        }
        return
        wx.hideLoading()
      }).catch((err) => {
        reject(err)
      })
    })
  },

  queryRankAll() {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '查询全部排名',
      })
      console.log("queryRankAll")
      let query = new AV.Query("Rank")
      query.addDescending("times")
      query.addAscending('updatedAt');
      query.include(["user"])
      query.find().then(function (res) {
        if (res.length === 0) {
          throw new Error("没有任何排名数据。")
        } else {
          console.log("有排名")
          resolve(res)
        }
        wx.hideLoading()
        return
      }).catch((err) => {
        reject(err)
      })
    })
  }
}