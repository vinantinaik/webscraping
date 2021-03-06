$(document).ready(function(){

    $("#deleteComment").on("click",function(){

        var thisId = $(this).attr("data-note-id");

        $.ajax({
            method: "DELETE",
            url: "/comment/" + thisId,
            
          })
          .then(function(data) {
            
           
          });

    })


    $("#saveComment").on("click",function(){

        var thisId = $("#articleTitle").text();

        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
              // Value taken from title input
              title: $("#comment-title").val(),
              // Value taken from note textarea
              body: $("#comment-body").val()
            }
          })
          .then(function(data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#comment-body").empty();
           
          });

    })

    $("#wrapper").on("click",".btn",function(){
        
        let save = $(this);
       
        let article = {
            articleId:save.parent().attr("data"),
            title : save.parent().parent().children("div.card-header").text(),
            link : save.parent().children("p").children("a").attr("href")
        }

        $.post("/save",article,function(data){
       
            $("#myModal").modal('show');
                       
        
            
        })

      
    })


    $("#savedArticles").on("click",".btn",function(){
        if($(this).text() === 'Remove')
        {
            var article = $(this);
            var thisId = $(this).attr("data-id");
            var noteId =  article.parent().children("h6.comment-title").attr("data");
            let delObj = {
                articleId:thisId,
                noteId:noteId
            }
       
            $.ajax({
                method: "DELETE",
                url: "/remove/" + thisId,
                data:delObj
              })
              .done(function(){
               
                article.parent().parent().remove();
              })
                
        }
        else if($(this).text() == 'Comment')
        {
            var article = $(this);
            var thisId = $(this).attr("data-id");
            var noteId =  article.parent().children("h6.comment-title").attr("data");
            var title = article.parent().children("h6.comment-title").text().trim();
            var body = article.parent().children("h6.comment-body").text().trim();
            $("#articleTitle").text(thisId);
            $("#comment-title").val(title);
            $("#comment-body").val(body);
            $("#deleteComment").attr("data-note-id",noteId);
       
            $("#commentModal").modal('show');
        }
       

      
    })
})