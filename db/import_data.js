import fs from 'fs';
import csvParser from 'csv-parser';
import pool from '../config/db.js';

const importData = async () => {
  const client = await pool.connect();

  try {
    console.log('📥 Начинаем импорт данных...');

    // 1. Импорт пользователей
    const users = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream('import/family_members.csv')
        .pipe(csvParser())
        .on('data', (row) => {
          users.push([row['ФИО'], row['Дата рождения']]);
        })
        .on('end', async () => {
          try {
            const query = `
              INSERT INTO users (full_name, birth_date) 
              VALUES ($1, $2) 
              ON CONFLICT (full_name) DO NOTHING;
            `;
            for (const user of users) {
              await client.query(query, user);
            }
            console.log('✅ Импорт пользователей завершен.');
            resolve();
          } catch (err) {
            reject(err);
          }
        });
    });

    // 2. Импорт информации о работе
    const jobs = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream('import/family_members_job.csv')
        .pipe(csvParser())
        .on('data', (row) => {
          jobs.push([row['ФИО'], row['Текущая должность'], row['Организация'], row['Оклад'], row['Дата начала']]);
        })
        .on('end', async () => {
          try {
            const query = `
              INSERT INTO jobs (user_id, position, organization, salary, start_date) 
              VALUES (
                (SELECT id FROM users WHERE LOWER(TRIM(full_name)) = LOWER(TRIM($1))),
                $2, $3, $4, $5
              )
              ON CONFLICT (user_id) DO NOTHING;
            `;
            for (const job of jobs) {
              await client.query(query, job);
            }
            console.log('✅ Импорт информации о работе завершен.');
            resolve();
          } catch (err) {
            reject(err);
          }
        });
    });

    // 3. Импорт продуктов
    const products = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream('import/product.csv')
        .pipe(csvParser())
        .on('data', (row) => {
          products.push([row['Название товара/услуги'], row['Категория'], row['Цена за единицу']]);
        })
        .on('end', async () => {
          try {
            const query = `
              INSERT INTO products (name, category_id, price) 
              VALUES ($1, (SELECT id FROM categories WHERE name = $2), $3)
              ON CONFLICT (name) DO NOTHING;
            `;
            for (const product of products) {
              await client.query(query, product);
            }
            console.log('✅ Импорт продуктов завершен.');
            resolve();
          } catch (err) {
            reject(err);
          }
        });
    });

    // 4. Импорт транзакций
    const transactions = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream('import/expence_product.csv')
        .pipe(csvParser())
        .on('data', (row) => {
          transactions.push([row['ФИО'], row['Название товара/услуги'], row['Количество'], row['Дата покупки']]);
        })
        .on('end', async () => {
          try {
            const query = `
              INSERT INTO transactions (user_id, product_id, quantity, purchase_date)
              VALUES (
                (SELECT id FROM users WHERE LOWER(TRIM(full_name)) = LOWER(TRIM($1))),
                (SELECT id FROM products WHERE LOWER(TRIM(name)) = LOWER(TRIM($2))),
                $3, $4
              )
              ON CONFLICT (user_id, product_id, purchase_date) 
              DO UPDATE SET quantity = EXCLUDED.quantity;
            `;
            for (const transaction of transactions) {
              await client.query(query, transaction);
            }
            console.log('✅ Импорт транзакций завершен.');
            resolve();
          } catch (err) {
            reject(err);
          }
        });
    });

    console.log('✅ Импорт всех данных завершен.');

  } catch (err) {
    console.error('❌ Ошибка при импорте данных:', err);
  } finally {
    client.release();
  }
};

importData();