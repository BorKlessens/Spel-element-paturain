// Game state
const gameState = {
    score: 0,
    activeOrders: [],
    selectedIngredients: [],
    recipes: [
        {
            name: "Paturain Pasta",
            ingredients: ["pasta", "paturain", "knoflook", "peterselie"],
            description: "Een heerlijke romige pasta met Paturain roomkaas"
        },
        {
            name: "Paturain Toast",
            ingredients: ["brood", "paturain", "tomaat", "basilicum"],
            description: "Een smakelijke toast met Paturain roomkaas"
        },
        {
            name: "Paturain Salade",
            ingredients: ["sla", "paturain", "komkommer", "radijs"],
            description: "Een frisse salade met Paturain roomkaas"
        }
    ],
    availableIngredients: [
        "pasta", "paturain", "knoflook", "peterselie",
        "brood", "tomaat", "basilicum", "sla",
        "komkommer", "radijs", "ui", "paprika"
    ],
    // Image extensions mapping
    imageExtensions: {
        "ui": "webp",
        "komkommer": "webp",
        "tomaat": "webp",
        "basilicum": "png" // Fallback to PNG for missing images
    },
    customerAvatars: [
        "customer1.png",
        "customer2.png",
        "customer3.png",
        "customer4.png"
    ]
};

// DOM Elements
const elements = {
    ordersContainer: document.querySelector('.orders-container'),
    ingredientsContainer: document.getElementById('ingredients-container'),
    preparationContainer: document.getElementById('preparation-container'),
    resetButton: document.getElementById('reset-button'),
    scoreDisplay: document.getElementById('score'),
    gameOverlay: document.getElementById('game-overlay'),
    startGameButton: document.getElementById('start-game')
};

let orderTimers = {};
const ORDER_TIME = 30; // Verlaagd van 60 naar 30 seconden
const MAX_ACTIVE_ORDERS = 4; // Verhoogd van 3 naar 4
const MIN_ORDER_INTERVAL = 2000; // 2 seconden minimum tussen bestellingen
const MAX_ORDER_INTERVAL = 5000; // 5 seconden maximum tussen bestellingen

// Helper function to get image path
function getImagePath(ingredient) {
    const extension = gameState.imageExtensions[ingredient] || 'png';
    return `images/ingredients/${ingredient}.${extension}`;
}

// Helper function to get random customer avatar
function getRandomCustomerAvatar() {
    const randomIndex = Math.floor(Math.random() * gameState.customerAvatars.length);
    return `images/customers/${gameState.customerAvatars[randomIndex]}`;
}

// Initialize the game
function initGame() {
    createIngredients();
    setupEventListeners();
    showWelcomeScreen();
    generateNewOrder();
}

// Create draggable ingredients
function createIngredients() {
    elements.ingredientsContainer.innerHTML = '';
    gameState.availableIngredients.forEach(ingredient => {
        const ingredientElement = document.createElement('div');
        ingredientElement.className = 'ingredient';
        ingredientElement.draggable = true;
        ingredientElement.dataset.ingredient = ingredient;
        
        const img = document.createElement('img');
        img.src = getImagePath(ingredient);
        img.alt = ingredient;
        img.onerror = function() {
            // Fallback to text if image fails to load
            this.style.display = 'none';
            const fallbackText = document.createElement('div');
            fallbackText.className = 'fallback-text';
            fallbackText.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
            ingredientElement.appendChild(fallbackText);
        };
        
        const span = document.createElement('span');
        span.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
        
        ingredientElement.appendChild(img);
        ingredientElement.appendChild(span);
        elements.ingredientsContainer.appendChild(ingredientElement);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Drag and drop functionality
    elements.ingredientsContainer.addEventListener('dragstart', handleDragStart);
    elements.preparationContainer.addEventListener('dragover', handleDragOver);
    elements.preparationContainer.addEventListener('drop', handleDrop);

    // Button listeners
    elements.resetButton.addEventListener('click', resetPreparation);
    elements.startGameButton.addEventListener('click', startGame);
}

// Drag and drop handlers
function handleDragStart(e) {
    // Zorg ervoor dat we het juiste element pakken (ingredient div of img)
    const ingredientElement = e.target.closest('.ingredient');
    if (!ingredientElement) return;
    
    const ingredient = ingredientElement.dataset.ingredient;
    if (!ingredient) return;
    
    e.dataTransfer.setData('text/plain', ingredient);
    ingredientElement.classList.add('dragging');
    
    // Voeg een kleine vertraging toe voor betere visuele feedback
    setTimeout(() => {
        ingredientElement.classList.add('dragging');
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleDrop(e) {
    e.preventDefault();
    const ingredient = e.dataTransfer.getData('text/plain');
    if (!ingredient) return;
    
    // Verwijder de dragging class van alle elementen
    document.querySelectorAll('.dragging').forEach(el => {
        el.classList.remove('dragging');
    });
    
    addIngredient(ingredient);
}

// Game logic functions
function addIngredient(ingredient) {
    if (!ingredient || !gameState.availableIngredients.includes(ingredient)) return;
    
    // Controleer of het ingrediënt al is toegevoegd
    if (gameState.selectedIngredients.includes(ingredient)) {
        // Toon een bericht dat het ingrediënt al is toegevoegd
        const preparationBox = document.getElementById('preparation-container');
        const message = document.createElement('div');
        message.className = 'error-message';
        message.textContent = 'Dit ingrediënt is al toegevoegd!';
        preparationBox.appendChild(message);
        
        // Verwijder het bericht na 1.5 seconden
        setTimeout(() => {
            message.remove();
        }, 1500);
        return;
    }
    
    gameState.selectedIngredients.push(ingredient);
    updatePreparationArea();
    checkRecipe();
}

function updatePreparationArea() {
    const preparationContainer = document.getElementById('preparation-container');
    preparationContainer.innerHTML = '';
    
    if (gameState.selectedIngredients.length === 0) {
        preparationContainer.innerHTML = '<p>Sleep hier je ingrediënten naartoe</p>';
        return;
    }

    gameState.selectedIngredients.forEach(ingredient => {
        if (!ingredient) return;
        
        const ingredientElement = document.createElement('div');
        ingredientElement.className = 'ingredient';
        ingredientElement.draggable = true;
        ingredientElement.dataset.ingredient = ingredient;
        
        const img = document.createElement('img');
        img.src = getImagePath(ingredient);
        img.alt = ingredient;
        img.onerror = function() {
            this.style.display = 'none';
            const fallbackText = document.createElement('div');
            fallbackText.className = 'fallback-text';
            fallbackText.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
            ingredientElement.appendChild(fallbackText);
        };
        
        const span = document.createElement('span');
        span.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
        
        ingredientElement.appendChild(img);
        ingredientElement.appendChild(span);
        preparationContainer.appendChild(ingredientElement);
    });
}

function checkRecipe() {
    const serveButtons = document.querySelectorAll('.serve-button');
    serveButtons.forEach(button => {
        const orderId = parseInt(button.closest('.customer').dataset.orderId);
        const order = gameState.activeOrders.find(o => o.id === orderId);
        
        if (order) {
            const isCorrect = order.recipe.ingredients.every(ing => 
                gameState.selectedIngredients.includes(ing)
            ) && gameState.selectedIngredients.length === order.recipe.ingredients.length;
            
            button.disabled = !isCorrect;
        }
    });
}

function generateNewOrder() {
    const randomRecipe = gameState.recipes[Math.floor(Math.random() * gameState.recipes.length)];
    const orderId = Date.now();
    
    const order = {
        id: orderId,
        recipe: randomRecipe,
        ingredients: [],
        timer: ORDER_TIME
    };
    
    gameState.activeOrders.push(order);
    createCustomerWithOrder(order);
    startOrderTimer(orderId);
    
    // Genereer een nieuwe bestelling na een kortere willekeurige tijd
    setTimeout(() => {
        if (gameState.activeOrders.length < MAX_ACTIVE_ORDERS) {
            generateNewOrder();
        }
    }, Math.random() * (MAX_ORDER_INTERVAL - MIN_ORDER_INTERVAL) + MIN_ORDER_INTERVAL);
}

function createCustomerWithOrder(order) {
    const customer = document.createElement('div');
    customer.className = 'customer';
    customer.dataset.orderId = order.id;
    
    const avatar = document.createElement('div');
    avatar.className = 'customer-avatar';
    const avatarImg = document.createElement('img');
    avatarImg.src = getRandomCustomerAvatar();
    avatarImg.alt = 'Customer';
    avatar.appendChild(avatarImg);
    
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble';
    
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.innerHTML = `
        <h3>${order.recipe.name}</h3>
        <p>${order.recipe.description}</p>
        <div class="timer-container">
            <div class="timer-bar" data-order-id="${order.id}"></div>
        </div>
        <div class="order-ingredients">
            ${order.recipe.ingredients.map(ingredient => `
                <div class="order-ingredient">
                    <img src="${getImagePath(ingredient)}" alt="${ingredient}" 
                         onerror="this.onerror=null; this.style.display='none'; 
                                 this.parentElement.innerHTML += '<div class=\'fallback-text\'>${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</div>'">
                    <span>${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</span>
                </div>
            `).join('')}
        </div>
        <button class="serve-button" disabled>Serveer</button>
    `;
    
    speechBubble.appendChild(orderCard);
    customer.appendChild(speechBubble);
    customer.appendChild(avatar);
    
    elements.ordersContainer.appendChild(customer);
    
    const serveButton = customer.querySelector('.serve-button');
    serveButton.addEventListener('click', () => serveOrder(order.id));
}

function startOrderTimer(orderId) {
    const timerBar = document.querySelector(`.timer-bar[data-order-id="${orderId}"]`);
    let timeLeft = ORDER_TIME;
    
    timerBar.style.width = '100%';
    timerBar.classList.remove('warning', 'danger');
    
    orderTimers[orderId] = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / ORDER_TIME) * 100;
        timerBar.style.width = `${percentage}%`;
        
        // Snellere kleurverandering voor meer urgentie
        if (percentage <= 20) { // Verlaagd van 30 naar 20
            timerBar.classList.add('danger');
        } else if (percentage <= 40) { // Verlaagd van 60 naar 40
            timerBar.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            handleOrderTimeUp(orderId);
        }
    }, 1000);
}

function handleOrderTimeUp(orderId) {
    clearInterval(orderTimers[orderId]);
    delete orderTimers[orderId];
    
    const order = gameState.activeOrders.find(o => o.id === orderId);
    if (order) {
        gameState.score = Math.max(0, gameState.score - 10); // Verhoogd van -5 naar -10 punten
        elements.scoreDisplay.textContent = gameState.score;
        
        const customer = document.querySelector(`.customer[data-order-id="${orderId}"]`);
        if (customer) {
            customer.classList.add('leaving');
            setTimeout(() => {
                customer.remove();
                gameState.activeOrders = gameState.activeOrders.filter(o => o.id !== orderId);
            }, 500);
        }
    }
}

function serveOrder(orderId) {
    const order = gameState.activeOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const isCorrect = order.recipe.ingredients.every(ing => 
        gameState.selectedIngredients.includes(ing)
    ) && gameState.selectedIngredients.length === order.recipe.ingredients.length;
    
    if (isCorrect) {
        gameState.score += 2; // Verhoogd van 1 naar 2 punten voor snelle service
        elements.scoreDisplay.textContent = gameState.score;
        
        const customer = document.querySelector(`.customer[data-order-id="${orderId}"]`);
        if (customer) {
            customer.classList.add('leaving');
            setTimeout(() => {
                customer.remove();
                gameState.activeOrders = gameState.activeOrders.filter(o => o.id !== orderId);
                clearInterval(orderTimers[orderId]);
                delete orderTimers[orderId];
            }, 500);
        }
        
        resetPreparation();
    }
}

function resetPreparation() {
    gameState.selectedIngredients = [];
    updatePreparationArea();
    checkRecipe();
}

function showWelcomeScreen() {
    elements.gameOverlay.classList.remove('hidden');
}

function startGame() {
    elements.gameOverlay.classList.add('hidden');
    generateNewOrder();
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame); 