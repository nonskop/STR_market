const db = require('./database.js');
const bcrypt = require('bcrypt');

// Функция регистрации
async function registerUser(username, password) {
    const saltRounds = 10;
    // Хешируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `INSERT INTO users (username, password_hash) VALUES (?, ?)`;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    reject('Этот логин уже занят');
                } else {
                    reject(err.message);
                }
            } else {
                // Возвращаем объект пользователя
                resolve({ id: this.lastID, username });
            }
        });
    });
}

// Функция входа
async function loginUser(username, password) {
    const sql = `SELECT * FROM users WHERE username = ?`;

    return new Promise((resolve, reject) => {
        db.get(sql, [username], async (err, user) => {
            if (err) {
                return reject(err.message);
            }
            if (!user) {
                return reject('Пользователь не найден');
            }

            // Сравниваем пришедший пароль с хешем из базы
            const match = await bcrypt.compare(password, user.password_hash);
            
            if (match) {
                resolve(user); // Пароли совпали
            } else {
                reject('Неверный пароль');
            }
        });
    });
}

// КРИТИЧЕСКИ ВАЖНО: Экспортируем функции
module.exports = { 
    registerUser, 
    loginUser 
};