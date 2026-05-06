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

    let isLogin = true;

    function openModal() {
        modalOverlay.style.display = 'flex';
    }

    function closeModalFunc() {
        modalOverlay.style.display = 'none';
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

    modalActionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLogin) {
            if (emailInput.value.trim() !== '' && passInput.value.trim() !== '') {
                alert(`Добро пожаловать, ${emailInput.value} (имитация входа)`);
                closeModalFunc();
            } else {
                alert('Заполните поля для входа');
            }
        } else {
            if (emailInput.value.trim() !== '' && passInput.value.trim() !== '') {
                alert(`Аккаунт ${emailInput.value} зарегистрирован (демо)`);
                closeModalFunc();
            } else {
                alert('Введите email и пароль для регистрации');
            }
        }
    });

    document.querySelector('.cart-icon').addEventListener('click', () => {
        alert('Переход в корзину (демо)');
    });

    document.querySelector('.hero-btn').addEventListener('click', () => {
        alert('Каталог товаров (демо)');
    });

    document.querySelectorAll('.btn-card').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Товар добавлен в корзину (имитация)');
        });
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
})();