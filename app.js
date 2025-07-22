// Replace with your actual Supabase URL and Public Anon Key
const SUPABASE_URL = 'https://tgwwiwqrxypnfudmwaat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnd3dpd3FyeHlwbmZ1ZG13YWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTYyOTMsImV4cCI6MjA2ODczMjI5M30.EzxncKbh-a9eyd9a7KprslvQUunOspUvP33QXS8GN5g';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('pantry-form');
const input = document.getElementById('item-input');
const list = document.getElementById('pantry-list');

// Function to read items and display them
async function getPantryItems() {
    const { data, error } = await supabase
        .from('pantry_items')
        .select('*');

    if (error) {
        console.error('Error fetching items:', error.message);
        return;
    }

    // Clear the current list
    list.innerHTML = '';

    data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.item_name;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove';
        deleteButton.classList.add('delete-btn');
        deleteButton.onclick = () => deletePantryItem(item.id);

        li.appendChild(deleteButton);
        list.appendChild(li);
    });
}

// Function to create a new item
async function createPantryItem(itemName) {
    const { data, error } = await supabase
        .from('pantry_items')
        .insert([{ item_name: itemName }]);

    if (error) {
        console.error('Error adding item:', error.message);
        return;
    }

    // Refresh the list to show the new item
    getPantryItems();
}

// Function to delete an item
async function deletePantryItem(itemId) {
    const { data, error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('Error deleting item:', error.message);
        return;
    }

    // Refresh the list
    getPantryItems();
}

// Event listener for the form submission
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevents the page from reloading
    const itemName = input.value.trim();
    if (itemName) {
        createPantryItem(itemName);
        input.value = ''; // Clear the input field
    }
});

// Initial fetch of items when the page loads
getPantryItems();
