const MSTORE_STORAGE_KEY = 'mneet_store_products_db';

export function getStudentShopLayout() {
    return `
    <style>
        .s-shop-panel { max-width: 600px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .s-shop-hero { background: var(--bg-surface); padding: 18px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 24px; }
        .s-shop-hero h2 { font-size: 20px; font-weight: 900; color: var(--gold); text-transform: uppercase; }
        .s-shop-hero p { font-size: 13px; color: var(--text-para); margin-top: 2px; }
        
        .s-divider { font-size: 16px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 20px 0 15px 0; text-transform: uppercase; color: var(--text-title); }
        
        /* 📦 PREMIUM GRID WRAPPER FOR PRODUCTS */
        .products-grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media(max-width: 450px) {
            .products-grid-container { grid-template-columns: 1fr; }
        }
        
        /* 📚 LUXURY BRAND SHOPPING ITEM CARD */
        .shop-item-grid-card { 
            background: var(--bg-surface) !important; 
            color: var(--text-title) !important;
            border: var(--black-stroke); 
            border-radius: 16px; 
            padding: 14px; 
            box-shadow: 4px 4px 0px #000000; 
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }
        .shop-item-thumb-box { width: 100%; height: 120px; border-radius: 10px; border: var(--black-stroke); background-size: cover; background-position: center; background-color: var(--bg-input); margin-bottom: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 32px; color: var(--gold); }
        
        .shop-cat-badge { display: inline-block; align-self: flex-start; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; background: var(--bg-input); color: var(--gold); border: 1px solid var(--border-line); margin-bottom: 6px; text-transform: uppercase; }
        .shop-item-title { font-size: 15px; font-weight: 900; line-height: 1.3; color: var(--text-title); margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 38px; }
        
        .shop-price-row { display: flex; align-items: baseline; gap: 6px; margin-top: auto; padding-top: 10px; }
        .shop-sell-price { font-size: 18px; font-weight: 900; color: var(--text-title); }
        .shop-mrp-price { font-size: 12px; text-decoration: line-through; opacity: 0.5; font-weight: 600; }
        
        .btn-buy-product { width: 100%; background: var(--gold) !important; color: #000 !important; font-weight: 900; border: var(--black-stroke); padding: 10px; border-radius: 10px; cursor: pointer; font-size: 12px; text-transform: uppercase; box-shadow: 2px 2px 0px #000; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .btn-buy-product:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0px #000; }
        .btn-buy-product.is-out-of-stock { background: #94A3B8 !important; color: #64748B !important; cursor: not-allowed; box-shadow: none; transform: none; }
    </style>

    <div class="s-shop-panel">
        <div class="s-shop-hero">
            <h2>mStore Academic Bookshop</h2>
            <p>Access physical study modules, high-focus mind-maps combo packets, and material toolkits.</p>
        </div>

        <h3 class="s-divider">Available Publications</h3>
        <div class="products-grid-container" id="renderStudentShopGrid"></div>
    </div>
    `;
}

export function initStudentShopLogic() {
    const grid = document.getElementById('renderStudentShopGrid');

    function fetchState() { return JSON.parse(localStorage.getItem(MSTORE_STORAGE_KEY)) || []; }

    function renderStoreGrid() {
        let arr = fetchState();
        grid.innerHTML = '';

        if(arr.length === 0) {
            // Default elegant fallback catalogs initialization parameters if database layer clear
            let fallbackMockSeeds = [
                { id: 201, name: "NEET Biology Target Punch Vol 1", image: "", finalPrice: "340", basePrice: "450", category: "Printed Books", stock: "In Stock" },
                { id: 202, name: "High-Focus 3D Zoology Visual Mindmaps Combo", image: "", finalPrice: "180", basePrice: "250", category: "Mindmaps Combo", stock: "In Stock" }
            ];
            arr = fallbackMockSeeds;
        }

        arr.forEach(product => {
            let itemCard = document.createElement('div');
            itemCard.className = `shop-item-grid-card`;
            
            let imgStyle = product.image ? `style="background-image: url('${product.image}');"` : '';
            let fallbackIcon = product.image ? '' : '<i class="fas fa-book"></i>';
            let outOfStock = product.stock === 'Out of Stock';

            itemCard.innerHTML = `
                <div class="shop-item-thumb-box" ${imgStyle}>${fallbackIcon}</div>
                <span class="shop-cat-badge">${product.category}</span>
                <h4 class="shop-item-title" title="${product.name}">${product.name}</h4>
                
                <div class="shop-price-row">
                    <span class="shop-sell-price">₹${product.finalPrice}</span>
                    <span class="shop-mrp-price">₹${product.basePrice}</span>
                </div>
                
                <button class="btn-buy-product ${outOfStock ? 'is-out-of-stock' : ''}" ${outOfStock ? 'disabled' : ''} onclick="${outOfStock ? '' : "alert('Order placement processing token mapped successfully!')"}">
                    <i class="fas ${outOfStock ? 'fa-lock' : 'fa-shopping-cart'}"></i> ${outOfStock ? 'Out Of Stock' : 'Order Now'}
                </button>
            `;
            grid.appendChild(itemCard);
        });
    }

    renderStoreGrid();
                    }
          
