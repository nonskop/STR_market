(function() {
    const modalOverlay = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const btnText = document.getElementById('btnText');
    const modalActionBtn = document.getElementById('modalActionBtn');
    const switchModal = document.getElementById('switchModal');
    const emailInput = document.getElementById('emailInput');
    const passInput = document.getElementById('passInput');
    
    const productsContainer = document.getElementById('products-container');
    
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

    // --- УПРАВЛЕНИЕ АДМИН-ПАНЕЛЬЮ ---
    function checkAdminAccess() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            
            // Проверяем, является ли пользователь администратором (username === 'nonskop')
            const isAdmin = currentUser.username === 'nonskop';
            
            if (isAdmin) {
                adminPanelBtn.style.display = 'flex';
                
                // Обновляем статус в админ-панели
                if (adminUserStatus) {
                    adminUserStatus.innerHTML = `<i class="fas fa-user-shield"></i> ${currentUser.username} (Администратор)`;
                }
                
                // Показываем админ-панель только для администратора
                adminPanel.classList.remove('hidden');
                console.log("Админ-панель открыта для пользователя:", currentUser.username);
            } else {
                // Обычный пользователь - скрываем админ-панель
                adminPanelBtn.style.display = 'none';
                adminPanel.classList.add('hidden');
                console.log("Обычный пользователь:", currentUser.username, "- админ-панель скрыта");
            }
        } else {
            adminPanelBtn.style.display = 'none';
            adminPanel.classList.add('hidden');
            currentUser = null;
        }
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

    // Закрыть/свернуть админ-панель
    function closeAdminPanel() {
        adminPanel.classList.add('hidden');
    }

    // Открыть админ-панель
    function openAdminPanel() {
        if (currentUser && currentUser.username === 'nonskop') {
            adminPanel.classList.remove('hidden');
        } else if (currentUser) {
            alert('У вас нет прав администратора');
        } else {
            alert('Сначала войдите в аккаунт');
            openModal();
        }
    }

    // Кнопка добавления товара
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', async () => {
            const title = document.getElementById('admin-title').value.trim();
            const price = parseFloat(document.getElementById('admin-price').value);
            const category = document.getElementById('admin-category').value.trim();
            const description = document.getElementById('admin-desc').value.trim();

            if (!title || isNaN(price)) {
                alert('Укажите как минимум название и корректную цену');
                return;
            }

            const productData = { title, price, category, description };

            try {
                const response = await fetch('http://localhost:3000/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });

                if (response.ok) {
                    alert('✅ Товар успешно добавлен в арсенал!');
                    document.getElementById('admin-title').value = '';
                    document.getElementById('admin-price').value = '';
                    document.getElementById('admin-category').value = '';
                    document.getElementById('admin-desc').value = '';
                    fetchProducts();
                } else {
                    const errorData = await response.json();
                    alert(`❌ Ошибка при добавлении: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось связаться с сервером');
            }
        });
    }

    // --- ЛОГИКА ОТРИСОВКИ ТОВАРОВ ИЗ БД ---
    async function fetchProducts() {
        if (!productsContainer) return;

        try {
            const response = await fetch('http://localhost:3000/api/products');
            const products = await response.json();

            productsContainer.innerHTML = ''; 

            if (products.length === 0) {
                productsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Склад пуст...</p>';
                return;
            }

            const isAdmin = currentUser && currentUser.username === 'nonskop';

            products.forEach(product => {
                let iconClass = 'fa-crosshairs';
                if (product.category === 'rifles') iconClass = 'fa-gun';
                if (product.category === 'pistols') iconClass = 'fa-hand-gun';
                if (product.category === 'equipment') iconClass = 'fa-shield-halved';

                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <div class="product-image">
                        <i class="fas ${iconClass}" style="font-size:4rem;"></i>
                    </div>
                    <div class="product-info">
                        <div class="product-title">${escapeHtml(product.title)}</div>
                        <div class="product-desc">${escapeHtml(product.description || 'Описание отсутствует')}</div>
                        <div class="price-row">
                            <span class="price">${product.price.toLocaleString()} ₽</span>
                        </div>
                        <button class="btn-card" onclick="addToCart('${escapeHtml(product.title)}')">
                            <i class="fas fa-shopping-cart"></i> В корзину
                        </button>
                        ${isAdmin ? `<button class="btn-delete" data-id="${product.id}" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash-alt"></i> Удалить
                        </button>` : ''}
                    </div>
                `;
                productsContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Ошибка при загрузке товаров:', error);
            productsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Ошибка подключения к арсеналу (сервер выключен?)</p>';
        }
    }

    // Функция удаления товара
    window.deleteProduct = async function(id) {
        if (!confirm('Удалить этот товар?')) return;
        
        try {
            const response = await fetch(`http://localhost:3000/api/products/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Товар удален');
                fetchProducts();
            } else {
                alert('Ошибка при удалении');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось связаться с сервером');
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

    window.addToCart = function(title) {
        alert(`Товар "${title}" добавлен в корзину!`);
    };

    // --- МОДАЛЬНОЕ ОКНО ---
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
            btnText.innerText = 'Войти';
            modalActionBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
            switchModal.innerText = 'Нет аккаунта? Зарегистрироваться';
        } else {
            modalTitle.innerText = 'Регистрация';
            btnText.innerText = 'Зарегистрироваться';
            modalActionBtn.innerHTML = '<i class="fas fa-user-plus"></i> Зарегистрироваться';
            switchModal.innerText = 'Уже есть аккаунт? Войти';
        }
    }

    loginBtn.addEventListener('click', () => {
        setModalMode(true);
        openModal();
    });

    registerBtn.addEventListener('click', () => {
        setModalMode(false);
        openModal();
    });

    closeModal.addEventListener('click', closeModalFunc);

    switchModal.addEventListener('click', () => {
        setModalMode(!isLogin);
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModalFunc();
    });

    // --- ОТПРАВКА НА СЕРВЕР (АВТОРИЗАЦИЯ) ---
    modalActionBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const username = emailInput.value.trim();
        const password = passInput.value.trim();

        if (!username || !password) {
            alert('Заполните все поля');
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
                    alert(`Добро пожаловать, ${data.user.username}!`);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    closeModalFunc();
                    checkAdminAccess();
                    fetchProducts();
                } else {
                    alert('Регистрация прошла успешно! Теперь войдите в аккаунт.');
                    setModalMode(true);
                }
            } else {
                alert(`Ошибка: ${data.error}`);
            }
        } catch (error) {
            console.error('Ошибка сервера:', error);
            alert('Сервер недоступен.');
        }
    });

    // --- ФИЛЬТРЫ ---
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // --- СОБЫТИЯ АДМИН-ПАНЕЛИ ---
    if (adminPanelHeader) {
        adminPanelHeader.addEventListener('click', toggleAdminPanel);
    }
    
    if (closeAdminPanelBtn) {
        closeAdminPanelBtn.addEventListener('click', closeAdminPanel);
    }
    
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', openAdminPanel);
    }

    // --- ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ ---
    fetchProducts();
    checkAdminAccess();
})();