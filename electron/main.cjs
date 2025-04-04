const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { connectDB, queryDB } = require('./db.cjs');
const calculateBudgetBalance = require('../app/budget.cjs');

// Функция для получения данных одного пользователя
async function getUserData(userId) {
    try {
        const userData = await queryDB(`
            SELECT 
                u.id,
                u.full_name,
                u.birth_date,
                j.position,
                j.organization,
                j.salary
            FROM users u
            LEFT JOIN jobs j ON u.id = j.user_id
            WHERE u.id = $1;
        `, [userId]);

        if (!userData || userData.length === 0) {
            throw new Error('Пользователь не найден');
        }

        return userData[0];
    } catch (err) {
        console.error('Ошибка при получении данных пользователя:', err);
        throw err;
    }
}

// Функция для сохранения данных пользователя
async function saveUserData(userData) {
    console.log('Полученные данные:', userData);

    let client;
    try {
        // Преобразуем дату в правильный формат
        const birthDate = new Date(userData.birth_date);
        if (isNaN(birthDate.getTime())) {
            throw new Error('Некорректная дата рождения');
        }

        // Получаем клиента из пула
        client = await connectDB();
        console.log('Подключение к БД успешно');

        // Начинаем транзакцию
        await client.query('BEGIN');
        console.log('Начата транзакция');

        if (userData.id) {
            // Обновляем существующего пользователя
            console.log('Обновление пользователя:', userData.id);
            const updateUserResult = await client.query(
                'UPDATE users SET full_name = $1, birth_date = $2 WHERE id = $3 RETURNING id',
                [userData.full_name, birthDate.toISOString(), userData.id]
            );

            if (updateUserResult.rowCount === 0) {
                throw new Error('Пользователь не найден');
            }

            // Обновляем информацию о работе
            console.log('Обновление информации о работе');
            await client.query(
                `INSERT INTO jobs (user_id, position, organization, salary, start_date)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id) DO UPDATE
                SET position = $2, organization = $3, salary = $4, start_date = $5`,
                [userData.id, userData.position || '', userData.organization || '', userData.salary || 0, new Date()]
            );
        } else {
            // Создаем нового пользователя
            console.log('Создание нового пользователя');
            const insertUserResult = await client.query(
                'INSERT INTO users (full_name, birth_date) VALUES ($1, $2) RETURNING id',
                [userData.full_name, birthDate.toISOString()]
            );

            const userId = insertUserResult.rows[0].id;

            // Добавляем информацию о работе
            console.log('Добавление информации о работе');
            await client.query(
                'INSERT INTO jobs (user_id, position, organization, salary, start_date) VALUES ($1, $2, $3, $4, $5)',
                [userId, userData.position || '', userData.organization || '', userData.salary || 0, new Date()]
            );
        }

        // Завершаем транзакцию
        await client.query('COMMIT');
        console.log('Транзакция завершена успешно');
        return true;
    } catch (err) {
        console.error('Подробная ошибка:', err);
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.log('Транзакция отменена');
            } catch (rollbackErr) {
                console.error('Ошибка при откате транзакции:', rollbackErr);
            }
        }
        throw new Error('Не удалось сохранить даные пользователя: ' + err.message);
    } finally {
        // Возвращаем клиент в пул
        if (client) {
            client.release();
            console.log('Клиент возвращен в пул');
        }
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.join(__dirname, 'views', 'index.html')).catch(err => {
        console.error('Ошибка загрузки index.html:', err);
    });
}

// Подключаемся к базе данных
app.whenReady().then(async () => {
    try {
        await connectDB(); // Подключаемся к БД
        createWindow();

        // Обработчик для получения данных пользователя
        ipcMain.handle('get-user-data', async (event, userId) => {
            try {
                return await getUserData(userId);
            } catch (err) {
                console.error('Ошибка при получении данных пользователя:', err);
                throw new Error('Не удалось получить данные пользователя');
            }
        });

        // Обработчик для сохранения данных пользователя
        ipcMain.handle('save-user-data', async (event, userData) => {
            try {
                return await saveUserData(userData);
            } catch (err) {
                console.error('Ошибка при сохранении данных пользователя:', err);
                throw new Error('Не удалось сохранить данные пользователя');
            }
        });

        // Обработчик для получения списка членов семьи
        ipcMain.handle('get-family-members', async () => {
            try {
                const familyMembers = await queryDB(`
                    SELECT 
                        u.id,
                        u.full_name,
                        EXTRACT(YEAR FROM AGE(u.birth_date)) AS age,
                        COALESCE(j.position, 'Безработный') AS position,
                        COALESCE(j.organization, '-') AS organization,
                        COALESCE(j.salary, 0) AS salary
                    FROM users u
                    LEFT JOIN jobs j ON u.id = j.user_id
                    ORDER BY u.full_name;
                `);

                if (!familyMembers) {
                    throw new Error('Не удалось получить данные о членах семьи');
                }

                // Получаем доход и расходы для каждого пользователя
                const familyData = await Promise.all(familyMembers.map(async (member) => {
                    // Получаем доход
                    const incomeResult = await queryDB(`
                        SELECT COALESCE(salary, 0) AS income
                        FROM jobs
                        WHERE user_id = $1;
                    `, [member.id]);

                    const income = incomeResult[0]?.income || 0;

                    // Получаем расходы для данного пользователя за последний месяц, включая дату покупки
                    const expensesResult = await queryDB(`
                        SELECT 
                            COALESCE(SUM(t.quantity * p.price), 0) AS expenses,
                            t.purchase_date
                        FROM transactions t
                        JOIN products p ON t.product_id = p.id
                        WHERE t.user_id = $1
                        AND t.purchase_date >= NOW() - INTERVAL '1 month'
                        GROUP BY t.purchase_date
                        ORDER BY t.purchase_date DESC;
                    `, [member.id]);

                    // Собираем все расходы по датам и суммам
                    const expensesData = expensesResult.map(item => ({
                        purchaseDate: item.purchase_date,
                        expenses: item.expenses
                    }));

                    // Рассчитываем соотношение трат к доходу за последний месяц
                    const totalExpenses = expensesData.reduce((acc, item) => acc + item.expenses, 0);
                    const monthlyIncome = income || 0;
                    const budgetRatio = monthlyIncome ? (totalExpenses / monthlyIncome) : 0;

                    return {
                        id: member.id,
                        name: member.full_name,
                        age: member.age,
                        position: member.position,
                        organization: member.organization,
                        salary: member.salary,
                        budgetRatio: budgetRatio.toFixed(2),
                        expenses: expensesData,
                        totalExpenses: totalExpenses,
                        monthlyIncome: monthlyIncome
                    };
                }));

                return familyData;
            } catch (err) {
                console.error('Ошибка при получении данных о членах семьи:', err);
                throw new Error('Не удалось получить данные о членах семьи');
            }
        });

        // Обработчик запроса на получение данных бюджета
        ipcMain.handle('get-budget-data', async () => {
            try {
                console.log('Обработчик get-budget-data вызван');
                
                // Получаем доход для всех пользователей
                const incomeResult = await queryDB(`
                    SELECT COALESCE(SUM(salary), 0) AS income
                    FROM jobs;
                `);
                if (!incomeResult || !incomeResult[0]) {
                    console.log('Нет данных о доходах');
                    return { income: 0, expenses: 0, expensesByCategory: [] };
                }
                const income = parseInt(incomeResult[0].income) || 0;
                console.log('Доход:', income);

                // Получаем общие расходы за последний месяц
                const totalExpensesResult = await queryDB(`
                    SELECT COALESCE(SUM(t.quantity * p.price), 0) AS total_expenses
                    FROM transactions t
                    JOIN products p ON t.product_id = p.id
                    WHERE t.purchase_date >= NOW() - INTERVAL '1 month';
                `);
                const totalExpenses = parseInt(totalExpensesResult[0]?.total_expenses) || 0;
                console.log('Расходы:', totalExpenses);

                // Получаем расходы по категориям
                const expensesByCategory = await queryDB(`
                    SELECT 
                        c.name as category,
                        COALESCE(SUM(t.quantity * p.price), 0) AS expenses
                    FROM categories c
                    LEFT JOIN products p ON p.category_id = c.id
                    LEFT JOIN transactions t ON t.product_id = p.id
                        AND t.purchase_date >= NOW() - INTERVAL '1 month'
                    GROUP BY c.name
                    ORDER BY expenses DESC;
                `);

                return {
                    income,
                    expenses: totalExpenses,
                    expensesByCategory: expensesByCategory || []
                };
            } catch (err) {
                console.error('Ошибка при получении данных бюджета:', err);
                throw err;
            }
        });

        // Обработчик для расчета бюджета
        ipcMain.handle('calculate-budget', async () => {
            try {
                // Получаем общий доход
                const incomeResult = await queryDB(`
                    SELECT COALESCE(SUM(salary), 0) AS income
                    FROM jobs
                    JOIN users ON jobs.user_id = users.id;
                `);
                const income = incomeResult[0].income;

                // Получаем расходы
                const expensesResult = await queryDB(`
                    SELECT COALESCE(SUM(t.quantity * p.price), 0) AS expenses
                    FROM transactions t
                    JOIN products p ON t.product_id = p.id
                    WHERE t.purchase_date >= NOW() - INTERVAL '1 month';
                `);
                const expenses = expensesResult[0].expenses;

                // Возвращаем результат расчёта
                return calculateBudgetBalance(income, expenses);
            } catch (err) {
                console.error('Ошибка при расчете бюджета:', err);
                throw new Error('Не удалось вычислить баланс');
            }
        });

    } catch (err) {
        console.error('Ошибка при подключении к базе данных:', err);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});