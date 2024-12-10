const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "portfolio",
    password: "portfolio",
    database: "portfolio",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool;