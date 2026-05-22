(function() {
    const modalOverlay = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalActionBtn = document.getElementById('modalActionBtn');
    const switchModal = document.getElementById('switchModal');
    const emailInput = document.getElementById('emailInput');
    const passInput = document.getElementById('passInput');
    
    const promotionsContainer = document.getElementById('promotions-container');
    
    // Админ-панель элементы
    const adminPanel = document.getElementById('adminPanel');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const adminPanelHeader = document.getElementById('adminPanelHeader');
    const adminPanelContent = document.getElementById('adminPanelContent');
    const adminToggleIcon = document.getElementById('adminToggleIcon');
    const closeAdminPanelBtn = document.getElementById('closeAdminPanelBtn');
    const adminUserStatus = document.getElementById('adminUserStatus');

    let isLogin = true;
    let currentUser = null;
    let isAdminPanelCollapsed = false;
    
    // Корзина
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Обновление счетчика корзины
    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartBadge = document.getElementById('cartCount');
        if (cartBadge) cartBadge.textContent = count;
    }

    // Добавление в корзину
    window.addToCart = function(id, title, price) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, title, price, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff4757, #ff6b6b);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
            <span>✓ ${escapeHtml(title)} добавлен в корзину со скидкой!</span>
        `;
        notification.onclick = () => {
            window.location.href = 'cart.html';
        };
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    };

    // Предпросмотр цены со скидкой
    const originalPriceInput = document.getElementById('promo-original-price');
    const discountInput = document.getElementById('promo-discount');
    const previewPriceSpan = document.getElementById('previewPrice');

    function updateDiscountPreview() {
        const originalPrice = parseFloat(originalPriceInput?.value) || 0;
        const discount = parseFloat(discountInput?.value) || 0;
        if (originalPrice > 0 && discount > 0 && discount <= 99) {
            const discountedPrice = originalPrice * (1 - discount / 100);
            previewPriceSpan.textContent = Math.round(discountedPrice).toLocaleString();
        } else {
            previewPriceSpan.textContent = '0';
        }
    }

    if (originalPriceInput) {
        originalPriceInput.addEventListener('input', updateDiscountPreview);
    }
    if (discountInput) {
        discountInput.addEventListener('input', updateDiscountPreview);
    }

    // Проверка прав администратора
    function checkAdminAccess() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            
            const isAdmin = currentUser.role === 'admin';
            
            if (isAdmin) {
                adminPanelBtn.style.display = 'flex';
                
                if (adminUserStatus) {
                    adminUserStatus.innerHTML = `<i class="fas fa-user-shield"></i> ${currentUser.username} (Администратор)`;
                }
                
                adminPanel.classList.remove('hidden');
                console.log("Админ-панель открыта для пользователя:", currentUser.username);
            } else {
                adminPanelBtn.style.display = 'none';
                adminPanel.classList.add('hidden');
                console.log("Обычный пользователь:", currentUser.username);
            }
            
            if (logoutBtn) logoutBtn.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
        } else {
            adminPanelBtn.style.display = 'none';
            adminPanel.classList.add('hidden');
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'flex';
            if (registerBtn) registerBtn.style.display = 'flex';
            currentUser = null;
        }
    }

    // Выход из аккаунта
    window.logout = function() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            localStorage.removeItem('user');
            currentUser = null;
            window.location.reload();
        }
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Сворачивание/разворачивание админ-панели
    function toggleAdminPanel() {
        if (isAdminPanelCollapsed) {
            adminPanelContent.style.display = 'grid';
            adminToggleIcon.classList.remove('fa-chevron-down');
            adminToggleIcon.classList.add('fa-chevron-up');
            isAdminPanelCollapsed = false;
        } else {
            adminPanelContent.style.display = 'none';
            adminToggleIcon.classList.remove('fa-chevron-up');
            adminToggleIcon.classList.add('fa-chevron-down');
            isAdminPanelCollapsed = true;
        }
    }

    function closeAdminPanel() {
        adminPanel.classList.add('hidden');
    }

    function openAdminPanel() {
        if (currentUser && currentUser.role === 'admin') {
            adminPanel.classList.remove('hidden');
        } else if (currentUser) {
            alert('⛔ У вас нет прав администратора');
        } else {
            alert('🔐 Сначала войдите в аккаунт');
            openModal();
        }
    }

    // Добавление акции (админ)
    const addPromoBtn = document.getElementById('add-promo-btn');
    if (addPromoBtn) {
        addPromoBtn.addEventListener('click', async () => {
            if (!currentUser || currentUser.role !== 'admin') {
                alert('⛔ Доступ запрещен');
                return;
            }
            
            const title = document.getElementById('promo-title').value.trim();
            const original_price = parseFloat(document.getElementById('promo-original-price').value);
            const discount_percent = parseFloat(document.getElementById('promo-discount').value);
            const category = document.getElementById('promo-category').value.trim();
            const description = document.getElementById('promo-desc').value.trim();

            if (!title || title.length < 2) {
                alert('❌ Название должно содержать минимум 2 символа');
                return;
            }
            if (isNaN(original_price) || original_price <= 0) {
                alert('❌ Укажите корректную цену (больше 0)');
                return;
            }
            if (original_price > 1000000) {
                alert('❌ Цена не может превышать 1 000 000 ₽');
                return;
            }
            if (isNaN(discount_percent) || discount_percent <= 0 || discount_percent > 99) {
                alert('❌ Скидка должна быть от 1 до 99 процентов');
                return;
            }

            const promoData = { title, original_price, discount_percent, category, description };

            try {
                const response = await fetch('http://localhost:3000/api/promotions', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-User-Role': currentUser.role
                    },
                    body: JSON.stringify(promoData)
                });

                if (response.ok) {
                    alert('✅ Акция успешно добавлена!');
                    document.getElementById('promo-title').value = '';
                    document.getElementById('promo-original-price').value = '';
                    document.getElementById('promo-discount').value = '';
                    document.getElementById('promo-category').value = '';
                    document.getElementById('promo-desc').value = '';
                    updateDiscountPreview();
                    fetchPromotions();
                } else {
                    const errorData = await response.json();
                    alert(`❌ Ошибка: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('❌ Не удалось связаться с сервером');
            }
        });
    }

    // Фильтрация акций
    function filterPromotions(category) {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const productCategory = card.dataset.category;
            if (category === 'all' || productCategory === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Отрисовка акций
    async function fetchPromotions() {
        if (!promotionsContainer) return;

        try {
            const response = await fetch('http://localhost:3000/api/promotions');
            if (!response.ok) throw new Error('Ошибка загрузки');
            
            const promotions = await response.json();
            promotionsContainer.innerHTML = ''; 

            if (promotions.length === 0) {
                promotionsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">🔥 Акций пока нет. Скоро появятся!</p>';
                return;
            }

            const isAdmin = currentUser && currentUser.role === 'admin';

            promotions.forEach(promo => {
                let iconClass = 'fa-fire';
                if (promo.category === 'rifles') iconClass = 'fa-gun';
                if (promo.category === 'pistols') iconClass = 'fa-hand-gun';
                if (promo.category === 'equipment') iconClass = 'fa-shield-halved';

                const card = document.createElement('div');
                card.className = 'product-card promo-card';
                card.dataset.category = promo.category || 'other';
                card.innerHTML = `
                    <div class="promo-badge">
                        <i class="fas fa-fire fire-icon"></i> -${promo.discount_percent}%
                    </div>
                    <div class="product-image">
                        <i class="fas ${iconClass}" style="font-size:4rem;"></i>
                    </div>
                    <div class="product-info">
                        <div class="product-title">${escapeHtml(promo.title)}</div>
                        <div class="product-desc">${escapeHtml(promo.description || '🔥 Только по акции!')}</div>
                        <div class="price-row">
                            <span class="original-price">${promo.original_price.toLocaleString()} ₽</span>
                            <span class="discount-price">${promo.discount_price.toLocaleString()} ₽</span>
                            <span class="discount-percent">-${promo.discount_percent}%</span>
                        </div>
                        <button class="btn-card" onclick="addToCart(${promo.id}, '${escapeHtml(promo.title)}', ${promo.discount_price})">
                            <i class="fas fa-shopping-cart"></i> В корзину со скидкой
                        </button>
                        ${isAdmin ? `<button class="btn-delete" onclick="deletePromotion(${promo.id})">
                            <i class="fas fa-trash-alt"></i> Удалить акцию
                        </button>` : ''}
                    </div>
                `;
                promotionsContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Ошибка при загрузке акций:', error);
            promotionsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">❌ Ошибка подключения к серверу. Убедитесь, что сервер запущен (node APP.js)</p>';
        }
    }

    // Удаление акции
    window.deletePromotion = async function(id) {
        if (!currentUser || currentUser.role !== 'admin') {
            alert('⛔ Доступ запрещен');
            return;
        }
        
        if (!confirm('🗑️ Удалить эту акцию?')) return;
        
        try {
            const response = await fetch(`http://localhost:3000/api/promotions/${id}`, {
                method: 'DELETE',
                headers: { 'X-User-Role': currentUser.role }
            });
            
            if (response.ok) {
                alert('✅ Акция удалена');
                fetchPromotions();
            } else {
                const error = await response.json();
                alert(`❌ Ошибка: ${error.error}`);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('❌ Не удалось связаться с сервером');
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Модальное окно
    function openModal() {
        modalOverlay.style.display = 'flex';
    }

    function closeModalFunc() {
        modalOverlay.style.display = 'none';
        emailInput.value = '';
        passInput.value = '';
    }

    function setModalMode(loginMode) {
        isLogin = loginMode;
        if (isLogin) {
            modalTitle.innerText = 'Вход в аккаунт';
            modalActionBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
            switchModal.innerText = 'Нет аккаунта? Зарегистрироваться';
        } else {
            modalTitle.innerText = 'Регистрация';
            modalActionBtn.innerHTML = '<i class="fas fa-user-plus"></i> Зарегистрироваться';
            switchModal.innerText = 'Уже есть аккаунт? Войти';
        }
    }

    if (loginBtn) loginBtn.addEventListener('click', () => {
        setModalMode(true);
        openModal();
    });

    if (registerBtn) registerBtn.addEventListener('click', () => {
        setModalMode(false);
        openModal();
    });

    if (closeModal) closeModal.addEventListener('click', closeModalFunc);

    if (switchModal) switchModal.addEventListener('click', () => {
        setModalMode(!isLogin);
    });

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModalFunc();
        });
    }

    // Отправка на сервер (авторизация)
    if (modalActionBtn) {
        modalActionBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const username = emailInput.value.trim();
            const password = passInput.value.trim();

            if (!username || !password) {
                alert('❌ Заполните все поля');
                return;
            }
            
            if (!isLogin && username.length < 3) {
                alert('❌ Логин должен содержать минимум 3 символа');
                return;
            }
            
            if (!isLogin && password.length < 4) {
                alert('❌ Пароль должен содержать минимум 4 символа');
                return;
            }

            const endpoint = isLogin ? '/api/login' : '/api/register';

            try {
                const response = await fetch(`http://localhost:3000${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    if (isLogin) {
                        alert(`👋 Добро пожаловать, ${data.user.username}!`);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        closeModalFunc();
                        checkAdminAccess();
                        fetchPromotions();
                    } else {
                        alert('✅ Регистрация прошла успешно! Теперь войдите в аккаунт.');
                        setModalMode(true);
                    }
                } else {
                    alert(`❌ Ошибка: ${data.error}`);
                }
            } catch (error) {
                console.error('Ошибка сервера:', error);
                alert('❌ Сервер недоступен. Убедитесь, что он запущен (node APP.js)');
            }
        });
    }

    // Фильтры
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.dataset.category;
            filterPromotions(category);
        });
    });

    // События админ-панели
    if (adminPanelHeader) {
        adminPanelHeader.addEventListener('click', toggleAdminPanel);
    }
    
    if (closeAdminPanelBtn) {
        closeAdminPanelBtn.addEventListener('click', closeAdminPanel);
    }
    
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', openAdminPanel);
    }

    // Инициализация
    fetchPromotions();
    checkAdminAccess();
    updateCartCount();
})();