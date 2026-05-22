(function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Функция обновления счетчика в шапке
    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartBadge = document.getElementById('cartCount');
        if (cartBadge) cartBadge.textContent = count;
    }
    
    // Функция обновления отображения корзины
    function renderCart() {
        const cartContent = document.getElementById('cartContent');
        
        if (!cartContent) return;
        
        if (cart.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Ваша корзина пуста</p>
                    <a href="index.html" class="back-to-shop" style="display: inline-block;">
                        <i class="fas fa-arrow-left"></i> Перейти к покупкам
                    </a>
                </div>
            `;
            updateCartCount();
            return;
        }
        
        let subtotal = 0;
        
        cartContent.innerHTML = `
            <div class="cart-grid">
                <div class="cart-items">
                    ${cart.map(item => {
                        const itemTotal = item.price * item.quantity;
                        subtotal += itemTotal;
                        return `
                            <div class="cart-item" data-id="${item.id}">
                                <div class="cart-item-image">
                                    <i class="fas fa-box"></i>
                                </div>
                                <div class="cart-item-info">
                                    <div class="cart-item-title">${escapeHtml(item.title)}</div>
                                    <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                                </div>
                                <div class="cart-item-quantity">
                                    <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <span class="quantity-value">${item.quantity}</span>
                                    <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <div class="cart-item-total">
                                    ${itemTotal.toLocaleString()} ₽
                                </div>
                                <button class="remove-item" onclick="removeFromCart(${item.id})">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="cart-summary">
                    <h3>Итого</h3>
                    <div class="summary-row">
                        <span class="summary-label">Товары (${cart.reduce((sum, i) => sum + i.quantity, 0)} шт.)</span>
                        <span class="summary-value">${subtotal.toLocaleString()} ₽</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Доставка</span>
                        <span class="summary-value">Бесплатно</span>
                    </div>
                    <div class="summary-row total">
                        <span class="summary-label">К оплате</span>
                        <span class="summary-value">${subtotal.toLocaleString()} ₽</span>
                    </div>
                    <div class="cart-actions">
                        <button class="btn-checkout" onclick="checkout()">
                            <i class="fas fa-credit-card"></i> Оформить заказ
                        </button>
                        <button class="btn-clear" onclick="clearCart()">
                            <i class="fas fa-trash-alt"></i> Очистить корзину
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        updateCartCount();
    }
    
    // Функция изменения количества
    window.changeQuantity = function(productId, delta) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
            const newQuantity = cart[itemIndex].quantity + delta;
            if (newQuantity <= 0) {
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = newQuantity;
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    };
    
    // Функция удаления товара
    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        
        // Показываем уведомление
        showNotification('Товар удален из корзины', 'info');
    };
    
    // Функция очистки корзины
    window.clearCart = function() {
        if (confirm('Вы уверены, что хотите очистить всю корзину?')) {
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            showNotification('Корзина очищена', 'info');
        }
    };
    
    // Функция оформления заказа
    window.checkout = function() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Создаем модальное окно с деталями заказа
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        modal.innerHTML = `
            <div style="
                background: var(--card-bg);
                border-radius: 20px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                border: 1px solid var(--blue-accent);
                box-shadow: 0 0 40px rgba(30, 79, 138, 0.3);
            ">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #4caf50;"></i>
                </div>
                <h2 style="color: white; text-align: center; margin-bottom: 1rem;">Заказ оформлен!</h2>
                <p style="color: var(--text-dim); text-align: center; margin-bottom: 1rem;">
                    Спасибо за покупку! Это демо-версия магазина.
                </p>
                <div style="background: var(--admin-input-bg); padding: 1rem; border-radius: 12px; margin: 1rem 0;">
                    <p><strong style="color: white;">📦 Товаров:</strong> ${itemsCount} шт.</p>
                    <p><strong style="color: white;">💰 Сумма:</strong> ${subtotal.toLocaleString()} ₽</p>
                    <p><strong style="color: white;">🚚 Доставка:</strong> Бесплатно</p>
                </div>
                <p style="color: #ffa500; font-size: 0.9rem; text-align: center; margin-bottom: 1.5rem;">
                    ⚠️ Это бета-версия. В реальном магазине здесь будет оформление доставки и оплаты.
                </p>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    width: 100%;
                    padding: 1rem;
                    background: var(--blue-accent);
                    border: none;
                    color: white;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 1rem;
                ">
                    <i class="fas fa-check"></i> Хорошо
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    };
    
    // Функция уведомлений
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // Авторизация (копия из основного скрипта для шапки)
    let currentUser = null;
    
    function checkAuth() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            const logoutBtn = document.getElementById('logoutBtn');
            const loginBtn = document.getElementById('loginBtn');
            const registerBtn = document.getElementById('registerBtn');
            
            if (logoutBtn) logoutBtn.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
        }
    }
    
    function logout() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
    
    // Обработчики для кнопок авторизации
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    document.getElementById('registerBtn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Инициализация
    checkAuth();
    renderCart();
})();