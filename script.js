let currentUser = '';
let itemCounter = 0;
let itemsList = [];

let userInfo = {
    name: '',
    address: {
        street: '',
        city: '',
        state: '',
        country: ''
    }
};

function showNotification(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: type === 'success' ? '#2ec4b6' : '#ef233c',
        stopOnFocus: true,
    }).showToast();
}

function submitUsername() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    if (username === '') {
        showNotification('Please enter your name', 'error');
        return;
    }
    
    currentUser = username;
    document.getElementById('userDisplay').textContent = username;
    document.getElementById('usernameSection').classList.add('hidden');
    document.getElementById('itemSection').classList.remove('hidden');
    
    saveToLocalStorage(); // Save after username submit
    showNotification('Welcome, ' + username + '!');
}

function generateUniqueId() {
    return Math.floor(1000 + Math.random() * 9000); // Generates 4-digit number between 1000-9999
}

function addItem() {
    if (itemsList.length >= 5) {
        showNotification('You can only add up to 5 items', 'error');
        return;
    }

    const itemName = document.getElementById('itemName').value.trim();
    const itemQuantity = document.getElementById('itemQuantity').value;

    if (itemName === '' || itemQuantity === '') {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (itemQuantity < 1) {
        showNotification('Quantity must be at least 1', 'error');
        return;
    }

    const item = {
        id: generateUniqueId(),
        name: itemName,
        quantity: parseInt(itemQuantity),
        user: currentUser
    };

    itemsList.push(item);
    
    displayItems();
    updateProgressBar();
    clearInputs();
    showNotification('Item added successfully');
    
    if (itemsList.length > 0) {
        document.getElementById('shareSection').classList.remove('hidden');
    }
}

function deleteItem(id) {
    const confirmDelete = confirm('Are you sure you want to delete this item?');
    
    if (confirmDelete) {
        itemsList = itemsList.filter(item => item.id !== id);
        
        displayItems();
        updateProgressBar();
        showNotification('Item deleted');
        
        if (itemsList.length === 0) {
            document.getElementById('shareSection').classList.add('hidden');
        }
    }
}

function displayItems() {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';

    itemsList.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div class="item-info">
                <div class="item-main">
                    <div class="item-id">
                        <i class="fas fa-hashtag"></i>
                        <span>${item.id}</span>
                    </div>
                    <div class="item-name">
                        <i class="fas fa-box"></i>
                        <span>${item.name}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="quantity-control">
                        <button onclick="updateQuantity(${item.id}, 'decrease')" class="qty-btn">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 'increase')" class="qty-btn">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button onclick="deleteItem(${item.id})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        itemList.appendChild(itemCard);
    });

    updateProgressBar();
}

function updateItemCount() {
    document.getElementById('itemCount').textContent = itemCounter;
}

function clearInputs() {
    document.getElementById('itemName').value = '';
    document.getElementById('itemQuantity').value = '';
}

// Add this new function for submit button
function submitItems() {
    if (itemsList.length === 0) {
        showNotification('Please add items first', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitButton');
    const submitText = submitBtn.querySelector('.submit-text');
    const submitLoading = submitBtn.querySelector('.submit-loading');

    // Start loading animation
    submitBtn.classList.add('loading');
    submitText.classList.add('hidden');
    submitLoading.classList.remove('hidden');

    // Get user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Format address
    const formattedAddress = `${userInfo.address.street}, ${userInfo.address.city}, ${userInfo.address.state}, ${userInfo.address.country}`;

    // Generate order ID
    const orderID = generateOrderID();

    // Prepare WhatsApp message
    const message = encodeURIComponent(
        `🛍️ New Order #${orderID}\n\n` +
        `👤 Customer Name: ${userInfo.name}\n` +
        `📍 Delivery Address:\n${formattedAddress}\n\n` +
        `📦 Ordered Items:\n` +
        `${itemsList.map(item => 
            `• Item ID: ${item.id}\n  Name: ${item.name}\n  Quantity: ${item.quantity}`
        ).join('\n\n')}\n\n` +
        `Total Items: ${itemsList.length}\n` +
        `Order Time: ${getCurrentDateTime()}`
    );

    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = `https://wa.me/94781132477?text=${message}`;
    }, 3000);
}

// Generate Order ID
function generateOrderID() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${year}${month}${day}${random}`;
}

// Get current date and time
function getCurrentDateTime() {
    return new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function shareEmail() {
    const subject = encodeURIComponent(`Item Request List from ${currentUser}`);
    const body = encodeURIComponent(
        `Items List:\n\n` +
        itemsList.map(item => 
            `ID: ${item.id}\nItem: ${item.name}\nQuantity: ${item.quantity}`
        ).join('\n\n')
    );
    window.location.href = `mailto:chamudithalankathilaka@gmail.com?subject=${subject}&body=${body}`;
}

// Add new function for quantity update
function updateQuantity(id, action) {
    const itemIndex = itemsList.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        let newQuantity = parseInt(itemsList[itemIndex].quantity);
        
        if (action === 'increase') {
            newQuantity += 1;
        } else if (action === 'decrease' && newQuantity > 1) {
            newQuantity -= 1;
        }

        itemsList[itemIndex].quantity = newQuantity;
        
        saveToLocalStorage(); // Save after quantity update
        displayItems();
        showNotification('Quantity updated');
    }
}

// Add new function for progress bar
function updateProgressBar() {
    const progress = (itemsList.length / 5) * 100;
    const progressBar = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `Items added: ${itemsList.length}/5`;
    }
}

// Local Storage functions
const STORAGE_KEYS = {
    ITEMS: 'familyItems',
    USER: 'currentUser',
    COUNTER: 'itemCounter'
};

function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(itemsList));
    localStorage.setItem(STORAGE_KEYS.USER, currentUser);
    localStorage.setItem(STORAGE_KEYS.COUNTER, itemCounter);
}

function loadFromLocalStorage() {
    try {
        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
            userInfo = JSON.parse(savedUserInfo);
            currentUser = userInfo.name;
            document.getElementById('userDisplay').textContent = userInfo.name;
            document.getElementById('usernameSection').classList.add('hidden');
            document.getElementById('itemSection').classList.remove('hidden');
        }

        const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
        if (savedItems) {
            itemsList = JSON.parse(savedItems);
            displayItems();
            updateItemsWarning();
            
            if (itemsList.length > 0) {
                document.getElementById('shareSection').classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showNotification('Error loading saved data', 'error');
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadFromLocalStorage);

// Add clear data function (optional)
function clearAllData() {
    const confirmClear = confirm('Are you sure you want to clear all data?');
    
    if (confirmClear) {
        localStorage.clear();
        itemsList = [];
        itemCounter = 0;
        currentUser = '';
        
        // Reset UI
        document.getElementById('usernameSection').classList.remove('hidden');
        document.getElementById('itemSection').classList.add('hidden');
        document.getElementById('shareSection').classList.add('hidden');
        document.getElementById('username').value = '';
        
        displayItems();
        updateProgressBar();
        showNotification('All data cleared');
    }
}

// Add these new functions for form handling
function nextStep() {
    const username = document.getElementById('username').value.trim();
    if (username === '') {
        showNotification('Please enter your name', 'error');
        return;
    }

    userInfo.name = username;
    
    // Update steps
    document.querySelector('[data-step="1"]').classList.add('completed');
    document.querySelector('[data-step="2"]').classList.add('active');
    
    // Switch forms
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
}

function previousStep() {
    // Update steps
    document.querySelector('[data-step="2"]').classList.remove('active');
    document.querySelector('[data-step="1"]').classList.remove('completed');
    
    // Switch forms
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
}

function submitUserInfo() {
    const street = document.getElementById('streetAddress').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const country = document.getElementById('country').value.trim();

    if (!street || !city || !state || !country) {
        showNotification('Please fill in all address fields', 'error');
        return;
    }

    userInfo.address = {
        street,
        city,
        state,
        country
    };

    // Save to localStorage
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    // Update current user and proceed
    currentUser = userInfo.name;
    document.getElementById('userDisplay').textContent = userInfo.name;
    
    // Show main section
    document.getElementById('usernameSection').classList.add('hidden');
    document.getElementById('itemSection').classList.remove('hidden');
    
    showNotification('Welcome, ' + userInfo.name + '!');
}

// Add reset function
function resetUserData() {
    const confirmReset = confirm('Are you sure you want to reset? This will clear all your data and return to the registration form.');
    
    if (confirmReset) {
        // Clear localStorage
        localStorage.clear();
        
        // Reset variables
        itemsList = [];
        itemCounter = 0;
        currentUser = '';
        
        // Reset UI elements
        document.getElementById('itemList').innerHTML = '';
        document.getElementById('username').value = '';
        document.getElementById('streetAddress').value = '';
        document.getElementById('city').value = '';
        document.getElementById('state').value = '';
        document.getElementById('country').value = '';
        
        // Hide sections
        document.getElementById('itemSection').classList.add('hidden');
        document.getElementById('shareSection').classList.add('hidden');
        
        // Show and reset registration form
        document.getElementById('usernameSection').classList.remove('hidden');
        document.getElementById('step1').classList.add('active');
        document.getElementById('step2').classList.remove('active');
        
        // Reset progress steps
        document.querySelector('[data-step="1"]').classList.remove('completed');
        document.querySelector('[data-step="2"]').classList.remove('active');
        
        showNotification('All data has been reset');
    }
}

// Update the counter and warning state
function updateItemsWarning() {
    const warningSection = document.querySelector('.items-limit-warning');
    const itemsCount = warningSection?.querySelector('.items-count');
    
    if (warningSection && itemsCount) {
        // Update counter
        itemsCount.textContent = `Items added: ${itemsList.length}/5`;
        
        // Update warning state
        if (itemsList.length >= 4) {
            warningSection.classList.add('near-limit');
        } else {
            warningSection.classList.remove('near-limit');
        }
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateItemsWarning();
});

// Add these new functions for export functionality
function exportToPDF() {
    const btn = event.currentTarget;
    btn.classList.add('loading');

    // Get user info
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Create PDF content
    const docDefinition = {
        content: [
            { text: 'Shopping List', style: 'header' },
            { text: '\n' },
            { text: `Customer: ${userInfo.name}`, style: 'subheader' },
            { text: `Date: ${new Date().toLocaleDateString()}`, style: 'subheader' },
            { text: '\n' },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto'],
                    body: [
                        ['#', 'Item Name', 'Quantity'],
                        ...itemsList.map((item, index) => [
                            index + 1,
                            item.name,
                            item.quantity
                        ])
                    ]
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true
            },
            subheader: {
                fontSize: 14,
                bold: false
            }
        }
    };

    // Generate PDF
    pdfMake.createPdf(docDefinition).download('shopping-list.pdf');

    // Remove loading state after download starts
    setTimeout(() => {
        btn.classList.remove('loading');
        showNotification('PDF downloaded successfully');
    }, 1000);
}

function exportToCSV() {
    const btn = event.currentTarget;
    btn.classList.add('loading');

    // Create CSV content
    const headers = ['Item ID', 'Item Name', 'Quantity'];
    const rows = itemsList.map(item => [
        item.id,
        item.name,
        item.quantity
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Remove loading state
    setTimeout(() => {
        btn.classList.remove('loading');
        showNotification('CSV downloaded successfully');
    }, 1000);
}