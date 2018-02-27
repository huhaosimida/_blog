var perpage = 4;
var page = 1;
var pages = 0;
var comment = [];
$(document).ready(function() {
   
// 提交评论
    $('#comment_btn').on('click',function(){
        $.ajax({
            type: "post",
            url: "/comment/post",
            data: {
                commentId: $('.discuss_id').val(),
                commentContent: $('.discuss_input').val()
            },
            dataType: "json",
            success: function(reponseData){
               //console.log(responseData);
               $('.discuss_input').val();
               comment = reponseData.data.comment.reverse(); 
               renderComments();
            }
        });
    });

    //获取所有评论
        $.ajax({
            type: "get",
            url: "/comment/all",
            data: {
                commentId: $('.discuss_id').val()
            },
            dataType: "json",
            success: function(reponseData){
               comment = reponseData.data.reverse();
               renderComments();
            }
        });

    $('.pager').delegate('a','click',function(){
    if ($(this).parent().hasClass('previous')) {
        page --;
    } else{
        page ++;
    }
    renderComments();
    });

    function renderComments(){
        var pages = Math.ceil(comment.length / perpage);
        var start = Math.max(0,(page - 1)*perpage);
        var end = Math.min(start + perpage,comment.length); 
        var $lis = $('.pager li');
        $lis.eq(1).html(`${page}  / ${pages}`);

        if (page <= 1) {
            page = 1;
            $lis.eq(0).html(`<span>没有上一页</span>`)
        } else {
             $lis.eq(0).html(`<a href="javascript:;">上一页</a>`)
        }
        if (page >= pages) {
            page = pages;
            $lis.eq(2).html(`<span>没有下一页</span>`)
        } else {
             $lis.eq(2).html(`<a href="javascript:;">下一页</a>`)
        }

        var commentsStr = "";
        for(var i=start;i<end;i++){
            comment[i].postTime = formatDate(comment[i].postTime);
            //ES6 字符串拼接
            commentsStr +=  `<li class="comment">
                                <div>
                                    <img src="https://avatars2.githubusercontent.com/u/22424333?s=400&u=de2941eae24be1d8db9dd55ba8e6b82fe5e8b050&v=4" alt="Avatar" class="avatar">
                                    <div class="comment-meta">
                                        <span class="author"><a href="#">${comment[i].username}</a></span>
                                        <span class="date">${comment[i].postTime}</span>
                                    </div>
                                    <div class="comment-body">
                                        ${comment[i].comment}
                                    </div>
                                </div>                                   
                            </li>`
                     };
        $('.comments-list').html(commentsStr);
    };

    function formatDate( date ){
        var curDate = new Date( date );
        return curDate.getFullYear()+'-'+(curDate.getMonth()+1)+'-'+curDate.getDate()+' ：'
        +curDate.getHours()+':'+curDate.getMinutes()+':'+curDate.getSeconds();
    };

})    