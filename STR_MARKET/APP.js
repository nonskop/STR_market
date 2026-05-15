const express = require('express');
const cors = require('cors'); 
const { registerUser, loginUser } = require('./AUTH.js');
const db = require('./database.js'); // Импортируем базу данных

const app = express(); 
const PORT = 3000;

// 1. Настройка дополнений (Middleware)
app.use(cors()); 
app.use(express.json());

// 2. Логирование входящих запросов
app.use((req, res, next) => {
    console.log(`\n[${new Date().toLocaleString()}] ${req.method} запрос на ${req.url}`);
    
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Тело запроса:', req.body);
    }
    next();
});

// 3. Тестовый эндпоинт
app.get('/', (req, res) => {
    res.send(`<h1>Сервер STR_Market запущен!</h1><p>Порт: ${PORT}</p>`);
});

// --- НОВОЕ: Эндпоинт для получения товаров из БД ---
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Ошибка при чтении товаров:', err.message);
            return res.status(500).json({ error: "Ошибка сервера при получении товаров" });
        }
        // Отправляем список товаров фронтенду
        res.json(rows);
    });
});

// 4. Эндпоинт для регистрации
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: "Поля username и password обязательны" });
    }

    try {
        const user = await registerUser(username, password);
        console.log('Успех: Пользователь создан с ID:', user.id);
        res.status(201).json({ 
            message: 'Пользователь успешно зарегистрирован', 
            userId: user.id 
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(400).json({ error: error });
    }
});

// 5. Эндпоинт для входа
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: "Введите логин и пароль" });
    }

    try {
        const user = await loginUser(username, password);
        console.log('Успех: Вход выполнен для', username);
        res.json({ 
            message: 'Вход выполнен успешно', 
            user: { id: user.id, username: user.username, role: user.role } 
        });
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(401).json({ error: error });
    }
});

// Эндпоинт для добавления нового товара
app.post('/api/products', (req, res) => {
    const { title, price, description, category } = req.body;

    if (!title || !price) {
        return res.status(400).json({ error: "Название и цена обязательны" });
    }

    const sql = `INSERT INTO products (title, price, description, category) VALUES (?, ?, ?, ?)`;
    const params = [title, price, description, category];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: "Товар успешно добавлен" });
    });
});
// Добавьте в APP.js после POST эндпоинта:

// Эндпоинт для удаления товара
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = `DELETE FROM products WHERE id = ?`;
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Ошибка при удалении:', err.message);
            return res.status(500).json({ error: "Ошибка при удалении товара" });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "Товар не найден" });
        }
        
        res.json({ message: "Товар успешно удален" });
    });
});
// Запуск сервера
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`==========================================\n`);
});