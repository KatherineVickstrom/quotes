const express = require('express');
const app = express();
const pool = require("./dbPool.js");
app.set("view engine", "ejs");
app.use(express.static('public'));

app.get('/', async (req, res) => {
  let sql = `SELECT authorId, firstName, lastName
            FROM q_authors
            ORDER BY lastName`;
  let sql2 = `SELECT DISTINCT category
            FROM q_quotes`;
  let rows = await executeSQL(sql);
  let rows2 = await executeSQL(sql2);
  res.render("index.ejs", { "authors": rows, "categories": rows2 });
});

app.get("/searchByKeyword", async function(req, res) {
  let userKeyword = req.query.keyword;
  let sql = `SELECT quote, authorId, firstName, lastName
            FROM q_quotes
            NATURAL JOIN q_authors
            WHERE quote LIKE ?`;
  let params = [`%${userKeyword}%`];
  let rows = await executeSQL(sql, params);
  res.render("results.ejs", { "quotes": rows });
});

app.get("/searchByAuthor", async function(req, res) {
  let userAuthorId = req.query.authorId;
  let sql = `SELECT quote, authorId, firstName, lastName
            FROM q_quotes
            NATURAL JOIN q_authors
            WHERE authorId = ?`;
  let params = [userAuthorId];
  let rows = await executeSQL(sql, params);
  res.render("results.ejs", { "quotes": rows });
});

app.get("/searchByCategory", async function(req, res) {
  let userCategory = req.query.category;
  let sql = `SELECT quote, authorId, firstName, lastName
            FROM q_quotes
            NATURAL JOIN q_authors
            WHERE category = ?`;
  let params = [userCategory];
  let rows = await executeSQL(sql, params);
  res.render("results.ejs", { "quotes": rows });
});

app.get("/searchByLikes", async function(req, res) {
  let userLow = req.query.low;
  let userHigh = req.query.high;
  let sql = `SELECT quote, authorId, firstName, lastName
            FROM q_quotes
            NATURAL JOIN q_authors
            WHERE likes BETWEEN ${userLow} AND ${userHigh}`;
  let rows = await executeSQL(sql);
  res.render("results.ejs", { "quotes": rows });
});

app.get('/api/author/:id', async (req, res) => {
  let authorId = req.params.id;
  let sql = `SELECT *
            FROM q_authors
            WHERE authorId = ? `;
  let rows = await executeSQL(sql, [authorId]);
  res.send(rows)
});

app.get("/dbTest", async function(req, res) {
  let sql = "SELECT * FROM q_quotes";
  let rows = await executeSQL(sql);
  res.send(rows);
});

//functions
async function executeSQL(sql, params) {
  return new Promise(function(resolve, reject) {
    pool.query(sql, params, function(err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
}

app.listen(3000, () => {
  console.log('server started');
});