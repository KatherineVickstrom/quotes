const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit: 10,
    host: "yjo6uubt3u5c16az.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "wca96ke29inch63c",
    password: "mh62j9sb83u9usow",
    database: "xrju9dz9pn8c4zht"
});

module.exports = pool;
