const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ngo_portal';
const pool = new Pool({ connectionString });
module.exports = { query: (text, params) => pool.query(text, params), pool };
