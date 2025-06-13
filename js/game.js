// Game state
const gameState = {
    score: 0,
    currentOrder: null,
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
    }
};

// DOM Elements
const elements = {
    orderDisplay: document.getElementById('order-display'),
    ingredientsContainer: document.getElementById('ingredients-container'),
    preparationContainer: document.getElementById('preparation-container'),
    serveButton: document.getElementById('serve-button'),
    resetButton: document.getElementById('reset-button'),
    scoreDisplay: document.getElementById('score'),
    gameOverlay: document.getElementById('game-overlay'),
    startGameButton: document.getElementById('start-game')
};

let timerInterval;
let timeLeft;
const ORDER_TIME = 60; // 60 seconden per bestelling

// Helper function to get image path
function getImagePath(ingredient) {
    const extension = gameState.imageExtensions[ingredient] || 'png';
    return `images/ingredients/${ingredient}.${extension}`;
}

// Initialize the game
function initGame() {
    createIngredients();
    setupEventListeners();
    showWelcomeScreen();
    startTimer();
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
    elements.serveButton.addEventListener('click', serveDish);
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
    const currentRecipe = gameState.currentOrder;
    if (!currentRecipe) return;

    const isCorrect = currentRecipe.ingredients.every(ing => 
        gameState.selectedIngredients.includes(ing)
    ) && gameState.selectedIngredients.length === currentRecipe.ingredients.length;

    elements.serveButton.disabled = !isCorrect;

    // Stop timer als bestelling correct is
    if (isCorrect) {
        clearInterval(timerInterval);
    }
}

function serveDish() {
    if (gameState.currentOrder) {
        gameState.score++;
        elements.scoreDisplay.textContent = gameState.score;
        showSuccessMessage();
        setTimeout(generateNewOrder, 1500);
    }
}

function resetPreparation() {
    gameState.selectedIngredients = [];
    updatePreparationArea();
    elements.serveButton.disabled = true;
}

function generateNewOrder() {
    const randomRecipe = gameState.recipes[Math.floor(Math.random() * gameState.recipes.length)];
    gameState.currentOrder = randomRecipe;
    
    const orderDisplay = document.getElementById('order-display');
    orderDisplay.innerHTML = `
        <h3>${randomRecipe.name}</h3>
        <p>${randomRecipe.description}</p>
    `;
    
    const orderIngredients = document.querySelector('.order-ingredients');
    orderIngredients.innerHTML = randomRecipe.ingredients.map(ingredient => `
        <div class="order-ingredient">
            <img src="${getImagePath(ingredient)}" alt="${ingredient}" 
                 onerror="this.onerror=null; this.style.display='none'; 
                         this.parentElement.innerHTML += '<div class=\'fallback-text\'>${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</div>'">
            <span>${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</span>
        </div>
    `).join('');
    
    resetPreparation();
    
    // Start timer voor nieuwe bestelling
    startTimer();
}

function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Heerlijk! De klant is tevreden!';
    elements.orderDisplay.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 1500);
}

function showWelcomeScreen() {
    elements.gameOverlay.classList.remove('hidden');
}

function startGame() {
    elements.gameOverlay.classList.add('hidden');
    generateNewOrder();
}

function startTimer() {
    const timerBar = document.querySelector('.timer-bar');
    timeLeft = ORDER_TIME;
    
    // Reset timer bar
    timerBar.style.width = '100%';
    timerBar.classList.remove('warning', 'danger');
    
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Start new timer
    timerInterval = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / ORDER_TIME) * 100;
        timerBar.style.width = `${percentage}%`;
        
        // Change color based on remaining time
        if (percentage <= 30) {
            timerBar.classList.add('danger');
        } else if (percentage <= 60) {
            timerBar.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    // Verminder score
    gameState.score = Math.max(0, gameState.score - 5);
    elements.scoreDisplay.textContent = gameState.score;
    
    // Toon bericht
    const orderDisplay = document.getElementById('order-display');
    orderDisplay.innerHTML = '<p class="error-message">Te laat! -5 punten</p>';
    
    // Genereer nieuwe bestelling na korte pauze
    setTimeout(() => {
        generateNewOrder();
    }, 2000);
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame); 