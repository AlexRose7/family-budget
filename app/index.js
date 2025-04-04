import pool from '../config/db.js';

const getUsers = async () => {
  const client = await pool.connect();

  try {
    // Запрос для получения пользователей
    const res = await client.query('SELECT * FROM users');
    console.log('Users:', res.rows);
  } catch (err) {
    console.error('Error retrieving users:', err);
  } finally {
    client.release();
  }
};

const getJobs = async () => {
  const client = await pool.connect();

  try {
    // Запрос для получения информации о работе
    const res = await client.query('SELECT * FROM jobs');
    console.log('Jobs:', res.rows);
  } catch (err) {
    console.error('Error retrieving jobs:', err);
  } finally {
    client.release();
  }
};

const getProducts = async () => {
  const client = await pool.connect();

  try {
    // Запрос для получения продуктов
    const res = await client.query('SELECT * FROM products');
    console.log('Products:', res.rows);
  } catch (err) {
    console.error('Error retrieving products:', err);
  } finally {
    client.release();
  }
};

const getTransactions = async () => {
  const client = await pool.connect();

  try {
    // Запрос для получения транзакций
    const res = await client.query('SELECT * FROM transactions');
    console.log('Transactions:', res.rows);
  } catch (err) {
    console.error('Error retrieving transactions:', err);
  } finally {
    client.release();
  }
};

// Вызываем все функции
const run = async () => {
  await getUsers();
  await getJobs();
  await getProducts();
  await getTransactions();
};

run();