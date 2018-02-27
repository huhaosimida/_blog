var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

//验证是否为管理员
router.use(function(req, res, next){
    if(!req.userInfo1.isAdmin){
        res.send('对不起，您不具有此页面的访问权限');
        return;
    }
    next();
});

router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo1: req.userInfo1
    });
});

//用户管理
router.get('/user',function(req,res,next){
	var page = Number(req.query.page || 1);
    var limit = 10;
    var skip = 0;
    var pages = 0;
	//从数据库中读取所有用户信息
	 User.count().then(function(count){
        pages = Math.ceil( count/limit );
        page = Math.min( page, pages );
        page = Math.max( page, 1 );
        skip = (page-1)*limit;

	User.find().limit(limit).skip(skip).then(function(users){
		res.render('admin/userindex',{
        userInfo1: req.userInfo1,
        users: users,
        count: count,
        pages: pages,
        limit: limit,
        page:  page
   			 });
	 	 })
	 });  
});
//分类
router.get('/category',function(req,res){

	var page = Number(req.query.page || 1);
    var limit = 10;
    var skip = 0;
    var pages = 0;
	//从数据库中读取所有用户信息
	 Category.count().then(function(count){
        pages = Math.ceil( count/limit );
        page = Math.min( page, pages );
        page = Math.max( page, 1 );
        skip = (page-1)*limit;

	Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function(categories){
		res.render('admin/category_index',{
        userInfo1: req.userInfo1,
        categories: categories,
        count: count,
        pages: pages,
        limit: limit,
        page:  page
   			 });
	 	 })
	 });  
});
//分类添加
router.get('/category/add',function(req,res,next){
    res.render('admin/category_add',{
        userInfo1: req.userInfo1
    });
});
//分类保存
router.post('/category/add',function(req,res){

	let name = req.body.name || '';
    if( name == '' ){
        res.render('admin/error',{
            userInfo1: req.userInfo1,
            msg: "分类名称不能为空"
        });
        return;
    }
    //数据库中分类是否存在
    Category.findOne({
    	name: name
    }).then(function(rs){
    	if (rs) {
    		//该分类存在
    		res.render('admin/error',{
            userInfo1: req.userInfo1,
            msg: "分类已经存在"
       		});
       		return Promise.reject();
    	} else{
    		//不存在该分类
    		 return new Category({
    		 	name: name
    		 }).save();
    	}
    }).then(function(newCategory){
    		res.render('admin/success',{
                userInfo1: req.userInfo1,
                msg: "分类添加成功",
                url: '/admin/category'
            })
    })
});
//分类修改
router.get('/category/edit',function(req,res){
	//获取需要修改的分类信息
	var _id = req.query.id || '';
	Category.findOne({
		_id: _id		
	}).then(function(category){
		if(!category){
            res.render('admin/error',{
                userInfo1: req.userInfo1,
                msg: '分类名称不存在'
            });
        }  else{
        	res.render('admin/category_edit',{
                userInfo1: req.userInfo1,
                category: category
            });
        }
     });   
});
//分类的修改保存
router.post('/category/edit',function(req,res){
	var _id = req.query.id || '';	//获取要修改的分类信息
    var name = req.body.name || '';	//获取Post提交过来的信息

    Category.findOne({
		_id: _id		
	}).then(function(category){
		if(!category){
            res.render('admin/error',{
                userInfo1: req.userInfo1,
                msg: '分类名称不存在'
            });
            return Promise.reject();
        }  else{
        	//用户是否修改
        	if (name ==category.name ) {
        		 res.render('admin/error',{
                userInfo1: req.userInfo1,
                msg: '修改成功',
                url: '/admin/category'
            });
        	return Promise.reject();
        	} else{
        		//修改后名称是否已经存在
        		return Category.findOne({
        			_id: {$ne: _id}, 
        			name: name 
        		});
        	}       	
        }
     }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/error',{
                userInfo1: req.userInfo1,
                msg: '数据库中存在同名分类'
            });
            return Promise.reject(); 
        } else {
            return Category.update({_id}, {name});
        }
    }).then(function(){
        res.render('admin/success',{
            userInfo1: req.userInfo1,
            msg: '分类修改成功',
            url: '/admin/category'
        });
    })
});
//分类删除
router.get('/category/delete',function(req,res,){
    var _id = req.query.id;
    Category.remove({
    	_id: _id
    }).then(function(delCategory){
        res.render('admin/success',{
            userInfo1: req.userInfo1,
            msg: '删除分类成功',
            url: '/admin/category'
        }); 
    });
});

//文章首页
router.get('/content',function(req,res,){
	var page = Number(req.query.page || 1);
    var limit = 10;
    var skip = 0;
    var pages = 0;
    //从数据库中读取所有用户信息
     Content.count().then(function(count){
        pages = Math.ceil( count/limit );
        page = Math.min( page, pages );
        page = Math.max( page, 1 );
        skip = (page-1)*limit;

    Content.find().sort({_id: -1}).limit(limit).skip(skip).populate('category').then(function(contents){
        res.render('admin/content_index',{
        userInfo1: req.userInfo1,
        contents: contents,
        count: count,
        pages: pages,
        limit: limit,
        page:  page
             });
         })
     });  
});
//文章添加
router.get('/content/add',function(req,res,){
	//从数据库读取分类信息
	Category.find().sort({_id: -1}).then(function(categories){
		res.render('admin/content_add',{
		userInfo1: req.userInfo1,
		categories: categories
	    });
	});
	
});

router.post('/content/add',function(req,res){
//验证信息
	if(req.body.category == ''){
        res.render('admin/error',{
            userInfo1: req.userInfo1,
            msg: '文章所属栏目不能为空'
        })
        return;
    }
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo1: req.userInfo1,
            msg: '文章标题不能为空'
        })
        return;
    }
    //保存数据到数据库
    new Content({
    	category: req.body.category,
        user : req.userInfo1._id,
    	title: req.body.title,
    	description: req.body.description,
    	content: req.body.content
    }).save().then(function(rs){
    	res.render('admin/success',{
            userInfo1: req.userInfo1,
            msg: '文章保存成功',
            url: '/admin/content'
        })
    })
});
//文章修改
router.get('/content/edit',(req, res, next)=>{
    var _id = req.query.id;
    var categories = [];
    Category.find().then(function(rs){
        categories = rs;
        return  Content.findOne({
            _id: _id
        }).populate('category');
    }).then(function(content){
        if(!content){
            render('admin/error',{
                userInfo1: req.userInfo1,
                msg: '该文章不存在'
            });
        } else {
            res.render('admin/content_edit',{
                userInfo1: req.userInfo1,
                content: content,
                categories: categories
            })
        }
    });
});
//保存文章修改内容
router.post('/content/edit',function(req, res, next){
    var _id = req.query.id;
    if(req.body.category == ''){
        res.render('admin/error',{
            userInfo1: req.userInfo1,
            msg: '文章所属栏目不能为空'
        });
    }
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo1: req.userInfo1,
            msg: '文章标题不能为空'
        });
    }

    Content.update({
        _id: _id
    },{
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function(){
        res.render('admin/success',{
            userInfo1: req.userInfo1,
            msg: '保存成功',
            url: `/admin/content/edit?id=${_id}`
        })
    });
});
//文章删除
router.get('/content/delete',function(req, res, next){
    var _id = req.query.id;
    Content.remove({
        _id: _id
    }).then(function(delContent){
        res.render('admin/success',{
            userInfo1: req.userInfo1,
            msg: '删除文章成功',
            url: '/admin/content'
        }); 
    });
});
//评论删除
router.get('/comment',function(req,res,){
     var _id = req.query.id;
    Content.find().sort({_id: -1}).populate('category').then(function(contents){
        res.render('admin/comment_index',{
        userInfo1: req.userInfo1,
        contents: contents,
             });
         })
});  
//评论删除详情页
router.get('/comment/del',function(req,res,){
    var _id = req.query.id;
    Content.find({
        _id: _id,
    }).sort({_id: -1}).then(function(contents){
    res.render('admin/comment_del',{
        userInfo1: req.userInfo1,
        contents:contents,
             });
        })
});
module.exports = router;