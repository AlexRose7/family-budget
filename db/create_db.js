import pool from '../config/db.js';

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('🛠 Создаем таблицы...');

    // 1. Таблица для информации о работе членов семьи
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        position TEXT NOT NULL,
        company TEXT NOT NULL,
        salary DECIMAL(10, 2) NOT NULL,
        start_date DATE NOT NULL
      );
    `);

    // 2. Таблица для категорий товаров
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
    `);

    // 3. Таблица для товаров и услуг
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category_id INT REFERENCES categories(id) ON DELETE CASCADE,
        price DECIMAL(10, 2) NOT NULL
      );
    `);

    // 4. Таблица для транзакций (расходов)
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        quantity INT NOT NULL,
        purchase_date DATE NOT NULL DEFAULT CURRENT_DATE
      );
    `);

    console.log('✅ Таблицы успешно созданы!');
  } catch (err) {
    console.error('❌ Ошибка при создании таблиц:', err);
  } finally {
    client.release();
  }
};

createTables();