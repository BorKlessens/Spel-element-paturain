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
    const ingredient = e.target.dataset.ingredient;
    if (!ingredient) return; // Prevent dragging if no ingredient is set
    
    e.dataTransfer.setData('text/plain', ingredient);
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const ingredient = e.dataTransfer.getData('text/plain');
    if (!ingredient) return; // Prevent adding undefined ingredients
    
    const draggingElement = document.querySelector('.dragging');
    if (draggingElement) {
        draggingElement.classList.remove('dragging');
    }
    
    addIngredient(ingredient);
}

// Game logic functions
function addIngredient(ingredient) {
    if (!ingredient || !gameState.availableIngredients.includes(ingredient)) return; // Validate ingredient
    
    if (!gameState.selectedIngredients.includes(ingredient)) {
        gameState.selectedIngredients.push(ingredient);
        updatePreparationArea();
        checkRecipe();
    }
}

function updatePreparationArea() {
    elements.preparationContainer.innerHTML = '';
    if (gameState.selectedIngredients.length === 0) {
        elements.preparationContainer.innerHTML = '<p>Sleep hier je ingrediënten naartoe</p>';
        return;
    }

    gameState.selectedIngredients.forEach(ingredient => {
        if (!ingredient) return; // Skip undefined ingredients
        
        const ingredientElement = document.createElement('div');
        ingredientElement.className = 'ingredient';
        
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
        elements.preparationContainer.appendChild(ingredientElement);
    });
}

function checkRecipe() {
    const currentRecipe = gameState.currentOrder;
    if (!currentRecipe) return;

    const isCorrect = currentRecipe.ingredients.every(ing => 
        gameState.selectedIngredients.includes(ing)
    ) && gameState.selectedIngredients.length === currentRecipe.ingredients.length;

    elements.serveButton.disabled = !isCorrect;
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
    
    elements.orderDisplay.innerHTML = `
        <h3>${randomRecipe.name}</h3>
        <p>${randomRecipe.description}</p>
        <div class="order-ingredients">
            ${randomRecipe.ingredients.map(ingredient => `
                <div class="order-ingredient">
                    <img src="${getImagePath(ingredient)}" alt="${ingredient}" 
                         onerror="this.onerror=null; this.style.display='none'; 
                                 this.parentElement.innerHTML += '<div class=\'fallback-text\'>${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</div>'">
                    <span>${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</span>
                </div>
            `).join('')}
        </div>
    `;
    resetPreparation();
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

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame); 