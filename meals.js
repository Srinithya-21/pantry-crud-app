// --- Step 1: Connect to Supabase ---
// Make sure to replace with your actual Supabase URL and Public Anon Key
// These MUST be the same as in your app.js file
const SUPABASE_URL = 'https://tgwwiwqrxypnfudmwaat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnd3dpd3FyeHlwbmZ1ZG13YWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTYyOTMsImV4cCI6MjA2ODczMjI5M30.EzxncKbh-a9eyd9a7KprslvQUunOspUvP33QXS8GN5g';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Step 2: Define a Simple "Recipe Book" ---
// This is a list of meals and the ingredients they require.
// For this to work, the ingredient names must EXACTLY match what you type in your pantry.
// (e.g., 'Tomatoes' is different from 'tomato')
const recipeBook = [
    { name: 'Pasta with Tomato Sauce', ingredients: ['pasta', 'tomatoes', 'garlic'] },
    { name: 'Simple Salad', ingredients: ['lettuce', 'tomatoes', 'cucumber'] },
    { name: 'Cheese Omelette', ingredients: ['eggs', 'cheese', 'milk'] },
    { name: 'Garlic Bread', ingredients: ['bread', 'garlic', 'butter'] },
    { name: 'Basic Sandwich', ingredients: ['bread', 'cheese', 'lettuce'] },
    { name: 'Tomato Soup', ingredients: ['tomatoes', 'garlic', 'broth'] }
];

// --- Step 3: Get HTML Element ---
const mealsListDiv = document.getElementById('meals-list');

// --- Step 4: The Main Function to Suggest Meals ---
async function suggestMeals() {
    // First, get all the items from our pantry in the database
    const { data: pantryItems, error } = await supabase
        .from('pantry_items')
        .select('item_name');

    if (error) {
        console.error('Error fetching pantry items:', error);
        mealsListDiv.innerHTML = '<p>Could not fetch your pantry items.</p>';
        return;
    }

    // Now, let's create a simpler list of just the item names from our pantry
    // We also convert them to lowercase to make matching easier
    const pantryItemNames = pantryItems.map(item => item.item_name.toLowerCase());

    // This array will hold the meals we can actually make
    const suggestedMeals = [];

    // Loop through every recipe in our recipe book
    for (const recipe of recipeBook) {
        // Assume we can make the recipe until we find a missing ingredient
        let canMakeMeal = true;

        // Loop through every ingredient for the current recipe
        for (const ingredient of recipe.ingredients) {
            // Check if the pantry list includes the required ingredient
            if (!pantryItemNames.includes(ingredient.toLowerCase())) {
                // If it's missing, we can't make this meal.
                canMakeMeal = false;
                break; // No need to check other ingredients for this recipe, so we stop.
            }
        }

        // If after checking all ingredients, canMakeMeal is still true, add it to our list!
        if (canMakeMeal) {
            suggestedMeals.push(recipe.name);
        }
    }

    // --- Step 5: Display the Results on the Page ---
    displaySuggestions(suggestedMeals);
}

function displaySuggestions(meals) {
    // Clear the "loading..." message
    mealsListDiv.innerHTML = '';

    if (meals.length === 0) {
        // If the array is empty, it means no meals could be made
        mealsListDiv.innerHTML = '<p>No meals can be suggested with your current items. Try adding more!</p>';
    } else {
        // If we have suggestions, create an unordered list to display them
        const ul = document.createElement('ul');
        meals.forEach(mealName => {
            const li = document.createElement('li');
            li.textContent = mealName;
            ul.appendChild(li);
        });
        mealsListDiv.appendChild(ul);
    }
}

// --- Step 6: Run the main function when the page loads ---
suggestMeals();
