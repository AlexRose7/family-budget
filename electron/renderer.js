const { ipcRenderer } = require('electron');

// Функция для форматирования возраста
function formatAge(age) {
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return `${age} лет`;
    }

    switch (lastDigit) {
        case 1:
            return `${age} год`;
        case 2:
        case 3:
        case 4:
            return `${age} года`;
        default:
            return `${age} лет`;
    }
}

// Обновление данных о бюджете
async function updateBudgetStatus() {
    const resultElement = document.getElementById('result');
    if (!resultElement) {
        console.error('Элемент result не найден');
        return;
    }

    try {
        const budgetData = await ipcRenderer.invoke('get-budget-data');
        if (!budgetData) {
            throw new Error('Нет данных о бюджете');
        }

        const income = parseFloat(budgetData.income) || 0;
        const expenses = parseFloat(budgetData.expenses) || 0;
        const expensesByCategory = budgetData.expensesByCategory || [];

        const ratio = income > 0 ? expenses / income : 0;
        const status = ratio < 1 ? 'Профицит бюджета' : 'Дефицит бюджета';
        const statusClass = ratio < 1 ? 'success' : 'warning';

        // Формируем HTML для расходов по категориям
        const categoriesHtml = expensesByCategory
            .map(cat => `
                <div class="expense-category">
                    <span class="category-name">${cat.category}</span>
                    <span class="category-amount">${parseInt(cat.expenses).toLocaleString()} руб.</span>
                </div>
            `)
            .join('');

        resultElement.innerHTML = `
            <div class="budget-summary">
                <div class="total-budget">
                    <p>Доход: ${income.toLocaleString()} руб.</p>
                    <p>Расходы: ${expenses.toLocaleString()} руб.</p>
                    <p class="${statusClass}">${status}</p>
                    <p>Соотношение трат к доходу: ${ratio.toFixed(2)}</p>
                </div>
                ${expensesByCategory.length > 0 ? `
                    <div class="expenses-by-category">
                        <h3>Расходы по категориям</h3>
                        ${categoriesHtml}
                    </div>
                ` : ''}
            </div>
        `;

    } catch (err) {
        console.error('Ошибка при получении данных бюджета:', err);
        showMessage('Не удалось получить данные бюджета', 'error');
    }
}

// Обновление списка членов семьи
async function updateFamilyMembers() {
    const familyList = document.getElementById('family-list');
    if (!familyList) {
        console.error('Элемент family-list не найден');
        return;
    }

    try {
        const familyMembers = await ipcRenderer.invoke('get-family-members');
        familyList.innerHTML = '';

        if (familyMembers.length === 0) {
            familyList.innerHTML = '<p class="empty-list">Список членов семьи пуст</p>';
            return;
        }

        familyMembers.forEach(member => {
            const listItem = document.createElement('div');
            listItem.classList.add('family-item');
            
            // Определяем статус бюджета
            const ratio = parseFloat(member.budgetRatio);
            const status = ratio < 1 ? 'Профицит бюджета' : 'Дефицит бюджета';
            const statusClass = ratio < 1 ? 'success' : 'warning';

            listItem.innerHTML = `
                <div class="family-info">
                    <strong>${member.name}</strong>
                    <span>Возраст: ${formatAge(member.age)}</span>
                    <span>Должность: ${member.position || 'Безработный'}</span>
                    <span>Место работы: ${member.organization || '-'}</span>
                    <span>Оклад: ${member.salary ? member.salary.toLocaleString() + ' руб.' : '0 руб.'}</span>
                </div>
                <div class="budget-ratio ${statusClass}">
                    <strong>Соотношение трат к доходу:</strong>
                    <span>${ratio.toFixed(2)}</span>
                    <div class="status">${status}</div>
                </div>
            `;

            // Добавляем обработчик для редактирования
            listItem.addEventListener('click', () => {
                window.location.href = `edit-member.html?id=${member.id}`;
            });

            familyList.appendChild(listItem);
        });
    } catch (err) {
        console.error('Ошибка при получении данных о членах семьи:', err);
        showMessage('Не удалось получить данные о членах семьи', 'error');
    }
}

// Показ сообщений пользователю
function showMessage(text, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Инициализация страницы
function initializePage() {
    // Обновляем данные при загрузке
    if (document.getElementById('result')) {
        updateBudgetStatus();
    }
    
    if (document.getElementById('family-list')) {
        updateFamilyMembers();
    }

    // Добавляем обработчики событий
    const addMemberButton = document.getElementById('add-member');
    if (addMemberButton) {
        addMemberButton.addEventListener('click', () => {
            window.location.href = 'edit-member.html';
        });
    }

    const calculateButton = document.getElementById('calculate-button');
    if (calculateButton) {
        calculateButton.addEventListener('click', updateBudgetStatus);
    }
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', initializePage);

