const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Настройки подключения к базе данных
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Функция для получения клиента из пула
async function getClient() {
  const client = await pool.connect();
  console.log('Получен клиент из пула');
  return client;
}

// Функция для подключения к базе данных
async function connectDB() {
  try {
    const client = await getClient();
    console.log('Подключение к базе данных успешно!');
    return client;
  } catch (err) {
    console.error('Ошибка при подключении к базе данных:', err);
    throw new Error('Не удалось подключиться к базе данных: ' + err.message);
  }
}

// Функция для выполнения запроса
async function queryDB(query, params = []) {
  const client = await getClient();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Ошибка выполнения запроса:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Функция для закрытия подключения
async function closeDB() {
  await pool.end();
  console.log('Соединение с базой данных закрыто');
}

module.exports = { connectDB, queryDB, closeDB };