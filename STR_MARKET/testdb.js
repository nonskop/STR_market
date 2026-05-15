const db = require('./database.js');

const product = {
    title: 'Custom Rig for Cinema 4D',
    price: 4500,
    stock: 10,
    description: 'Essential rig for motion designers'
};

const sql = `INSERT INTO products (title, price, stock, description) VALUES (?, ?, ?, ?)`;

db.run(sql, [product.title, product.price, product.stock, product.description], function(err) {
    if (err) {
        return console.error('Ошибка при вставке:', err.message);
    }
    console.log(`Успех! Товар добавлен с ID: ${this.lastID}`);
});

// Закрываем соединение после работы
db.close();