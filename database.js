const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'str_market.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Критическая ошибка при подключении к БД:', err.message);
    } else {
        console.log('--- Успешное подключение к SQLite: STR_Market ---');
    }
});

db.serialize(() => {
    // Таблица товаров
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

    // Таблица акций
    db.run(`
        CREATE TABLE IF NOT EXISTS promotions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            original_price REAL NOT NULL,
            discount_price REAL NOT NULL,
            discount_percent INTEGER NOT NULL,
            description TEXT,
            category TEXT,
            image_url TEXT,
            end_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Ошибка создания таблицы promotions:', err.message);
        else console.log('✓ Таблица promotions проверена');
    });

    // Таблица пользователей
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

    // Создание админа по умолчанию (если не существует)
    const defaultAdmin = { username: 'admin', password: 'admin123' };
    bcrypt.hash(defaultAdmin.password, 10, (err, hash) => {
        if (!err) {
            db.run(`
                INSERT OR IGNORE INTO users (username, password_hash, role) 
                VALUES (?, ?, 'admin')
            `, [defaultAdmin.username, hash], (err) => {
                if (!err) console.log('✓ Администратор по умолчанию: admin / admin123');
            });
        }
    });

    // Заполнение товарами
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