var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
	// 关联字段 - 内容分类的id
    category: {
        // 引用类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'Category'
    },
    //发表作者
    user: {
        // 引用类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'User'
    },
    //发表时间
    addTime: {
        type: Date,
        default: new Date()
    },
    //阅读量
    view: {
        type: Number,
        default: 0
    },
    //内容标题
    title: String,
    //简介
    description: {
        type: String,
        default: ''
    },  
    //内容
     content: {
        type: String,
        default: ''
    },
    comment: {
        type: Array,
        default: []
    }
});