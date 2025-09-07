// POS System - Global State and Product Data

// Global State
let state = {
    cart: [],
    currentCategory: 'bebidas',
    subtotal: 0,
    vatEnabled: false,
    vatRate: 16,
    discountEnabled: false,
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: 0,
    discountAmount: 0,
    vatAmount: 0,
    total: 0,
    usdEnabled: false,
    exchangeRate: 20.00,
    config: {
        businessName: 'Mi Negocio',
        address: 'Dirección del negocio',
        rfc: 'XXXX000000XXX',
        sellerName: 'Empleado',
        goodbyeMessage: '¡Gracias por su compra!'
    }
};

// Product Database
const products = {
    bebidas: [
        { id: 1, name: 'Coca Cola', price: 25.00, category: 'bebidas' },
        { id: 2, name: 'Pepsi', price: 23.00, category: 'bebidas' },
        { id: 3, name: 'Agua', price: 15.00, category: 'bebidas' },
        { id: 4, name: 'Jugo Naranja', price: 30.00, category: 'bebidas' },
        { id: 5, name: 'Sprite', price: 25.00, category: 'bebidas' },
        { id: 6, name: 'Fanta', price: 25.00, category: 'bebidas' },
        { id: 7, name: 'Café', price: 20.00, category: 'bebidas' },
        { id: 8, name: 'Té', price: 18.00, category: 'bebidas' }
    ],
    comida: [
        { id: 9, name: 'Hamburguesa', price: 85.00, category: 'comida' },
        { id: 10, name: 'Pizza', price: 120.00, category: 'comida' },
        { id: 11, name: 'Tacos', price: 45.00, category: 'comida' },
        { id: 12, name: 'Torta', price: 55.00, category: 'comida' },
        { id: 13, name: 'Quesadilla', price: 35.00, category: 'comida' },
        { id: 14, name: 'Sandwich', price: 40.00, category: 'comida' },
        { id: 15, name: 'Ensalada', price: 65.00, category: 'comida' },
        { id: 16, name: 'Sopa', price: 50.00, category: 'comida' }
    ],
    postres: [
        { id: 17, name: 'Helado', price: 35.00, category: 'postres' },
        { id: 18, name: 'Pastel', price: 45.00, category: 'postres' },
        { id: 19, name: 'Galletas', price: 25.00, category: 'postres' },
        { id: 20, name: 'Flan', price: 30.00, category: 'postres' },
        { id: 21, name: 'Brownie', price: 40.00, category: 'postres' },
        { id: 22, name: 'Cheesecake', price: 55.00, category: 'postres' },
        { id: 23, name: 'Donut', price: 20.00, category: 'postres' },
        { id: 24, name: 'Muffin', price: 25.00, category: 'postres' }
    ]
};

// Utility Functions
function formatCurrency(amount) {
    if (state.usdEnabled) {
        const usdAmount = amount / state.exchangeRate;
        return `$${usdAmount.toFixed(2)}`;
    }
    return `$${amount.toFixed(2)}`;
}

function formatCurrencyWithLabel(amount) {
    if (state.usdEnabled) {
        const usdAmount = amount / state.exchangeRate;
        return `$${usdAmount.toFixed(2)} USD`;
    }
    return `$${amount.toFixed(2)} MXN`;
}

function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generateTicketNumber() {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    return `T${timestamp}`;
}

// State Management Functions
function addToCart(productId) {
    const product = findProductById(productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateTotals();
    renderCart();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    updateTotals();
    renderCart();
}

function updateQuantity(productId, quantity) {
    const item = state.cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            updateTotals();
            renderCart();
        }
    }
}

function findProductById(id) {
    for (const category in products) {
        const product = products[category].find(p => p.id === id);
        if (product) return product;
    }
    return null;
}

function updateTotals() {
    // Calculate subtotal
    state.subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate VAT
    state.vatAmount = state.vatEnabled ? (state.subtotal * state.vatRate / 100) : 0;
    
    // Calculate discount
    if (state.discountEnabled && state.discountValue > 0) {
        if (state.discountType === 'percentage') {
            state.discountAmount = state.subtotal * (state.discountValue / 100);
        } else {
            state.discountAmount = Math.min(state.discountValue, state.subtotal);
        }
    } else {
        state.discountAmount = 0;
    }
    
    // Calculate total
    state.total = state.subtotal + state.vatAmount - state.discountAmount;
    
    // Update UI
    updateTotalsDisplay();
}

function clearCart() {
    state.cart = [];
    state.discountValue = 0;
    state.discountAmount = 0;
    updateTotals();
    renderCart();
}

// Load configuration from localStorage
function loadConfig() {
    const savedConfig = localStorage.getItem('posConfig');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        state = { ...state, ...config };
    }
}

// Save configuration to localStorage
function saveConfig() {
    localStorage.setItem('posConfig', JSON.stringify({
        vatEnabled: state.vatEnabled,
        vatRate: state.vatRate,
        discountEnabled: state.discountEnabled,
        usdEnabled: state.usdEnabled,
        exchangeRate: state.exchangeRate,
        config: state.config
    }));
}

console.log('POS System - State and Data initialized');

// UI Rendering Functions
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const categoryProducts = products[state.currentCategory] || [];
    
    productsGrid.innerHTML = categoryProducts.map(product => `
        <div class="product-card bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105" 
             data-product-id="${product.id}">
            <div class="text-center">
                <h3 class="font-semibold text-gray-800 mb-2">${product.name}</h3>
                <p class="text-lg font-bold text-blue-600">${formatCurrency(product.price)}</p>
            </div>
        </div>
    `).join('');
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const discountBtn = document.getElementById('discountBtn');
    
    if (state.cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (discountBtn) discountBtn.style.display = 'none';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = false;
    if (state.discountEnabled) {
        if (discountBtn) discountBtn.style.display = 'block';
    }
    
    if (cartItems) {
        cartItems.innerHTML = state.cart.map(item => `
        <div class="cart-item bg-gray-50 rounded-lg p-3 cart-item-enter">
            <div class="flex justify-between items-center">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-800">${item.name}</h4>
                    <p class="text-sm text-gray-600">${formatCurrency(item.price)} c/u</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="quantity-btn w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors" 
                            data-product-id="${item.id}" data-action="decrease">-</button>
                    <span class="w-8 text-center font-medium">${item.quantity}</span>
                    <button class="quantity-btn w-8 h-8 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition-colors" 
                            data-product-id="${item.id}" data-action="increase">+</button>
                    <button class="remove-btn w-8 h-8 bg-gray-400 text-white rounded-full text-sm hover:bg-gray-500 transition-colors ml-2" 
                            data-product-id="${item.id}">×</button>
                </div>
            </div>
            <div class="mt-2 text-right">
                <span class="font-bold text-gray-800">${formatCurrency(item.price * item.quantity)}</span>
            </div>
        </div>
        `).join('');
    }
}

function updateTotalsDisplay() {
    document.getElementById('subtotal').textContent = formatCurrencyWithLabel(state.subtotal);
    document.getElementById('total').textContent = formatCurrencyWithLabel(state.total);
    
    // VAT display
    const vatRow = document.getElementById('vatRow');
    const vatAmount = document.getElementById('vatAmount');
    const vatPercent = document.getElementById('vatPercent');
    
    if (state.vatEnabled && state.vatAmount > 0) {
        vatRow.classList.remove('hidden');
        vatAmount.textContent = formatCurrencyWithLabel(state.vatAmount);
        vatPercent.textContent = state.vatRate;
    } else {
        vatRow.classList.add('hidden');
    }
    
    // Discount display
    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('discountAmount');
    
    if (state.discountEnabled && state.discountAmount > 0) {
        discountRow.classList.remove('hidden');
        discountAmount.textContent = `-${formatCurrencyWithLabel(state.discountAmount)}`;
    } else {
        discountRow.classList.add('hidden');
    }
}

function updateCategoryButtons() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        const category = btn.dataset.category;
        if (category === state.currentCategory) {
            btn.className = 'category-btn px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-blue-600 text-white shadow-md hover:bg-blue-700';
        } else {
            btn.className = 'category-btn px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
        }
    });
}

function updateCurrentDate() {
    document.getElementById('currentDate').textContent = getCurrentDate();
}

console.log('POS System - UI Rendering Functions initialized');

// Event Listeners and Interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Load configuration and initialize
    loadConfig();
    updateCurrentDate();
    renderProducts();
    renderCart();
    updateCategoryButtons();
    
    // Update date every minute
    setInterval(updateCurrentDate, 60000);
    
    // Category Navigation
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            state.currentCategory = this.dataset.category;
            updateCategoryButtons();
            renderProducts();
        });
    });
    
    // Product Selection - Event Delegation
    document.getElementById('productsGrid').addEventListener('click', function(e) {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            const productId = parseInt(productCard.dataset.productId);
            addToCart(productId);
        }
    });
    
    // Cart Controls - Event Delegation
    document.getElementById('cartItems').addEventListener('click', function(e) {
        const productId = parseInt(e.target.dataset.productId);
        
        if (e.target.classList.contains('quantity-btn')) {
            const action = e.target.dataset.action;
            const item = state.cart.find(item => item.id === productId);
            
            if (item) {
                if (action === 'increase') {
                    updateQuantity(productId, item.quantity + 1);
                } else if (action === 'decrease') {
                    updateQuantity(productId, item.quantity - 1);
                }
            }
        }
        
        if (e.target.classList.contains('remove-btn')) {
            removeFromCart(productId);
        }
    });
    
    console.log('POS System - Event Listeners initialized');
});

// Modal Management
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Discount Modal Functions
let discountType = 'percentage';

function showDiscountModal() {
    showModal('discountModal');
    document.getElementById('discountValue').value = '';
    updateDiscountButtons();
}

function updateDiscountButtons() {
    const percentageBtn = document.getElementById('percentageBtn');
    const fixedBtn = document.getElementById('fixedBtn');
    
    if (discountType === 'percentage') {
        percentageBtn.className = 'w-full py-2 px-4 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors';
        fixedBtn.className = 'w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors';
    } else {
        percentageBtn.className = 'w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors';
        fixedBtn.className = 'w-full py-2 px-4 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors';
    }
}

function applyDiscount() {
    const value = parseFloat(document.getElementById('discountValue').value) || 0;
    if (value <= 0) return;
    
    state.discountType = discountType;
    state.discountValue = value;
    updateTotals();
    hideModal('discountModal');
}

// Payment Modal Functions
let paymentMethod = '';

function showPaymentModal() {
    showModal('paymentModal');
    document.getElementById('paymentTotal').textContent = formatCurrencyWithLabel(state.total);
    document.getElementById('cashCalculator').classList.add('hidden');
    document.getElementById('cashReceived').value = '';
    document.getElementById('changeAmount').textContent = '$0.00';
    document.getElementById('confirmSale').disabled = true;
    paymentMethod = '';
}

function selectPaymentMethod(method) {
    paymentMethod = method;
    const cashCalculator = document.getElementById('cashCalculator');
    const confirmBtn = document.getElementById('confirmSale');
    
    if (method === 'cash') {
        cashCalculator.classList.remove('hidden');
        confirmBtn.disabled = true;
    } else {
        cashCalculator.classList.add('hidden');
        confirmBtn.disabled = false;
    }
}

function calculateChange() {
    const received = parseFloat(document.getElementById('cashReceived').value) || 0;
    let change, total;
    
    if (state.usdEnabled) {
        total = state.total / state.exchangeRate;
        change = received - total;
    } else {
        total = state.total;
        change = received - total;
    }
    
    const confirmBtn = document.getElementById('confirmSale');
    
    document.getElementById('changeAmount').textContent = formatCurrencyWithLabel(Math.max(0, change));
    confirmBtn.disabled = received < total;
}

function confirmSale() {
    hideModal('paymentModal');
    showTicketModal();
}

// Ticket Modal Functions
function showTicketModal() {
    const ticketNumber = generateTicketNumber();
    const currentDate = getCurrentDate();
    
    // Update ticket header
    document.getElementById('ticketBusinessName').textContent = state.config.businessName;
    document.getElementById('ticketAddress').textContent = state.config.address;
    document.getElementById('ticketRFC').textContent = `RFC: ${state.config.rfc}`;
    document.getElementById('ticketDate').textContent = `${currentDate} - Ticket: ${ticketNumber}`;
    document.getElementById('ticketSeller').textContent = state.config.sellerName;
    document.getElementById('ticketGoodbye').textContent = state.config.goodbyeMessage;
    
    // Update ticket items
    const ticketItems = document.getElementById('ticketItems');
    ticketItems.innerHTML = state.cart.map(item => `
        <div class="flex justify-between text-sm mb-1">
            <span>${item.name} x${item.quantity}</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
        </div>
    `).join('');
    
    // Update ticket totals
    document.getElementById('ticketSubtotal').textContent = formatCurrencyWithLabel(state.subtotal);
    document.getElementById('ticketTotal').textContent = formatCurrencyWithLabel(state.total);
    
    // Show/hide VAT and discount rows
    const ticketVatRow = document.getElementById('ticketVatRow');
    const ticketDiscountRow = document.getElementById('ticketDiscountRow');
    
    if (state.vatEnabled && state.vatAmount > 0) {
        ticketVatRow.classList.remove('hidden');
        document.getElementById('ticketVat').textContent = formatCurrencyWithLabel(state.vatAmount);
    } else {
        ticketVatRow.classList.add('hidden');
    }
    
    if (state.discountEnabled && state.discountAmount > 0) {
        ticketDiscountRow.classList.remove('hidden');
        document.getElementById('ticketDiscount').textContent = `-${formatCurrencyWithLabel(state.discountAmount)}`;
    } else {
        ticketDiscountRow.classList.add('hidden');
    }
    
    showModal('ticketModal');
}

function printTicket() {
    window.print();
}

function newSale() {
    clearCart();
    hideModal('ticketModal');
}

// Admin Panel Functions
function showAdminPanel() {
    document.getElementById('adminPanel').classList.remove('hidden');
    loadAdminConfig();
}

function hideAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
}

function loadAdminConfig() {
    // Load business config
    document.getElementById('businessName').value = state.config.businessName;
    document.getElementById('address').value = state.config.address;
    document.getElementById('rfc').value = state.config.rfc;
    document.getElementById('sellerName').value = state.config.sellerName;
    document.getElementById('goodbyeMessage').value = state.config.goodbyeMessage;
    
    // Load financial config
    document.getElementById('usdToggle').checked = state.usdEnabled;
    document.getElementById('exchangeRate').value = state.exchangeRate;
    document.getElementById('vatToggle').checked = state.vatEnabled;
    document.getElementById('vatRate').value = state.vatRate;
    document.getElementById('discountToggle').checked = state.discountEnabled;
    
    // Show/hide conditional fields
    toggleExchangeRate();
    toggleVatRate();
}

function toggleExchangeRate() {
    const exchangeRateDiv = document.getElementById('exchangeRateDiv');
    const usdEnabled = document.getElementById('usdToggle').checked;
    
    if (usdEnabled) {
        exchangeRateDiv.classList.remove('hidden');
    } else {
        exchangeRateDiv.classList.add('hidden');
    }
}

function toggleVatRate() {
    const vatRateDiv = document.getElementById('vatRateDiv');
    const vatEnabled = document.getElementById('vatToggle').checked;
    
    if (vatEnabled) {
        vatRateDiv.classList.remove('hidden');
    } else {
        vatRateDiv.classList.add('hidden');
    }
}

function saveAdminConfig() {
    // Update business config
    state.config.businessName = document.getElementById('businessName').value || 'Mi Negocio';
    state.config.address = document.getElementById('address').value || 'Dirección del negocio';
    state.config.rfc = document.getElementById('rfc').value || 'XXXX000000XXX';
    state.config.sellerName = document.getElementById('sellerName').value || 'Empleado';
    state.config.goodbyeMessage = document.getElementById('goodbyeMessage').value || '¡Gracias por su compra!';
    
    // Update financial config
    state.usdEnabled = document.getElementById('usdToggle').checked;
    state.exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 20.00;
    state.vatEnabled = document.getElementById('vatToggle').checked;
    state.vatRate = parseFloat(document.getElementById('vatRate').value) || 16;
    state.discountEnabled = document.getElementById('discountToggle').checked;
    
    // Save to localStorage
    saveConfig();
    
    // Update UI
    updateTotals();
    renderCart();
    
    // Show success message (simple alert for now)
    alert('Configuración guardada exitosamente');
}

// Additional Event Listeners for Modals
document.addEventListener('DOMContentLoaded', function() {
    // Discount Modal Events
    document.getElementById('discountBtn').addEventListener('click', showDiscountModal);
    document.getElementById('percentageBtn').addEventListener('click', function() {
        discountType = 'percentage';
        updateDiscountButtons();
    });
    document.getElementById('fixedBtn').addEventListener('click', function() {
        discountType = 'fixed';
        updateDiscountButtons();
    });
    document.getElementById('cancelDiscount').addEventListener('click', function() {
        hideModal('discountModal');
    });
    document.getElementById('applyDiscount').addEventListener('click', applyDiscount);
    
    // Payment Modal Events
    document.getElementById('checkoutBtn').addEventListener('click', showPaymentModal);
    document.getElementById('cashBtn').addEventListener('click', function() {
        selectPaymentMethod('cash');
    });
    document.getElementById('cardBtn').addEventListener('click', function() {
        selectPaymentMethod('card');
    });
    document.getElementById('cashReceived').addEventListener('input', calculateChange);
    document.getElementById('cancelPayment').addEventListener('click', function() {
        hideModal('paymentModal');
    });
    document.getElementById('confirmSale').addEventListener('click', confirmSale);
    
    // Ticket Modal Events
    document.getElementById('printTicket').addEventListener('click', printTicket);
    document.getElementById('newSale').addEventListener('click', newSale);
    
    // Admin Panel Events
    document.getElementById('adminBtn').addEventListener('click', showAdminPanel);
    document.getElementById('backToSales').addEventListener('click', hideAdminPanel);
    document.getElementById('usdToggle').addEventListener('change', toggleExchangeRate);
    document.getElementById('vatToggle').addEventListener('change', toggleVatRate);
    document.getElementById('saveConfig').addEventListener('click', saveAdminConfig);
    
    console.log('POS System - Modal functionality initialized');
});

console.log('POS System - Complete functionality loaded');