var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var axios = require("axios");
var cheerio = require("cheerio");


module.exports = function (app, db) {

  app.engine("handlebars", exphbs({ defaultLayout: "main" }));
  app.set("view engine", "handlebars");
  // Sets up the Express app to handle data parsing
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());


  app.get("/", function (req, res) {
    res.render("index")

  })

  app.post("/save", function (req, res) {
    console.log(req.body);

    db.Article.create(req.body)
      .then(function (dbArticle) {
        console.log(dbArticle);
        res.json(dbArticle);
      })
      .catch(function (err) {
        return res.json(err);
      })

  })

  app.get("/saved", function (req, res) {

    var savedArticles = [];
    db.Article.find({})
      .populate("note")
      .then(function (dbArticle) {
      console.log(dbArticle);
      savedArticles = dbArticle;
      res.render("index", { savedArticles: savedArticles })

    })

  })

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    console.log("my comment : ", req.body);
    db.Note.create(req.body)
      .then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);

      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.delete("/comment/:id",function(req,res){

    db.Note.findOneAndRemove({ _id: req.params.id })
      .then(function () {
        db.Article.update(
          {"note": req.params.id},
          {"$unset" : {"note" : req.params.id}},
          function(err,res){
            if (err) throw err;
          
          }
        )
        res.status(200).end();


      })
      .catch(function (err) {
        res.json(err);
      })


  })

  app.delete("/remove/:id", function (req, res) {
    console.log("deleting " + req.params.id);

    db.Article.findOneAndRemove({ _id: req.params.id })
      .then(function () {

        console.log("deleting Note :" ,req.body.noteId);
        db.Note.findOneAndRemove({_id : req.body.noteId})
        .then(function(){

        })
        // db.Note.update(
        //   {"note": req.body.noteId},
        //   {"$pull" : {"note" : req.body.noteId}},
        //   function(err,res){
        //     if (err) throw err;
          
        //   }
        //)
        res.status(200).end();


      })
      .catch(function (err) {
        res.json(err);
      })





  })



  app.get("/scrap", function (req, res) {

    axios.get("http://www.echojs.com/").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      var result = [];
      // Now, we grab every h2 within an article tag, and do the following:
      $("article").each(function (i, element) {
        // Save an empty result object
        var article = {}
        article.id = $(this).attr("data-news-id")

        // Add the text and href of every link, and save them as properties of the result object
        article.title = $(this).children("h2")
          .children("a")
          .text();
        article.link = $(this).children("h2")
          .children("a")
          .attr("href");

        result.push({
          articleId: article.id,
          title: article.title,
          link: article.link
        })

        // If we were able to successfully scrape and save an Article, send a message to the client
        //res.send("Scrape Complete");
      });
      res.render("index", { articles: result })
    });

  });

}