const { ipcRenderer } = require('electron');

// Элементы формы
const form = document.getElementById('member-form');
const backButton = document.getElementById('back-button');

// ID редактируемого пользователя
let editingUserId = null;

// Функция для проверки поля ФИО
function validateFullName(value) {
    if (!value.trim()) {
        return 'ФИО не может быть пустым';
    }
    return '';
}

// Функция для проверки даты рождения
function validateBirthDate(value) {
    if (!value) {
        return 'Дата рождения обязательна';
    }
    const birthDate = new Date(value);
    const today = new Date();
    if (birthDate > today) {
        return 'Дата рождения не может быть в будущем';
    }
    return '';
}

// Функция для проверки зарплаты
function validateSalary(value) {
    if (value && value < 0) {
        return 'Доход не может быть отрицательным';
    }
    return '';
}

// Функция для отображения ошибки
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }
}

// Загрузка данных пользователя при редактировании
async function loadUserData() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    
    if (userId) {
        editingUserId = userId;
        try {
            const userData = await ipcRenderer.invoke('get-user-data', userId);
            if (userData) {
                document.getElementById('fullName').value = userData.full_name;
                //формат даты YYYY-MM-DD
                const birthDate = userData.birth_date instanceof Date 
                    ? userData.birth_date.toISOString().split('T')[0]
                    : typeof userData.birth_date === 'string'
                        ? userData.birth_date.split('T')[0]
                        : '';
                document.getElementById('birthDate').value = birthDate;
                document.getElementById('position').value = userData.position || '';
                document.getElementById('organization').value = userData.organization || '';
                document.getElementById('salary').value = userData.salary || '';
            }
        } catch (err) {
            console.error('Ошибка при загрузке данных пользователя:', err);
            showMessage('Не удалось загрузить данные пользователя', 'error');
        }
    }
}

// Обработка отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Получаем значения полей
    const fullName = document.getElementById('fullName').value;
    const birthDate = document.getElementById('birthDate').value;
    const position = document.getElementById('position').value;
    const organization = document.getElementById('organization').value;
    const salary = document.getElementById('salary').value;

    // Проверяем обязательные поля
    let hasErrors = false;
    const fullNameError = validateFullName(fullName);
    const birthDateError = validateBirthDate(birthDate);
    const salaryError = validateSalary(salary);

    showError('fullName', fullNameError);
    showError('birthDate', birthDateError);
    showError('salary', salaryError);

    if (fullNameError || birthDateError || salaryError) {
        hasErrors = true;
    }

    if (!hasErrors) {
        try {
            const userData = {
                id: editingUserId,
                full_name: fullName,
                birth_date: birthDate,
                position: position,
                organization: organization,
                salary: salary ? parseInt(salary) : 0
            };

            await ipcRenderer.invoke('save-user-data', userData);
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Ошибка при сохранении данных:', err);
            showMessage('Не удалось сохранить данные', 'error');
        }
    }
});

// Обработка кнопки "Назад"
backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Функция для отображения сообщений
function showMessage(text, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    const form = document.getElementById('member-form');
    form.insertBefore(messageDiv, form.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Загружаем данные при открытии страницы
document.addEventListener('DOMContentLoaded', loadUserData);
