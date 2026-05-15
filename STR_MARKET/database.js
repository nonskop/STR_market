const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к файлу базы данных
const dbPath = path.resolve(__dirname, 'str_market.db');

// Подключение к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Критическая ошибка при подключении к БД:', err.message);
    } else {
        console.log('--- Успешное подключение к SQLite: STR_Market ---');
    }
});

// Инициализация структуры таблиц
db.serialize(() => {
    // 1. Таблица товаров
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            description TEXT,
            category TEXT,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Ошибка создания таблицы products:', err.message);
        else console.log('✓ Таблица products проверена');
    });

    // 2. Таблица пользователей
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Ошибка создания таблицы users:', err.message);
        else console.log('✓ Таблица users проверена');
    });

    // 3. Проверка и заполнение данными
    db.get("SELECT count(*) as count FROM products", (err, row) => {
        if (err) {
            console.error('Ошибка проверки данных:', err.message);
            return;
        }

        console.log(`Инфо: Сейчас в базе ${row.count} товаров.`);

        if (row.count === 0) {
            console.log('База пуста. Начинаю добавление стартовых товаров...');
            
            const insertSql = `INSERT INTO products (title, price, description, category) VALUES (?, ?, ?, ?)`;
            
            const initialProducts = [
                ['AK-12', 25900, 'Новейший автомат Калашникова, 5.45мм', 'rifles'],
                ['Glock 18C', 8490, 'Газовый пистолет с режимом автоогня', 'pistols'],
                ['Баллистический щит', 6200, 'Легкий поликарбонатный щит "Вант"', 'equipment'],
                ['M4A1 Carbine', 21500, 'Классика западного вооружения', 'rifles']
            ];

            initialProducts.forEach((item) => {
                db.run(insertSql, item, (err) => {
                    if (err) console.error(`Ошибка при добавлении ${item[0]}:`, err.message);
                    else console.log(`+ Товар добавлен: ${item[0]}`);
                });
            });
        }
    });
});

module.exports = db;