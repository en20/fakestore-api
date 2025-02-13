class DessertShop {
    constructor() {
        this.items = [];
        this.total = 0;
        this.products = [];
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        // Carregar carrinho do localStorage se existir
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.updateCart();
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            this.products = await response.json();
            this.displayProducts(this.products);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.showNotification('Erro ao carregar produtos', 'error');
        }
    }

    displayProducts(products) {
        const grid = document.querySelector('.products-grid');
        grid.innerHTML = products.map(product => {
            const existingItem = this.items.find(item => item.id === product.id);
            const isInCart = !!existingItem;
            
            return `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.title}">
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <div class="cart-controls">
                            ${isInCart ? `
                                <div class="quantity-selector">
                                    <button class="quantity-btn" onclick="shop.decreaseQuantity(${product.id})">-</button>
                                    <span>${existingItem.quantity}</span>
                                    <button class="quantity-btn" onclick="shop.increaseQuantity(${product.id})">+</button>
                                </div>
                            ` : `
                                <button class="add-to-cart" onclick="shop.addToCart(${product.id})">
                                    <i class="fas fa-shopping-cart"></i>
                                    Add to Cart
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    addToCart(productId) {
        const product = this.findProduct(productId);
        if (product) {
            const existingItem = this.items.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({ ...product, quantity: 1 });
            }
            
            this.updateCart();
            this.displayProducts(this.products);
            this.showNotification('Item adicionado ao carrinho!', 'success');
            this.saveCart();
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    findProduct(productId) {
        return this.products.find(p => p.id === productId);
    }

    updateCart() {
        const cartItems = document.querySelector('.cart-items');
        const cartCount = document.querySelector('.cart-count');
        
        cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-info">
                    <h4>${item.title}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="shop.decreaseQuantity(${item.id})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="shop.increaseQuantity(${item.id})">+</button>
                </div>
            </div>
        `).join('');
        
        this.updateTotal();
    }

    updateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cartTotal').textContent = this.total.toFixed(2);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    showConfirmationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Confirmar Pedido</h2>
                <p>Total: $${this.total.toFixed(2)}</p>
                <p>Deseja confirmar seu pedido?</p>
                <div class="modal-buttons">
                    <button onclick="shop.confirmOrder()" class="confirm-btn">Confirmar</button>
                    <button onclick="shop.closeModal()" class="cancel-btn">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    }

    confirmOrder() {
        this.showNotification('Pedido confirmado com sucesso!', 'success');
        this.items = [];
        this.updateCart();
        this.saveCart();
        this.closeModal();
    }

    increaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            this.updateCart();
            this.displayProducts(this.products);
            this.saveCart();
        }
    }

    decreaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity -= 1;
            if (item.quantity === 0) {
                this.items = this.items.filter(i => i.id !== productId);
                this.showNotification('Item removido do carrinho', 'info');
            }
            this.updateCart();
            this.displayProducts(this.products);
            this.saveCart();
        }
    }

    setupEventListeners() {
        document.querySelector('.confirm-order').addEventListener('click', () => {
            if (this.items.length > 0) {
                this.showConfirmationModal();
            } else {
                this.showNotification('Seu carrinho está vazio!', 'error');
            }
        });

        // Cart toggle for mobile
        document.querySelector('.cart-icon').addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.body.classList.toggle('cart-open');
            }
        });

        // Close cart when clicking overlay
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !e.target.closest('.cart-section') && 
                !e.target.closest('.cart-icon') &&
                document.body.classList.contains('cart-open')) {
                document.body.classList.remove('cart-open');
            }
        });
    }
}

const shop = new DessertShop(); 