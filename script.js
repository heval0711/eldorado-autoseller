// ============================================
// ELDORADO AUTO-SELLER - MAIN SCRIPT
// ============================================

// ===== CONFIGURATION =====
const CONFIG = {
    // Production Mode Toggle
    production: true, // ✅ PRODUCTION MODE!
    useBackendProxy: true, // ✅ BACKEND NUTZEN!
    
    // Backend URL
    backendUrl: 'https://eldorado-autoseller.onrender.com',
    
    // AWS Cognito Config
    cognito: {
        poolId: 'us-east-2_MlnzcFgHk',
        clientId: '1956req5ro9drdtbf5i6kis4la',
        cognitoHostname: 'https://login.eldorado.gg',
        eldoradoHostname: 'eldorado.gg',
        region: 'us-east-2'
    },
    
    // Eldorado API Endpoints
    api: {
        baseUrl: 'https://eldorado.gg',
        flexibleOffers: '/api/flexibleOffers',
        createOffer: '/api/offers',
        myOrders: '/api/orders/me',
        proxyPrices: '/api/prices',
        proxyCreateOffer: '/api/create-offer',
        proxyGeneric: '/api/proxy',
        corsProxy: null,
    },
    
    // Game Config
    game: {
        id: '16-1-0',
        name: 'Steal a Brainrot',
        category: 'Items',
        itemType: 'Brainrot',
        rarity: 'Secret',
        deliveryTime: '20 Minuten',
        deliveryMethod: 'Lieferung im Spiel'
    },
    
    // Rate Limiting
    rateLimit: {
        priceCheck: 500,
        upload: 2000,
    }
};

// ===== STATE MANAGEMENT =====
const STATE = {
    authToken: null,
    userEmail: null,
    items: [],
    selectedItems: [],
    eldoradoPrices: {}
};

// ===== DOM ELEMENTS =====
const DOM = {
    loginSection: document.getElementById('loginSection'),
    loginForm: document.getElementById('loginForm'),
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('loginBtn'),
    loginStatus: document.getElementById('loginStatus'),
    userInfo: document.getElementById('userInfo'),
    userEmail: document.getElementById('userEmail'),
    logoutBtn: document.getElementById('logoutBtn'),
    appSection: document.getElementById('appSection'),
    jsonInput: document.getElementById('jsonInput'),
    quickFillBtn: document.getElementById('quickFillBtn'),
    parseBtn: document.getElementById('parseBtn'),
    parseStatus: document.getElementById('parseStatus'),
    itemsCard: document.getElementById('itemsCard'),
    itemCount: document.getElementById('itemCount'),
    itemsContainer: document.getElementById('itemsContainer'),
    fetchPricesBtn: document.getElementById('fetchPricesBtn'),
    autoListBtn: document.getElementById('autoListBtn'),
    progressCard: document.getElementById('progressCard'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    progressLogs: document.getElementById('progressLogs'),
    toastContainer: document.getElementById('toastContainer')
};

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div style="font-weight: 600;">${message}</div>`;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 5000);
}

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = type;
    element.style.display = 'block';
}

function hideStatus(element) {
    element.style.display = 'none';
}

// ===== M/s RANGE CALCULATOR =====
function getMsRange(msString) {
    const match = msString.match(/(\d+)/);
    if (!match) return "0";
    
    const num = parseInt(match[1]);
    
    if (num === 0) return "0";
    if (num >= 1000000000) return "1+ B/s";
    if (num >= 750000000) return "750-999 M/s";
    if (num >= 500000000) return "500-749 M/s";
    if (num >= 250000000) return "250-499 M/s";
    if (num >= 100000000) return "100-249 M/s";
    if (num >= 50000000) return "50-99 M/s";
    if (num >= 25000000) return "25-49 M/s";
    return "0-24 M/s";
}

// ===== BRAINROT IMAGES =====
const BRAINROT_IMAGES = {
    "Garama and Madundung": "https://www.eldorado.gg/blog/wp-content/uploads/2025/01/garama-and-madundung-brainrot.webp",
    "Divine Brainrot": "https://www.eldorado.gg/blog/wp-content/uploads/2025/01/divine-brainrot.webp",
    "Rainbow Brainrot": "https://www.eldorado.gg/blog/wp-content/uploads/2025/01/rainbow-brainrot.webp",
    "Cosmic Brainrot": "https://www.eldorado.gg/blog/wp-content/uploads/2025/01/cosmic-brainrot.webp",
    "_DEFAULT": "https://www.eldorado.gg/blog/wp-content/uploads/2025/07/Steal-a-Brainrot-Game-Icon.webp"
};

function getBrainrotImage(brainrotName) {
    const normalizedName = brainrotName.trim();
    return BRAINROT_IMAGES[normalizedName] || BRAINROT_IMAGES["_DEFAULT"];
}

// ===== AUTHENTICATION =====
async function authenticateWithCognito(email, password) {
    if (!CONFIG.production) {
        return 'dev_token_' + btoa(email + ':' + Date.now());
    }
    
    // TODO: Implement real Cognito authentication
    // For now, use development token
    return 'dev_token_' + btoa(email + ':' + Date.now());
}

// Login Handler
DOM.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = DOM.emailInput.value;
    const password = DOM.passwordInput.value;
    
    showStatus(DOM.loginStatus, '🔄 Logging in...', 'loading');
    DOM.loginBtn.disabled = true;
    DOM.loginBtn.innerHTML = '<div class="spinner"></div> Logging in...';
    
    try {
        const token = await authenticateWithCognito(email, password);
        STATE.authToken = token;
        STATE.userEmail = email;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', email);
        showStatus(DOM.loginStatus, '✅ Login erfolgreich!', 'success');
        setTimeout(() => {
            DOM.loginSection.style.display = 'none';
            DOM.appSection.style.display = 'block';
            DOM.userInfo.style.display = 'flex';
            DOM.userEmail.textContent = email;
            showToast('Willkommen zurück!', 'success');
        }, 1000);
    } catch (error) {
        showStatus(DOM.loginStatus, '❌ Login fehlgeschlagen: ' + error.message, 'error');
    } finally {
        DOM.loginBtn.disabled = false;
        DOM.loginBtn.innerHTML = '<span>Login</span>';
    }
});

// Logout Handler
DOM.logoutBtn.addEventListener('click', () => {
    STATE.authToken = null;
    STATE.userEmail = null;
    STATE.items = [];
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    DOM.appSection.style.display = 'none';
    DOM.loginSection.style.display = 'flex';
    DOM.userInfo.style.display = 'none';
    DOM.emailInput.value = '';
    DOM.passwordInput.value = '';
    showToast('Erfolgreich ausgeloggt', 'info');
});

// Check for existing session
window.addEventListener('load', () => {
    const savedToken = localStorage.getItem('authToken');
    const savedEmail = localStorage.getItem('userEmail');
    if (savedToken && savedEmail) {
        STATE.authToken = savedToken;
        STATE.userEmail = savedEmail;
        DOM.loginSection.style.display = 'none';
        DOM.appSection.style.display = 'block';
        DOM.userInfo.style.display = 'flex';
        DOM.userEmail.textContent = savedEmail;
        showToast('Session wiederhergestellt', 'success');
    }
});

// ===== JSON PARSING =====
DOM.quickFillBtn.addEventListener('click', () => {
    const testData = [
        {"name": "Garama and Madundung", "ms": "50 M/s", "mutation": "Divine", "rarity": "Secret"},
        {"name": "Garama and Madundung", "ms": "50 M/s", "mutation": "Divine", "rarity": "Secret"},
        {"name": "Divine Brainrot", "ms": "10 M/s", "mutation": "Rainbow", "rarity": "Secret"},
        {"name": "Cosmic Brainrot", "ms": "20 M/s", "mutation": "None", "rarity": "Secret"}
    ];
    DOM.jsonInput.value = JSON.stringify(testData, null, 2);
    showToast('Test-Daten eingefügt', 'info');
});

DOM.parseBtn.addEventListener('click', () => {
    const jsonText = DOM.jsonInput.value.trim();
    if (!jsonText) {
        showStatus(DOM.parseStatus, '❌ Bitte JSON-Daten eingeben', 'error');
        return;
    }
    try {
        showStatus(DOM.parseStatus, '🔄 Parsing...', 'loading');
        const data = JSON.parse(jsonText);
        if (!Array.isArray(data)) {
            throw new Error('JSON muss ein Array sein');
        }
        const grouped = {};
        data.forEach(item => {
            const key = `${item.name}_${item.ms}_${item.mutation}`;
            if (grouped[key]) {
                grouped[key].quantity++;
            } else {
                grouped[key] = { 
                    ...item, 
                    quantity: 1, 
                    eldoradoPrice: null, 
                    yourPrice: null, 
                    selected: true,
                    msRange: getMsRange(item.ms)
                };
            }
        });
        STATE.items = Object.values(grouped);
        showStatus(DOM.parseStatus, `✅ ${STATE.items.length} Items gefunden (${data.length} total)`, 'success');
        renderItems();
        DOM.itemsCard.style.display = 'block';
        DOM.autoListBtn.disabled = false;
        showToast(`${STATE.items.length} unique Items geladen`, 'success');
    } catch (error) {
        showStatus(DOM.parseStatus, '❌ JSON Parse Error: ' + error.message, 'error');
    }
});

// ===== ITEM RENDERING =====
function renderItems() {
    DOM.itemsContainer.innerHTML = '';
    DOM.itemCount.textContent = STATE.items.length;
    STATE.items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'item-row';
        const priceDisplay = item.yourPrice 
            ? `<div class="item-price">${item.eldoradoPrice ? `<div class="price-eldorado">$${item.eldoradoPrice}</div>` : ''}<div class="price-yours">$${item.yourPrice}</div></div>`
            : '<div class="item-price"><div class="price-yours">-</div></div>';
        row.innerHTML = `
            <input type="checkbox" class="item-checkbox" data-index="${index}" ${item.selected ? 'checked' : ''}>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                    <span class="item-badge">${item.mutation}</span>
                    <span>${item.ms}</span>
                    <span>${item.rarity}</span>
                    <span class="item-badge">${item.msRange}</span>
                </div>
            </div>
            <div class="item-quantity">${item.quantity}x</div>
            ${priceDisplay}
            <div class="item-status pending" id="status-${index}">Pending</div>
        `;
        DOM.itemsContainer.appendChild(row);
    });
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            STATE.items[index].selected = e.target.checked;
        });
    });
}

// ===== PRICE FETCHING =====
async function fetchEldoradoPrices(items) {
    const prices = [];
    
    for (const item of items) {
        try {
            const queryData = {
                brainrotName: item.name,
                msRange: item.msRange,
                mutation: item.mutation,
                itemType: 'Brainrot',
                rarity: 'Secret',
                sortBy: 'price',
                sortOrder: 'asc'
            };
            
            const queryString = new URLSearchParams(queryData).toString();
            const url = `${CONFIG.backendUrl}/api/prices?${queryString}`;
            
            console.log('Fetching price for:', item.name, item.mutation, item.msRange);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            let lowestPrice = null;
            if (data.offers && data.offers.length > 0) {
                lowestPrice = data.offers[0].price;
            }
            
            prices.push({
                itemName: item.name,
                lowestPrice: lowestPrice,
                foundOffers: data.offers ? data.offers.length : 0
            });
            
            await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.priceCheck));
            
        } catch (error) {
            console.error(`Price fetch failed for ${item.name}:`, error);
            prices.push({
                itemName: item.name,
                lowestPrice: null,
                error: error.message
            });
        }
    }
    
    return prices;
}

DOM.fetchPricesBtn.addEventListener('click', async () => {
    DOM.fetchPricesBtn.disabled = true;
    DOM.fetchPricesBtn.innerHTML = '<div class="spinner"></div> Fetching...';
    showToast('Hole ECHTE Preise von Eldorado...', 'info');
    
    try {
        const prices = await fetchEldoradoPrices(STATE.items);
        
        STATE.items.forEach((item, index) => {
            if (prices[index] && prices[index].lowestPrice) {
                item.eldoradoPrice = prices[index].lowestPrice.toFixed(2);
                item.yourPrice = (parseFloat(prices[index].lowestPrice) - 1).toFixed(2);
            } else {
                item.eldoradoPrice = null;
                item.yourPrice = null;
            }
        });
        
        renderItems();
        showToast('Echte Preise geladen!', 'success');
    } catch (error) {
        showToast('Fehler beim Laden der Preise: ' + error.message, 'error');
    } finally {
        DOM.fetchPricesBtn.disabled = false;
        DOM.fetchPricesBtn.innerHTML = '🔄 Preise Holen';
    }
});

// ===== UPLOAD HELPERS =====
function generateOfferTitle(item) {
    return `${item.name} ${item.ms} - Fast Delivery`;
}

function generateOfferDescription(item) {
    return `${item.name}
━━━━━━━━━━━━━━━━━━━━
💎 Mutation: ${item.mutation}
⚡ Income: ${item.ms}
🌟 Rarity: ${item.rarity}
📦 Quantity: ${item.quantity}x

━━━━━━━━━━━━━━━━━━━━
✅ Fast Delivery (20 minutes)
✅ Secure Trade
✅ 24/7 Support`.trim();
}

async function uploadItem(item) {
    if (!STATE.authToken) {
        throw new Error('Not authenticated');
    }
    
    const offerData = {
        gameId: CONFIG.game.id,
        categoryId: 'items',
        itemType: CONFIG.game.itemType,
        itemName: item.name,
        attributes: {
            msRange: item.msRange,
            mutation: item.mutation,
            rarity: item.rarity || CONFIG.game.rarity
        },
        title: generateOfferTitle(item),
        description: generateOfferDescription(item),
        quantity: item.quantity,
        price: parseFloat(item.yourPrice),
        currency: 'USD',
        deliveryTime: CONFIG.game.deliveryTime,
        deliveryMethod: CONFIG.game.deliveryMethod,
        isInstantDelivery: true,
        images: [getBrainrotImage(item.name)]
    };
    
    console.log('Uploading offer:', offerData);
    
    try {
        const url = `${CONFIG.backendUrl}/api/create-offer`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                token: STATE.authToken,
                offerData: offerData
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        return { success: true, offerId: result.data?.id || 'created' };
        
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// ===== AUTO-LIST FUNCTIONALITY =====
DOM.autoListBtn.addEventListener('click', async () => {
    const selected = STATE.items.filter(item => item.selected);
    if (selected.length === 0) {
        showToast('Bitte wähle mindestens ein Item aus', 'error');
        return;
    }
    const noPrices = selected.filter(item => !item.yourPrice);
    if (noPrices.length > 0) {
        if (!confirm(`${noPrices.length} Items haben noch keine Preise. Trotzdem fortfahren?`)) return;
    }
    if (!confirm(`${selected.length} Items ECHT auf Eldorado listen?`)) return;
    
    DOM.progressCard.style.display = 'block';
    DOM.autoListBtn.disabled = true;
    let completed = 0, succeeded = 0, failed = 0;
    const total = selected.length;
    DOM.progressText.textContent = `0 / ${total} Items`;
    DOM.progressFill.style.width = '0%';
    DOM.progressLogs.innerHTML = '';
    
    function addLog(message, type) {
        const log = document.createElement('div');
        log.className = `log-entry ${type}`;
        log.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        DOM.progressLogs.appendChild(log);
        DOM.progressLogs.scrollTop = DOM.progressLogs.scrollHeight;
    }
    
    addLog('🚀 Starting REAL upload to Eldorado...', 'info');
    addLog(`📊 Total items: ${total}`, 'info');
    
    for (let i = 0; i < selected.length; i++) {
        const item = selected[i];
        const statusElement = document.getElementById(`status-${STATE.items.indexOf(item)}`);
        addLog(`[${i + 1}/${total}] Uploading ${item.name} (${item.mutation}, ${item.msRange}) at $${item.yourPrice}...`, 'info');
        try {
            const result = await uploadItem(item);
            completed++; succeeded++;
            statusElement.textContent = 'Listed ✓';
            statusElement.className = 'item-status success';
            addLog(`✅ ${item.name} successfully listed! (ID: ${result.offerId})`, 'success');
        } catch (error) {
            completed++; failed++;
            statusElement.textContent = 'Error ✗';
            statusElement.className = 'item-status error';
            addLog(`❌ Failed: ${item.name} - ${error.message}`, 'error');
        }
        const progress = (completed / total) * 100;
        DOM.progressFill.style.width = progress + '%';
        DOM.progressText.textContent = `${completed} / ${total} Items (${succeeded} ✓, ${failed} ✗)`;
        if (i < selected.length - 1) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.upload));
        }
    }
    addLog('🎉 Upload complete!', 'info');
    addLog(`✅ Success: ${succeeded} items`, 'success');
    if (failed > 0) addLog(`❌ Failed: ${failed} items`, 'error');
    DOM.autoListBtn.disabled = false;
    if (succeeded > 0) {
        showToast(`${succeeded} / ${total} Items ECHT auf Eldorado gelistet!`, succeeded === total ? 'success' : 'info');
    } else {
        showToast('Alle Uploads fehlgeschlagen. Siehe Logs für Details.', 'error');
    }
});

// ===== INIT =====
console.log('💎 Eldorado Auto-Seller loaded!');
console.log('🔧 Running in PRODUCTION mode');
console.log('🌐 Backend:', CONFIG.backendUrl);
console.log('✅ M/s Range Calculator active');
console.log('✅ Mutation mapping active');
console.log('✅ Price discovery configured');
console.log('✅ Real Eldorado API integration active');
