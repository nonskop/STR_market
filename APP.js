const express = require('express');
const cors = require('cors'); 
const { registerUser, loginUser } = require('./AUTH.js');
const db = require('./database.js');

const app = express(); 
const PORT = 3000;

app.use(cors()); 
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
    console.log(`\n[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Тело запроса:', req.body);
    }
    next();
});

// Middleware для проверки прав администратора
function isAdmin(req, res, next) {
    const userRole = req.headers['x-user-role'];
    if (userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Доступ запрещен. Требуются права администратора." });
    }
}

// Тестовый эндпоинт
app.get('/', (req, res) => {
    res.send(`<h1>Сервер STR_Market запущен!</h1><p>Порт: ${PORT}</p>`);
});

// Получение всех товаров
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products ORDER BY id DESC";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Ошибка при чтении товаров:', err.message);
            return res.status(500).json({ error: "Ошибка сервера при получении товаров" });
        }
        res.json(rows);
    });
});

// Получение всех акций
app.get('/api/promotions', (req, res) => {
    const sql = "SELECT * FROM promotions ORDER BY id DESC";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Ошибка при чтении акций:', err.message);
            return res.status(500).json({ error: "Ошибка сервера при получении акций" });
        }
        res.json(rows);
    });
});

// Добавление товара в акции (только для админа)
app.post('/api/promotions', isAdmin, (req, res) => {
    const { title, original_price, discount_percent, description, category } = req.body;

    // Валидация
    if (!title || title.trim().length < 2) {
        return res.status(400).json({ error: "Название должно содержать минимум 2 символа" });
    }
    if (!original_price || original_price <= 0 || isNaN(original_price)) {
        return res.status(400).json({ error: "Цена должна быть положительным числом" });
    }
    if (original_price > 1000000) {
        return res.status(400).json({ error: "Цена не может превышать 1 000 000 ₽" });
    }
    if (!discount_percent || discount_percent <= 0 || discount_percent > 99 || isNaN(discount_percent)) {
        return res.status(400).json({ error: "Скидка должна быть от 1 до 99 процентов" });
    }
    if (description && description.length > 500) {
        return res.status(400).json({ error: "Описание не может превышать 500 символов" });
    }

    const discount_price = original_price * (1 - discount_percent / 100);
    
    const sql = `INSERT INTO promotions (title, original_price, discount_price, discount_percent, description, category) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [title.trim(), original_price, discount_price, discount_percent, description?.trim() || null, category?.trim() || null];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Ошибка БД:', err.message);
            return res.status(500).json({ error: "Ошибка при добавлении акции" });
        }
        res.status(201).json({ id: this.lastID, message: "Акция успешно добавлена" });
    });
});

// Удаление акции (только для админа)
app.delete('/api/promotions/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Неверный ID акции" });
    }
    
    const sql = `DELETE FROM promotions WHERE id = ?`;
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Ошибка при удалении:', err.message);
            return res.status(500).json({ error: "Ошибка при удалении акции" });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "Акция не найдена" });
        }
        
        res.json({ message: "Акция успешно удалена" });
    });
});

// Регистрация
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: "Поля username и password обязательны" });
    }
    
    if (username.length < 3) {
        return res.status(400).json({ error: "Логин должен содержать минимум 3 символа" });
    }
    
    if (password.length < 4) {
        return res.status(400).json({ error: "Пароль должен содержать минимум 4 символа" });
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

// Вход
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

// Добавление товара (только для админа)
app.post('/api/products', isAdmin, (req, res) => {
    const { title, price, description, category } = req.body;

    // Валидация
    if (!title || title.trim().length < 2) {
        return res.status(400).json({ error: "Название должно содержать минимум 2 символа" });
    }
    if (!price || price <= 0 || isNaN(price)) {
        return res.status(400).json({ error: "Цена должна быть положительным числом" });
    }
    if (price > 1000000) {
        return res.status(400).json({ error: "Цена не может превышать 1 000 000 ₽" });
    }
    if (description && description.length > 500) {
        return res.status(400).json({ error: "Описание не может превышать 500 символов" });
    }

    const sql = `INSERT INTO products (title, price, description, category) VALUES (?, ?, ?, ?)`;
    const params = [title.trim(), price, description?.trim() || null, category?.trim() || null];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Ошибка БД:', err.message);
            return res.status(500).json({ error: "Ошибка при добавлении товара" });
        }
        res.status(201).json({ id: this.lastID, message: "Товар успешно добавлен" });
    });
});

// Удаление товара (только для админа)
app.delete('/api/products/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Неверный ID товара" });
    }
    
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