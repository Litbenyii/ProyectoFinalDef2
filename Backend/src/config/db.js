const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.DB_USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ Conectado a PostgreSQL"))
  .catch(err => {
    console.error("❌ Error conexión BD", err);
    process.exit(1);
  });

module.exports = pool;