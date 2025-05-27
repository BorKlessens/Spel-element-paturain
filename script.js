document.addEventListener('DOMContentLoaded', () => {
    const ingredients = document.querySelectorAll('.ingredient');
    const recipeBowl = document.getElementById('recipe-bowl');
    const checkRecipeBtn = document.getElementById('check-recipe');
    const recipeResult = document.getElementById('recipe-result');
    
    let selectedIngredients = [];

    // Recepten database
    const recipes = {
        'paturain-pasta': {
            name: 'Paturain Pasta',
            ingredients: ['paturain', 'pasta'],
            description: 'Een heerlijke romige pasta met Paturain!'
        },
        'paturain-kip': {
            name: 'Paturain Kip',
            ingredients: ['paturain', 'kip'],
            description: 'Malse kip in een romige Paturain saus!'
        },
        'paturain-groenten': {
            name: 'Paturain Groenten',
            ingredients: ['paturain', 'groenten'],
            description: 'Geroosterde groenten met een romige Paturain saus!'
        },
        'paturain-compleet': {
            name: 'Paturain Compleet',
            ingredients: ['paturain', 'pasta', 'kip', 'groenten'],
            description: 'Een complete maaltijd met Paturain als basis!'
        }
    };

    // Drag and drop functionaliteit
    ingredients.forEach(ingredient => {
        ingredient.addEventListener('dragstart', (e) => {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', ingredient.dataset.ingredient);
        });

        ingredient.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    });

    recipeBowl.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    recipeBowl.addEventListener('drop', (e) => {
        e.preventDefault();
        const ingredient = e.dataTransfer.getData('text/plain');
        
        if (!selectedIngredients.includes(ingredient)) {
            selectedIngredients.push(ingredient);
            updateRecipeBowl();
        }
    });

    function updateRecipeBowl() {
        recipeBowl.innerHTML = '';
        selectedIngredients.forEach(ingredient => {
            const ingredientElement = document.createElement('div');
            ingredientElement.className = 'ingredient-in-bowl';
            ingredientElement.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
            recipeBowl.appendChild(ingredientElement);
        });
    }

    checkRecipeBtn.addEventListener('click', () => {
        if (selectedIngredients.length === 0) {
            recipeResult.innerHTML = '<p>Voeg eerst ingrediënten toe aan je recept!</p>';
            return;
        }

        // Controleer of er een geldig recept is
        let foundRecipe = null;
        for (const [key, recipe] of Object.entries(recipes)) {
            if (arraysEqual(recipe.ingredients, selectedIngredients)) {
                foundRecipe = recipe;
                break;
            }
        }

        if (foundRecipe) {
            recipeResult.innerHTML = `
                <h3>${foundRecipe.name}</h3>
                <p>${foundRecipe.description}</p>
                <p>Gefeliciteerd! Je hebt een heerlijk recept gemaakt!</p>
            `;
        } else {
            recipeResult.innerHTML = `
                <p>Hmm, deze combinatie is nog niet bekend. Probeer een andere combinatie!</p>
                <p>Tip: Begin met Paturain en voeg andere ingrediënten toe!</p>
            `;
        }
    });

    // Helper functie om arrays te vergelijken
    function arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((value, index) => value === sortedB[index]);
    }
}); 