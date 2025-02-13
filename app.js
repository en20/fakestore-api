class DessertShop {
    constructor() {
        this.items = [];
        this.total = 0;
        this.products = [];
        this.currentCategory = 'all';
        this.notifications = [];
        this.createNotificationsContainer();
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
                <div class="product-card ${isInCart ? 'in-cart' : ''}">
                    <img src="${product.image}" alt="${product.title}">
                    <div class="cart-controls">
                        ${isInCart ? `
                            <div class="quantity-selector">
                                <button class="quantity-btn minus-btn" onclick="shop.decreaseQuantity(${product.id})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span>${existingItem.quantity}</span>
                                <button class="quantity-btn plus-btn" onclick="shop.increaseQuantity(${product.id})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        ` : `
                            <button class="add-to-cart" onclick="shop.addToCart(${product.id})">
                                <i class="fas fa-shopping-cart"></i>
                                Add to Cart
                            </button>
                        `}
                    </div>
                    <div class="product-info">
                        <span class="product-category">${product.category}</span>
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
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
                this.showNotification(`Quantidade de "${product.title}" aumentada para ${existingItem.quantity}`, 'success');
            } else {
                this.items.push({ ...product, quantity: 1 });
                this.showNotification(`"${product.title}" adicionado ao carrinho`, 'success');
            }
            
            this.updateCart();
            this.filterProducts();
            this.saveCart();
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Adicionar cursor pointer e evento de clique
        notification.style.cursor = 'pointer';
        notification.addEventListener('click', () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        const container = document.querySelector('.notifications-container');
        container.appendChild(notification);
        
        // Auto-remover após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    findProduct(productId) {
        return this.products.find(p => p.id === productId);
    }

    updateCart() {
        const cartItems = document.querySelector('.cart-items');
        const cartCountElements = document.querySelectorAll('.cart-count');
        const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = itemCount;
        });
        
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-info">
                    <div class="item-header">
                        <h4>${item.title}</h4>
                        <div class="quantity-controls">
                            <button onclick="shop.decreaseQuantity(${item.id})">-</button>
                            <span class="item-quantity">${item.quantity}x</span>
                            <button onclick="shop.increaseQuantity(${item.id})">+</button>
                        </div>
                    </div>
                    <div class="item-prices">
                        <p class="item-unit-price">$${item.price.toFixed(2)}</p>
                        <p class="item-total-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
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
        // Primeiro remove qualquer modal e overlay existente
        this.closeModal();
        
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
        // Remove todos os modais existentes
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
        
        // Remove a classe cart-open do body
        document.body.classList.remove('cart-open');
    }

    confirmOrder() {
        this.showNotification('Pedido confirmado com sucesso!', 'success');
        this.items = [];
        this.updateCart();
        this.saveCart();
        this.closeModal();
        
        // Pequeno delay para mostrar a notificação antes do refresh
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }

    increaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            this.showNotification(`Quantidade de "${item.title}" aumentada para ${item.quantity}`, 'success');
            this.updateCart();
            this.filterProducts();
            this.saveCart();
        }
    }

    decreaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity -= 1;
            if (item.quantity === 0) {
                this.items = this.items.filter(i => i.id !== productId);
                this.showNotification(`"${item.title}" removido do carrinho`, 'info');
            } else {
                this.showNotification(`Quantidade de "${item.title}" reduzida para ${item.quantity}`, 'info');
            }
            this.updateCart();
            this.filterProducts();
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
            document.body.classList.add('cart-open');
        });

        // Fechar carrinho
        document.querySelector('.close-cart').addEventListener('click', () => {
            document.body.classList.remove('cart-open');
        });

        // Fechar carrinho quando clicar no overlay
        document.querySelector('.cart-overlay').addEventListener('click', () => {
            document.body.classList.remove('cart-open');
        });

        // Adicionar listeners para os botões de categoria
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                document.querySelectorAll('.category-btn').forEach(btn => 
                    btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                this.currentCategory = button.dataset.category;
                this.filterProducts();
            });
        });
    }

    filterProducts() {
        const filteredProducts = this.currentCategory === 'all' 
            ? this.products 
            : this.products.filter(product => product.category === this.currentCategory);
        
        // Atualiza o título na navbar
        const headerTitle = document.querySelector('.main-header h1');
        headerTitle.textContent = this.currentCategory === 'all' 
            ? 'All Products' 
            : this.capitalizeFirstLetter(this.currentCategory);
        
        this.displayProducts(filteredProducts);
    }

    capitalizeFirstLetter(string) {
        return string.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    createNotificationsContainer() {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
}

const shop = new DessertShop(); 