// --- Step 1: Supabase Connection ---
// Replace with your actual Supabase URL and Public Anon Key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Step 2: Get HTML Elements ---
const form = document.getElementById('pantry-form');
const itemInput = document.getElementById('item-input');
const quantityInput = document.getElementById('quantity-input');
const list = document.getElementById('pantry-list'); // This is now the <tbody>

// --- Step 3: Main READ Function ---
// Fetches all items and displays them in the table.
async function getPantryItems() {
    const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .order('created_at', { ascending: false }); // Show newest items first

    if (error) {
        console.error('Error fetching items:', error.message);
        return;
    }

    // Clear the current list (table body)
    list.innerHTML = '';

    // Loop through the data and create a table row for each item
    for (const item of data) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.item_name}</td>
            <td>${item.quantity}</td>
            <td class="actions-cell">
                <button class="quantity-btn" onclick="updateItemQuantity('${item.id}', '${item.quantity}', 1)">+</button>
                <button class="quantity-btn" onclick="updateItemQuantity('${item.id}', '${item.quantity}', -1)">-</button>
                <button class="remove-btn" onclick="deleteItem('${item.id}')">Remove</button>
            </td>
        `;
        list.appendChild(tr);
    }
}

// --- Step 4: Main CREATE Function ---
// Handles the form submission to add a new item.
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevents page reload
    
    const itemName = itemInput.value.trim();
    const quantity = quantityInput.value.trim();

    if (itemName && quantity) {
        // We no longer check for duplicates; users can have multiple entries
        // for different types of the same item (e.g., "Cheese, Sliced" and "Cheese, Block")
        const { error } = await supabase
            .from('pantry_items')
            .insert([{ item_name: itemName, quantity: quantity }]);

        if (error) {
            console.error('Error adding item:', error.message);
        } else {
            // Clear the input fields and refresh the table
            itemInput.value = '';
            quantityInput.value = '';
            getPantryItems();
        }
    }
});

// --- Step 5: Main UPDATE Function ---
// Updates the quantity of an item. Called by the + and - buttons.
async function updateItemQuantity(id, currentQuantity, change) {
    // We try to find the first number in the quantity string (e.g., "2" from "2 kg")
    const currentNum = parseInt(currentQuantity);

    // If the quantity isn't a parsable number (e.g., "a packet"), we can't +/- it.
    if (isNaN(currentNum)) {
        alert("Cannot adjust quantity for items not starting with a number (e.g., 'a packet'). Please remove and re-add.");
        return;
    }

    const newNum = currentNum + change;

    // If the new quantity is zero or less, delete the item
    if (newNum <= 0) {
        deleteItem(id);
    } else {
        // Find the unit part of the string (e.g., "kg" from "2 kg")
        const unit = currentQuantity.replace(currentNum, '').trim();
        const newQuantity = `${newNum} ${unit}`.trim();

        const { error } = await supabase
            .from('pantry_items')
            .update({ quantity: newQuantity })
            .eq('id', id);

        if (error) {
            console.error('Error updating quantity:', error.message);
        } else {
            getPantryItems(); // Refresh the table to show the change
        }
    }
}

// --- Step 6: Main DELETE Function ---
// Deletes an item. Called by the "Remove" button.
async function deleteItem(id) {
    if (confirm("Are you sure you want to remove this item completely?")) {
        const { error } = await supabase
            .from('pantry_items')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting item:', error.message);
        } else {
            getPantryItems(); // Refresh the table
        }
    }
}

// --- Initial Load ---
// Fetch and display all items when the page first loads.
getPantryItems();
