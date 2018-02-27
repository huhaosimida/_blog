$(function(){
	var $tabs = $('#tabs');
	var $loginBox = $('#loginBox');
	var $registerBox = $('#registerBox');
	var $userInfo = $('#userInfo');

	//注册
	$registerBox.find('button').on('click',function(){
		//通过AJAX提交请求
		$.ajax({
			type:"post",
			url:"/user/register",
			data:{
				username:  $registerBox.find('[name="username"]').val(),
				password:  $registerBox.find('[name="password"]').val(),
				password1: $registerBox.find('[name="password1"]').val()
			},
			dataType: "json",
			success:function(result){
				$registerBox.find('.colwarning').html(result.msg);
				if (!result.code) {
					$registerBox.find('.colwarning').html('注册成功');
					 setTimeout(function(){
					 		$('.clicklogin').click();
					 }, 1000)					
				 }	
			 }
		});
	});

	//登录
	$loginBox.find('button').on('click',function(){
		//通过AJAX提交请求
		$.ajax({
			type:"post",
			url:"/user/login",
			data:{
				username:  $loginBox.find('[name="username"]').val(),
				password:  $loginBox.find('[name="password"]').val()
			},
			dataType: "json",
			success:function(result){
				$loginBox.find('.colwarning').html(result.msg);
				if (!result.code) {
					//登陆成功
					window.location.reload();
				}				
			 }
		});
	});

	$('#logout').on('click',function(){
		$.ajax({
			url: "/user/logout",
			success:function(result){
				if(!result.code){
					window.location.reload();
				}
			}
		});
	});


})