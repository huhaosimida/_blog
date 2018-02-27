var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');
var data;
/* GET home page. */
//通用信息
router.use(function(req, res,next){
    data = {
        userInfo1: req.userInfo1,
        categories: [],
    }
     Category.find().then(function(categories){
          data.categories = categories;
          next();
     });

});

router.get('/', function(req, res,next) {
        data.category =  req.query.category || '';
        data.count =  0;
        data.page =  Number(req.query.page || 1);
        data.limit =  4;
        data.skip =  0;
        data.pages =  0;          

    var where = {};
    if(data.category){
        where.category = data.category
    }

  Content.where(where).count().then(function(count){
      data.count = count;
      data.pages = Math.ceil( data.count/data.limit );
      data.page = Math.min( data.page, data.pages );
      data.page = Math.max( data.page, 1 );
      data.skip = (data.page-1)*data.limit;
      return Content.where( where ).find().sort({addTime: -1}).limit( data.limit ).skip( data.skip ).populate( 'category');
  }).then(function(contents){
      data.contents = contents;
      res.render('index',data);
  })
});

router.get('/views',function(req, res, next){
    var _id = req.query.page ||'';
    Content.findOne({
      _id: _id
    }).then(function(content){
      data.content = content;
      content.view++;
      content.save();
        res.render('index2',data);
    })
    
});


// 定义统一返回格式
var reponseData;
router.use( function(req,res,next){
    reponseData = {
        code: 0,
        msg: ''
    }
    next();
});

//用户注册
router.post('/user/register', function(req, res, next) {
 	var username = req.body.username;
 	var password = req.body.password;
 	var password1 = req.body.password1;

 	if(username == ''){
        reponseData = {code: 1,msg: '用户名不能为空'}
        res.json(reponseData);	//把对象转为json，返回前端
        return;
    }
     if(password == ''){
        reponseData = {code: 2,msg: '密码不能为空'}
        res.json(reponseData);
        return;
    }
     if(password1 != password){
        reponseData = {code: 3,msg: '两次输入的密码不一致'}
        res.json(reponseData);
        return;
    }
    //验证用户是否已经注册
    User.findOne({
    	username : username
    }).then(function(userInfo){
    	if (userInfo) {
    		//存在此用户
    		reponseData = {code: 4,msg: '用户已经存在'}
    		res.json(reponseData);
    		return;
    	}
    	//未注册，保存到数据库中
    	var  user = new User({
    		username:username,
    		password:password
    	});
    	return user.save();
    }).then(function(newUserInfo){
    		console.log(newUserInfo);
    		reponseData.msg = '注册成功';
    		res.json(reponseData);   	
    });   
});
//用户登陆
router.post('/user/login', function(req, res) {
	var username = req.body.username;
 	var password = req.body.password;

 	if(username == '' || password == ''){
        reponseData = {code: 1,msg: '用户名和密码不能为空'}
        res.json(reponseData);	//把对象转为json，返回前端
        return;
    }
     //查询数据库中的用户
     User.findOne({
     	username:username,
    	password:password
     }).then(function(userInfo1){
     	if(!userInfo1){
     		reponseData = {code: 2,msg: '用户名或密码错误'}
        	res.json(reponseData);
        	return;
     	}
     	//用户名和密码正确
     		reponseData.msg = '登录成功';
            reponseData.userInfo1 = {
                _id: userInfo1._id,
                username: userInfo1.username
            }
            req.cookies.set('userInfo1', JSON.stringify({
                _id: userInfo1._id,
                username: userInfo1.username
            }));
        	res.json(reponseData);
        	return;
     });
});
//用户退出
router.get('/user/logout',function(req,res){
	req.cookies.set('userInfo1', null);
	res.json(reponseData);
});


//提交评论
router.post('/comment/post',function(req,res){
    var _id = req.body.commentId;
    var postdata = {
        username: req.userInfo1.username,
        postTime: new Date(),
        comment: req.body.commentContent
    };

    Content.findOne({
      _id: _id
    }).then(function(content){
        content.comment.push(postdata);
        return content.save();
    }).then(function(newContent){
        reponseData.msg = "评论成功";
        reponseData.data= newContent;
        res.json(reponseData);
    });  
});

//获取所有评论
router.get('/comment/all',function(req,res){
    var _id = req.query.commentId || '';
    Content.findOne({
      _id: _id
    }).then(function(content){
        reponseData.data = content.comment;
        res.json(reponseData);
    })
});
module.exports = router;
