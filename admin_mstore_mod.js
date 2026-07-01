const MSTORE_STORAGE_KEY = 'mneet_store_products_db';

export function getMStoreLayout() {
    return `
    <style>
        .mstore-manager-panel { max-width: 600px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .mstore-form-card { background: var(--bg-surface); padding: 20px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 30px; }
        .mstore-heading { text-align: center; color: var(--gold); font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
        .input-label { display: block; font-weight: 700; margin-bottom: 6px; font-size: 13px; color: var(--text-title); }
        
        .custom-input { width: 100%; padding: 12px; border: var(--black-stroke) !important; border-radius: 10px; font-size: 14px; margin-bottom: 14px; background: var(--bg-input) !important; color: var(--text-title) !important; outline: none; font-weight: 600; }
        .custom-input:focus { border-color: var(--gold) !important; }
        
        .flex-row { display: flex; gap: 12px; }
        .flex-row > div { flex: 1; }
        
        .btn-action-store { width: 100%; background: var(--gold) !important; color: #000000 !important; font-weight: 900; padding: 14px; border: var(--black-stroke); border-radius: 12px; text-transform: uppercase; box-shadow: 4px 4px 0px #000000; cursor: pointer; font-size: 15px; }
        .btn-action-store:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000000; }
        
        .section-divider { font-size: 18px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 25px 0 20px 0; text-transform: uppercase; }
        
        /* 📦 PREMIUM MSTORE ITEM GRID CARD */
        .store-item-card { 
            background: var(--bg-surface) !important; 
            color: var(--text-title) !important;
            border: var(--black-stroke); 
            border-radius: 16px; 
            padding: 16px; 
            margin-bottom: 16px; 
            box-shadow: 4px 4px 0px #000000; 
            position: relative;
            overflow: hidden;
            display: flex;
            gap: 14px;
            align-items: center;
        }
        .product-preview-thumb { width: 75px; height: 75px; border-radius: 10px; border: var(--black-stroke); background-size: cover; background-position: center; flex-shrink: 0; background-color: var(--bg-input); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--gold); }
        .product-details { flex-grow: 1; min-width: 0; }
        .product-title { font-size: 18px; font-weight: 900; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .product-cat-tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; background: var(--bg-input); color: var(--gold); border: 1px solid var(--border-line); margin-bottom: 6px; text-transform: uppercase; }
        
        .product-meta-row { display: flex; gap: 12px; font-size: 12px; font-weight: 700; color: var(--text-para); margin-top: 4px; }
        .product-price-badge { font-size: 16px; font-weight: 900; color: var(--text-title); margin-top: 6px; }
        
        .admin-modifier-row { display: flex; flex-direction: column; gap: 6px; justify-content: center; }
        .mod-btn { border: var(--black-stroke); background: var(--bg-surface); color: var(--text-title); padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 800; box-shadow: 2px 2px 0px #000000; display: flex; align-items: center; gap: 4px; }
        .mod-btn:active { transform: translate(1px, 1px); box-shadow: 0px 0px 0px #000000; }
    </style>

    <div class="mstore-manager-panel">
        <div class="mstore-form-card">
            <h2 class="mstore-heading">mStore Product Publisher</h2>
            <form id="modMStoreForm">
                <input type="hidden" id="formProductId" value="">
                
                <label class="input-label">Product / Material Item Name</label>
                <input type="text" id="pName" class="custom-input" placeholder="e.g., NEET Complete Biology Punch Vol 1" required>

                <label class="input-label">Product Description / Highlights</label>
                <textarea id="pDesc" class="custom-input" rows="2" placeholder="Item highlights details add..." required></textarea>

                <label class="input-label">Product Image Reference Link</label>
                <input type="text" id="pImage" class="custom-input" placeholder="https://domain.com/book-cover.jpg">

                <div class="flex-row">
                    <div>
                        <label class="input-label">Base Price (INR)</label>
                        <input type="number" id="pBasePrice" class="custom-input" value="500" min="0" required>
                    </div>
                    <div>
                        <label class="input-label">Discount Percentage (%)</label>
                        <input type="number" id="pDiscount" class="custom-input" value="15" min="0" max="100" required>
                    </div>
                </div>

                <div class="price-panel">Final Market Price: ₹<span id="pFinalCalc">425</span></div>

                <div class="flex-row">
                    <div>
                        <label class="input-label">Product Category</label>
                        <select id="pCategory" class="custom-input">
                            <option value="Printed Books">Printed Books / Notes</option>
                            <option value="Mindmaps Combo">Mindmaps Combo</option>
                            <option value="Offline Test Series">Offline OMR Test Pack</option>
                            <option value="Access Token Voucher">Access Token Voucher</option>
                        </select>
                    </div>
                    <div>
                        <label class="input-label">Inventory Stock Status</label>
                        <select id="pStock" class="custom-input">
                            <option value="In Stock">In Stock / Available</option>
                            <option value="Out of Stock">Out of Stock / Lock</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn-action-store" id="mstoreSubmitBtn">Publish to mStore</button>
            </form>
        </div>

        <h3 class="section-divider">mStore Inventory Catalog</h3>
        <div id="renderMStoreQueue"></div>
    </div>
    `;
}

export function initMStoreLogic() {
    const form = document.getElementById('modMStoreForm');
    const baseInput = document.getElementById('pBasePrice');
    const discInput = document.getElementById('pDiscount');
    const finalCalc = document.getElementById('pFinalCalc');
    const queueArea = document.getElementById('renderMStoreQueue');

    function updateCalculatedPrice() {
        let base = parseFloat(baseInput.value) || 0;
        let disc = parseFloat(discInput.value) || 0;
        let final = base - (base * (disc / 100));
        finalCalc.innerText = final.toFixed(0);
    }

    baseInput.addEventListener('input', updateCalculatedPrice);
    discInput.addEventListener('input', updateCalculatedPrice);

    function fetchState() { return JSON.parse(localStorage.getItem(MSTORE_STORAGE_KEY)) || []; }
    function saveState(arr) { localStorage.setItem(MSTORE_STORAGE_KEY, JSON.stringify(arr)); renderQueue(); }

    function renderQueue() {
        let arr = fetchState();
        queueArea.innerHTML = '';
        
        if(arr.length === 0) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No store products cataloged yet.</p>`;
            return;
        }
        
        arr.forEach(item => {
            let card = document.createElement('div');
            card.className = `store-item-card`;
            
            let thumbStyle = item.image ? `style="background-image: url('${item.image}');"` : '';
            let fallbackIcon = item.image ? '' : '<i class="fas fa-book-open"></i>';
            
            card.innerHTML = `
                <div class="product-preview-thumb" ${thumbStyle}>${fallbackIcon}</div>
                <div class="product-details">
                    <span class="product-cat-tag">${item.category}</span>
                    <h3 class="product-title">${item.name}</h3>
                    <div class="product-meta-row">
                        <span>Status: <strong style="color:var(--gold);">${item.stock}</strong></span>
                    </div>
                    <div class="product-price-badge">₹${item.finalPrice} <span style="font-size:11px; text-decoration:line-through; opacity:0.5;">₹${item.basePrice}</span></div>
                </div>
                <div class="admin-modifier-row">
                    <button class="mod-btn act-edit" data-id="${item.id}"><i class="fas fa-edit" style="color:#2563EB;"></i></button>
                    <button class="mod-btn act-del" data-id="${item.id}"><i class="fas fa-trash" style="color:#EF4444;"></i></button>
                </div>
            `;
            queueArea.appendChild(card);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let arr = fetchState();
        let targetId = document.getElementById('formProductId').value;

        let data = {
            id: targetId ? parseInt(targetId) : Date.now(),
            name: document.getElementById('pName').value,
            desc: document.getElementById('pDesc').value,
            image: document.getElementById('pImage').value,
            basePrice: baseInput.value,
            discount: discInput.value,
            finalPrice: finalCalc.innerText,
            category: document.getElementById('pCategory').value,
            stock: document.getElementById('pStock').value
        };

        if(targetId) {
            arr = arr.map(p => p.id == targetId ? data : p);
            document.getElementById('mstoreSubmitBtn').innerText = "Publish to mStore";
            document.getElementById('formProductId').value = "";
        } else {
            arr.push(data);
        }
        saveState(arr);
        form.reset();
        updateCalculatedPrice();
    });

    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.mod-btn');
        if(!btn) return;
        let id = parseInt(btn.dataset.id);
        let arr = fetchState();

        if(btn.classList.contains('act-edit')) {
            let item = arr.find(p => p.id === id);
            if(item) {
                document.getElementById('formProductId').value = item.id;
                document.getElementById('pName').value = item.name;
                document.getElementById('pDesc').value = item.desc;
                document.getElementById('pImage').value = item.image;
                baseInput.value = item.basePrice;
                discInput.value = item.discount;
                finalCalc.innerText = item.finalPrice;
                document.getElementById('pCategory').value = item.category;
                document.getElementById('pStock').value = item.stock;
                document.getElementById('mstoreSubmitBtn').innerText = "Update Product";
                document.getElementById('admin-main-render-area').scrollTo({top: 0, behavior: 'smooth'});
            }
        } else if(btn.classList.contains('act-del')) {
            if(confirm("Are you sure to delete this product from stock catalog?")) {
                arr = arr.filter(p => p.id !== id);
                saveState(arr);
            }
        }
    });

    renderQueue();
                                              }
                              
