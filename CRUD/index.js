const express = require("express");
const mysql = require("mysql");
const app = express();
const pool = require("./dbPool");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

//routes
app.get('/', (req, res) => {
   res.render('index.ejs')
});
app.get('/author/new', (req, res) => {
   res.render('newAuthor.ejs')
});
app.post("/author/new", async function(req, res){
  let sql = `INSERT INTO q_authors 
            (firstName, lastName, dob, dod, sex,
            profession, country, portrait, biography)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
  let params = [req.body.fName, req.body.lName,
                req.body.birthDate, req.body.dod, 
                req.body.sex, req.body.profession,
                req.body.country, req.body.portrait,
                req.body.bio];
  let rows = await executeSQL(sql, params);
  res.render("newAuthor.ejs", {"message": "Author added!"});
});
app.get("/authors", async function(req, res){
 let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
 let rows = await executeSQL(sql);
 res.render("authorList.ejs", {"authors":rows});
});
app.get("/author/edit", async function(req, res){
 
 let authorId = req.query.authorId;
 
 let sql = `SELECT *, DATE_FORMAT(dob, '%Y-%m-%d')
            dobISO,
            DATE_FORMAT(dod, '%Y-%m-%d') dodISO
            FROM q_authors
            WHERE authorId = ${authorId}`;
 let rows = await executeSQL(sql);
 res.render("editAuthor.ejs", {"authorInfo":rows});
});
app.post("/author/edit", async function(req, res){
 let sql = `UPDATE q_authors
            SET firstName = ?,
               lastName = ?,
               dob = ?,
               dod = ?,
               sex = ?,
               profession = ?,
               country = ?,
               portrait = ?,
               biography = ?
            WHERE authorId =  ?`;
 
let params = [req.body.fName, req.body.lName,
              req.body.dob, req.body.dod, 
              req.body.sex, req.body.profession,
              req.body.country, req.body.portrait,
              req.body.bio, req.body.authorId];         
let rows = await executeSQL(sql,params);
 
sql = `SELECT *, 
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
        DATE_FORMAT(dod, '%Y-%m-%d') dodISO
        FROM q_authors
        WHERE authorId= ${req.body.authorId}`;
 rows = await executeSQL(sql);
 res.render("editAuthor", {"authorInfo":rows, "message": "Author Updated!"});
});
app.get("/author/delete", async function(req, res){
  let sql = `DELETE
            FROM q_authors
            WHERE authorId = ${req.query.authorId}`;
  let rows = await executeSQL(sql);
  res.redirect("/authors");
});


app.get("/quotes", async function(req, res){
 let sql = `SELECT quoteId, quote, authorId, firstName, lastName
            FROM q_quotes
            NATURAL JOIN q_authors
            ORDER BY lastName`;
 let rows = await executeSQL(sql);
 res.render("quoteList.ejs", {"quotes":rows});
});
app.get('/quote/new', async function(req, res) {
  let authorsAndCategories = await getAuthorsAndCategories();
  let auths = authorsAndCategories[0];
  let cats = authorsAndCategories[1];
  res.render("newQuote.ejs", { "authors": auths, "categories": cats });
});
app.post("/quote/new", async function(req, res){
  let quoteNew = req.body.quote;
  let quoteAuthorId = req.body.authorId;
  let quoteCategory = req.body.category;
  let quoteLikes = req.body.likes;
  
  let sql = "INSERT INTO q_quotes (quote, authorId, category, likes) VALUES (?, ?, ?, ?);"
  let params = [quoteNew, quoteAuthorId, quoteCategory, quoteLikes];
  let rows = await executeSQL(sql, params);
  
  let authorsAndCategories = await getAuthorsAndCategories();
  let auths = authorsAndCategories[0];
  let cats = authorsAndCategories[1];
  res.render("newQuote.ejs", { "authors": auths, "categories": cats, "message": "Quote Added!" });
});
app.get("/quote/edit", async function(req, res){
 
 let quoteId = req.query.quoteId;
 
 let sql = `SELECT *
            FROM q_quotes
            WHERE quoteId = ${quoteId}`;
 let rows = await executeSQL(sql);

 let authorsAndCategories = await getAuthorsAndCategories();
 let auths = authorsAndCategories[0];
 let cats = authorsAndCategories[1];
 res.render("editQuote.ejs", {"quoteInfo":rows, "authors": auths, "categories": cats});
});
app.post("/quote/edit", async function(req, res){
 let sql = `UPDATE q_quotes
            SET quote = ?,
               authorId = ?,
               category = ?,
               likes = ?
            WHERE quoteId =  ?`;
 
  let params = [req.body.quote,  
              req.body.authorId, req.body.category, 
              req.body.likes, req.body.quoteId];         
  let rows = await executeSQL(sql, params);
 
  sql = `SELECT *
            FROM q_quotes
            WHERE quoteId = ${req.body.quoteId}`;
  rows = await executeSQL(sql);
  
  let authorsAndCategories = await getAuthorsAndCategories();
  let auths = authorsAndCategories[0];
  let cats = authorsAndCategories[1];
  res.render("editQuote.ejs", {"quoteInfo":rows, "authors": auths, "categories": cats, "message": "Quote Updated!"});
});
app.get("/quote/delete", async function(req, res){
  let sql = `DELETE
            FROM q_quotes
            WHERE quoteId = ${req.query.quoteId}`;
  let rows = await executeSQL(sql);
  res.redirect("/quotes");
});


app.get("/dbTest", async function(req, res){
let sql = "SELECT CURDATE()";
let rows = await executeSQL(sql);
res.send(rows);
});//dbTest
 
//functions
async function executeSQL(sql, params){
return new Promise (function (resolve, reject) {
pool.query(sql, params, function (err, rows, fields) {
if (err) throw err;
   resolve(rows);
});
});
}//executeSQL
async function getAuthorsAndCategories() {
  let sql = `SELECT authorId, firstName, lastName
            FROM q_authors
            ORDER BY lastName`;
  let sql2 = `SELECT DISTINCT category
            FROM q_quotes`;
  let rows = await executeSQL(sql);
  let rows2 = await executeSQL(sql2);
  authorsAndCategories = [rows, rows2];
  return authorsAndCategories;
}//getAuthorsAndCategories
 
//start server
app.listen(3000, () => {
console.log("Expresss server running...")
} )
