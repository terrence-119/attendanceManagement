const { Pool } = require("pg");

//DB情報を持ったプールを生成
const pool = new Pool({
    host: '127.0.0.1',
    database: 'attendance',
    port: '5432',
    user: 'abeteppei',
    password: 'Abe.t0119',
});

module.exports = pool;