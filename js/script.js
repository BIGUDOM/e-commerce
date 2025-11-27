/* ---------------- CONFIG (replace EmailJS values to enable real email) */
const EMAILJS_USER_ID = 'OaboFSmGy7o9p2pGm';
const EMAILJS_SERVICE_ID = 'gmail_service';
const EMAILJS_TEMPLATE_ID = 'verification_email';
if (window.emailjs && EMAILJS_USER_ID !== 'OaboFSmGy7o9p2pGm') {
  emailjs.init(EMAILJS_USER_ID);
}

/* ------------------ STORAGE HELPERS ------------------ */
function saveToLS(key, v){ localStorage.setItem(key, JSON.stringify(v)); }
function loadFromLS(key){ try{return JSON.parse(localStorage.getItem(key));}catch(e){return null;}}

/* -------------- DATA INITIALIZATION ------------------ */
// default product set with stock
const defaultProducts = [
  {id:1,name:"iPhone 14",category:"phones",price:999,image:"image/iphone 14.png",stock:20},
  {id:2,name:"Samsung Galaxy S23",category:"phones",price:899,image:"image/Galaxy S23.png",stock:26},
  {id:3,name:"MacBook Pro",category:"laptops",price:2000,image:"image/macbook pro.png",stock:5},
  {id:4,name:"T-Shirt",category:"clothes",price:29,image:"image/t-shirt.png",stock:20},
  {id:5,name:"Air Fryer",category:"home",price:150,image:"image/air fryer.png",stock:4},
  {id:6,name:"Chocolate Cake",category:"food",price:15,image:"image/chocolate cake.png",stock:10},
  {id:7,name:"Nivea",category:"creams",price:30,image:"image/nivea.png",stock:12,badge:"New"},
  {id:8,name:"Dell XPS 13",category:"laptops",price:1300,image:"image/dell xps13.png",stock:2},
  {id:9,name:"HP Spectre",category:"laptops",price:1200,image:"image/HP Spectre.png",stock:2},
  {id:10,name:"Wireless Headphones",category:"accessories",price:60,image:"image/wireless headphones.png",stock:7,badge:"Sale"},
  {id:11,name:"Gaming Mouse",category:"accessories",price:45,image:"image/gaming mouse.png",stock:12},
  {id:12,name:"Backpack",category:"accessories",price:50,image:"image/backpack.png",stock:9},
  {id:13,name:"Leather Jacket",category:"clothes",price:200,image:"image/leather jacket.png",stock:3,badge:"New"},
  {id:14,name:"Sneakers",category:"clothes",price:80,image:"image/sneakers.png",stock:10},
  {id:15,name:"Microwave Oven",category:"home",price:180,image:"image/microwave oven.png",stock:5},
  {id:16,name:"Blender",category:"home",price:90,image:"image/blender.png",stock:6},
  {id:17,name:"Iron",category:"home",price:50,image:"image/iron.png",stock:7},
  {id:18,name:"Ceiling Fan",category:"home",price:120,image:"image/ceiling fan.png",stock:3},
  {id:19,name:"Pizza",category:"food",price:15,image:"image/pizza.png",stock:25,badge:"Sale"},
  {id:20,name:"Body Lotion",category:"creams",price:20,image:"image/vaseline.png",stock:11},
  {id:21,name:"Iphone 17",category:"phones",price:1800,image:"image/iphone 17promax.png",stock:5,badge:"New"}
];

// load or seed products and users
// product data sync system
let stored = loadFromLS('products');

if(!stored){
    // first time ever
    products = defaultProducts.map(p=>({...p}));
} else {
    // merge new array items with stored changes
    products = defaultProducts.map(def => {
        const exist = stored.find(s => s.id === def.id);
        return exist ? {...exist, ...def} : {...def};
    });
}

// ALWAYS save merged result
saveToLS('products', products);


let users = loadFromLS('users') || []; // users: {name,username,email,password,age,role,verified,code,cart:[]}
saveToLS('users', users);

let currentUser = loadFromLS('currentUser') || null;
let guestCart = loadFromLS('guestCart') || [];

/* ------------------ DOM ELEMENTS ------------------ */
const authOverlay = document.getElementById('auth-overlay');
const mainContent = document.getElementById('main-content');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const verifyForm = document.getElementById('verify-form');
const showSigninBtn = document.getElementById('show-signin');
const showSignupBtn = document.getElementById('show-signup');
const resendCodeBtn = document.getElementById('resend-code');
const cartCountEl = document.getElementById('cart-count');
const productContainer = document.getElementById('product-container');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const profileBtn = document.getElementById('profile-btn');
const profileOverlay = document.getElementById('profile-overlay');
const closeProfile = document.getElementById('close-profile');
const profileName = document.getElementById('profile-name');
const profileUsername = document.getElementById('profile-username');
const profileEmail = document.getElementById('profile-email');
const profileAge = document.getElementById('profile-age');
const profileRole = document.getElementById('profile-role');
const logoutBtn = document.getElementById('logout-btn');
const logoutBtnCard = document.getElementById('logout-btn-card');
const sidebarUser = document.getElementById('sidebar-user');
const adminPanel = document.getElementById('admin-panel');
const adminProductsList = document.getElementById('admin-products-list');
const adminAddProductForm = document.getElementById('admin-add-product-form');
const miniCart = document.getElementById('mini-cart');
const miniCartItems = document.getElementById('mini-cart-items');
const miniCartTotal = document.getElementById('mini-cart-total');
const miniContinue = document.getElementById('mini-continue');
const miniView = document.getElementById('mini-view');
const cartLink = document.getElementById('cart-link');
const cartPopup = document.getElementById('cart-popup');
const forgotLink = document.getElementById('forgot-link');
const forgotArea = document.getElementById('forgot-area');
const forgotRequestForm = document.getElementById('forgot-request-form');
const forgotVerifyForm = document.getElementById('forgot-verify-form');
const forgotBack = document.getElementById('forgot-back');

/* ------------------ UTILITIES ------------------ */
function persistAll(){ saveToLS('products', products); saveToLS('users', users); saveToLS('currentUser', currentUser); }
function findUserByUsername(u){ return users.find(x=>x.username===u); }
function sanitizeUsername(u){ return (u||'').trim().toLowerCase(); }
function showAuthOverlay(which='signin'){ authOverlay.style.display='flex'; mainContent.style.display='none'; if(which==='signin'){ loginForm.style.display='block'; signupForm.style.display='none'; verifyForm.style.display='none'; forgotArea.style.display='none' } if(which==='signup'){ loginForm.style.display='none'; signupForm.style.display='block'; verifyForm.style.display='none'; forgotArea.style.display='none' } if(which==='verify'){ loginForm.style.display='none'; signupForm.style.display='none'; verifyForm.style.display='block'; forgotArea.style.display='none' } if(which==='forgot'){ loginForm.style.display='none'; signupForm.style.display='none'; verifyForm.style.display='none'; forgotArea.style.display='block' } }
function showMain(){ authOverlay.style.display='none'; mainContent.style.display='block'; }
function updateCartCount(){ const count = (currentUser && Array.isArray(currentUser.cart))? currentUser.cart.length : (guestCart.length||0); cartCountEl.textContent = count; }
function notify(msg, time=1200){ cartPopup.textContent = msg; cartPopup.style.display='block'; setTimeout(()=>cartPopup.style.display='none', time); }

/* ------------------ AUTH FLOW ------------------ */
let signupPending = null; // stores pending user during verification
let forgotFlow = null;    // {username,code,email}

showSigninBtn.addEventListener('click', ()=> showAuthOverlay('signin'));
showSignupBtn.addEventListener('click', ()=> showAuthOverlay('signup'));

function sendEmailFallback(email, name, code, purpose='verification'){
  // attempt EmailJS if configured otherwise fallback to console
  if (window.emailjs && EMAILJS_SERVICE_ID !== 'gmail_service') {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { to_email: email, to_name: name, code, purpose })
      .then(()=>console.log('email dispatched', purpose))
      .catch(e=>console.error('email err', e));
  } else {
    console.log(`[${purpose}] code for ${email}:`, code);
  }
}

// Signup
signupForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const username = sanitizeUsername(document.getElementById('signup-username').value);
  const age = Number(document.getElementById('signup-age').value);
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-pass').value;
  const role = document.getElementById('signup-role').value || 'buyer';

  if(!username || !password){ alert('Username and password required'); return; }
  if(findUserByUsername(username)){ alert('Username already exists'); return; }

  const code = String(Math.floor(100000 + Math.random()*900000));
  const newUser = { name, username, age, email, password, role, verified:false, code, cart:[] };
  users.push(newUser);
  saveToLS('users', users);
  signupPending = newUser;
  // send code
  sendEmailFallback(email, name, code, 'verification');
  alert('Verification code sent (check console if EmailJS not configured).');
  showAuthOverlay('verify');
});

// Resend code for signup
resendCodeBtn.addEventListener('click', ()=>{
  const target = signupPending || currentUser;
  if(!target){ alert('No pending code'); return; }
  target.code = String(Math.floor(100000 + Math.random()*900000));
  saveToLS('users', users);
  sendEmailFallback(target.email, target.name, target.code, 'verification');
  alert('Code resent.');
});

// Verify (signup)
verifyForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const code = document.getElementById('verify-code').value.trim();
  if(!signupPending){ alert('No pending signup'); return; }
  if(String(signupPending.code) === code){
    signupPending.verified = true;
    // set as current user and persist
    currentUser = signupPending;
    saveToLS('currentUser', currentUser);
    saveToLS('users', users);
    signupPending = null;
    renderAfterAuth();
    notify('Account verified — welcome!');
    return;
  } else {
    alert('Invalid code');
  }
});

/* ------------------ INITIAL APP LAUNCH / LOGIN FIX ------------------ */
// function init(){
//   // Load products from LS or seed defaults
//   let storedProducts = loadFromLS('products');
//   if(!storedProducts){
//     // first time: clone defaultProducts
//     products = defaultProducts.map(p => ({ ...p }));
//     saveToLS('products', products);
//   } else {
//     products = storedProducts;
//   }

//   // Load users
//   users = loadFromLS('users') || [];
//   saveToLS('users', users);

//   // Load current user if exists
//   currentUser = loadFromLS('currentUser');

//   if(currentUser && currentUser.verified){
//     // Make sure currentUser.cart is initialized
//     if(!Array.isArray(currentUser.cart)) currentUser.cart = [];
//     renderAfterAuth();
//   } else {
//     showAuthOverlay('signin');
//   }

//   // Hide mini-cart by default
//   miniCart.style.display = 'none';
//   updateCartCount();
// }

/* ------------------ LOGIN EVENT ------------------ */
loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const username = sanitizeUsername(document.getElementById('login-username').value);
  const pass = document.getElementById('login-pass').value;

  const u = users.find(x => x.username === username && x.password === pass);
  if(!u){ alert('Invalid credentials'); return; }
  if(!u.verified){ signupPending = u; showAuthOverlay('verify'); return; }

  currentUser = u;

  // ensure cart exists
  if(!Array.isArray(currentUser.cart)) currentUser.cart = [];
  saveToLS('currentUser', currentUser);

  // reload & sync products on login
  let stored2 = loadFromLS('products');

  products = defaultProducts.map(def => {
    const exist = stored2?.find(s => s.id === def.id);
    return exist ? {...exist, ...def} : {...def};
  });

  saveToLS('products', products);

  renderAfterAuth();
  notify('Welcome back!');
});



// Logout
function doLogout(){
  // persist current user's cart into user record
  if(currentUser){
    const idx = users.findIndex(u=>u.username===currentUser.username);
    if(idx>=0){ users[idx] = currentUser; saveToLS('users', users); }
  }
  currentUser = null;
  saveToLS('currentUser', null);
  showAuthOverlay('signin');
  updateCartCount();
}
logoutBtn.addEventListener('click', doLogout);
logoutBtnCard.addEventListener('click', doLogout);

// profile overlay
profileBtn.addEventListener('click', ()=>{
  if(!currentUser) return;
  profileName.textContent = currentUser.name || 'User';
  profileUsername.textContent = currentUser.username || '';
  profileEmail.textContent = currentUser.email || '';
  profileAge.textContent = currentUser.age || '';
  profileRole.textContent = currentUser.role || '';
  profileOverlay.style.display = 'flex';
});
closeProfile.addEventListener('click', ()=> profileOverlay.style.display='none');

/* ------------------ FORGOT PASSWORD ------------------ */
forgotLink.addEventListener('click', (e)=>{ e.preventDefault(); showAuthOverlay('forgot'); forgotRequestForm.style.display='block'; forgotVerifyForm.style.display='none'; });

forgotRequestForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const u = users.find(x=>x.email===email);
  if(!u){ alert('No account with that email'); return; }
  const code = String(Math.floor(100000 + Math.random()*900000));
  forgotFlow = { username: u.username, email, code };
  sendEmailFallback(email, u.name, code, 'reset');
  alert('Reset code sent (check console if EmailJS not configured).');
  forgotRequestForm.style.display = 'none';
  forgotVerifyForm.style.display = 'block';
});

forgotVerifyForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const code = document.getElementById('forgot-code').value.trim();
  const newPass = document.getElementById('forgot-new-pass').value;
  if(!forgotFlow || String(forgotFlow.code)!==code){ alert('Invalid code'); return; }
  const idx = users.findIndex(x=>x.username===forgotFlow.username);
  if(idx<0){ alert('User not found'); return; }
  users[idx].password = newPass;
  saveToLS('users', users);
  alert('Password reset. You can now login.');
  forgotFlow = null;
  showAuthOverlay('signin');
});

forgotBack.addEventListener('click', (e)=>{ e.preventDefault(); showAuthOverlay('signin'); });

/* ------------------ PRODUCTS / RENDER ------------------ */
/* ------------------ RENDER PRODUCTS (ROBUST) ------------------ */
function renderProducts(list = products) {
  // Ensure container exists
  if (!productContainer) return;

  // Clear container
  productContainer.innerHTML = '';

  // Check if list is valid
  if (!Array.isArray(list) || list.length === 0) {
    productContainer.innerHTML = '<p style="color:var(--muted); text-align:center;">No products found.</p>';
    return;
  }

  list.forEach(p => {
    const id = p.id || 0;
    const name = p.name || 'Unnamed Product';
    const price = p.price || 0;
    const image = p.image || 'https://via.placeholder.com/300?text=No+Image';
    const stock = typeof p.stock === 'number' ? p.stock : 0;
    const badge = p.badge || '';

    // Create card element
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      ${badge ? `<div class="badge">${badge}</div>` : ''}
      <img src="${image}" alt="${name}" />
      <h4>${name}</h4>
      <p>$${price}</p>
      <p style="color:var(--muted)">Stock: <strong>${stock}</strong></p>
      <div style="display:flex; gap:6px; justify-content:center; margin-top:8px;"></div>
    `;

    const btnWrap = card.querySelector('div:last-child');

    // Add to cart button
    const addBtn = document.createElement('button');
    addBtn.textContent = stock > 0 ? 'Add to cart' : 'Out of stock';
    addBtn.disabled = stock <= 0;
    addBtn.onclick = () => addToCart(id);
    btnWrap.appendChild(addBtn);

    // Admin edit button
    if (currentUser && currentUser.role === 'admin') {
      const editBtn = document.createElement('button');
      editBtn.style.background = '#111';
      editBtn.style.color = '#fff';
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => adminEditProduct(id);
      btnWrap.appendChild(editBtn);
    }

    // Append card to container
    productContainer.appendChild(card);
  });
}


/* Filter / search / sort */
function filterCategory(cat){
  const buttons = document.querySelectorAll('.categories button');
  buttons.forEach(b=>b.classList.remove('active'));
  const sel = document.querySelector(`.categories button[data-cat="${cat}"]`);
  if(sel) sel.classList.add('active');
  const out = (cat==='all') ? products : products.filter(x=>x.category===cat);
  renderProducts(out);
}
window.filterCategory = filterCategory;

searchInput.addEventListener('input', ()=>{
  const t = searchInput.value.trim().toLowerCase();
  const out = products.filter(p => p.name.toLowerCase().includes(t));
  renderProducts(out);
});
sortSelect.addEventListener('change', ()=>{
  const val = sortSelect.value;
  const sorted = [...products];
  if(val==='price-asc') sorted.sort((a,b)=>a.price-b.price);
  if(val==='price-desc') sorted.sort((a,b)=>b.price-a.price);
  if(val==='name-asc') sorted.sort((a,b)=>a.name.localeCompare(b.name));
  if(val==='name-desc') sorted.sort((a,b)=>b.name.localeCompare(a.name));
  renderProducts(sorted);
});

/* ------------------ CART (persistent per-user) ------------------ */
function getActiveCart(){
  return currentUser ? currentUser.cart : guestCart;
}
function saveActiveCart(){
  if(currentUser){
    // ensure in users array
    const idx = users.findIndex(u=>u.username===currentUser.username);
    if(idx>=0){ users[idx].cart = currentUser.cart; saveToLS('users', users); }
    saveToLS('currentUser', currentUser);
  } else {
    saveToLS('guestCart', guestCart);
  }
  updateCartCount();
}

function addToCart(productId){
  const product = products.find(p=>p.id===productId);
  if(!product) return;
  // role enforcement
  const role = currentUser ? currentUser.role : 'buyer';
  if(role !== 'buyer'){ alert('Only buyers can add items to cart.'); return; }
  if(product.stock <= 0){ alert('Out of stock'); return; }

  // decrement stock immediately (live stock)
  product.stock = Math.max(0, product.stock - 1);
  saveToLS('products', products);

  // add to cart (a simple snapshot of item)
  const item = { id:product.id, name:product.name, price:product.price, image:product.image };
  if(currentUser){
    currentUser.cart = currentUser.cart || [];
    currentUser.cart.push(item);
    saveToLS('currentUser', currentUser);
    // update in users array
    const uidx = users.findIndex(u=>u.username===currentUser.username);
    if(uidx>=0){ users[uidx] = currentUser; saveToLS('users', users); }
  } else {
    guestCart.push(item);
    saveToLS('guestCart', guestCart);
  }

  updateCartCount();
  renderProducts(products);
  showMiniCart();
  notify('Added to cart');
}

/* mini cart preview */
function showMiniCart(){
  const cartItems = getActiveCart() || [];
  miniCartItems.innerHTML = '';
  if(cartItems.length===0){ miniCartItems.innerHTML = '<div style="color:var(--muted)">No items yet</div>'; miniCartTotal.textContent = 'Total: $0'; }
  else {
    cartItems.forEach(it=>{
      const el = document.createElement('div');
      el.className = 'mini-cart-item';
      el.innerHTML = `<img src="${it.image}" alt="${it.name}" /><div style="flex:1"><div>${it.name}</div><div style="color:var(--muted)">$${it.price}</div></div>`;
      miniCartItems.appendChild(el);
    });
    miniCartTotal.textContent = 'Total: $' + cartItems.reduce((s,x)=>s+x.price,0);
  }
  miniCart.style.display = 'block';
}
miniView.addEventListener('click', ()=> window.location.href = 'cart.html');
miniContinue.addEventListener('click', ()=> miniCart.style.display='none');

/* ------------------ ADMIN PANEL (CRUD & stock) ------------------ */
function renderAdminPanel(){
  if(!adminProductsList) return;
  adminProductsList.innerHTML = '';
  products.forEach(p=>{
    const row = document.createElement('div');
    row.className = 'admin-prod-row';
    row.innerHTML = `
      <div style="flex:1"><strong>${p.name}</strong> (id:${p.id})</div>
      <div>Price: <input class="adm-price" data-id="${p.id}" value="${p.price}" style="width:100px"/></div>
      <div>Stock: <input class="adm-stock" data-id="${p.id}" value="${p.stock}" style="width:80px"/></div>
      <button class="adm-save" data-id="${p.id}">Save</button>
      <button class="adm-delete" data-id="${p.id}">Delete</button>
    `;
    adminProductsList.appendChild(row);
  });
  // attach events
  adminProductsList.querySelectorAll('.adm-save').forEach(btn=>{
    btn.onclick = ()=>{
      const id = Number(btn.dataset.id);
      const price = Number(adminProductsList.querySelector(`.adm-price[data-id="${id}"]`).value);
      const stock = Number(adminProductsList.querySelector(`.adm-stock[data-id="${id}"]`).value);
      const idx = products.findIndex(x=>x.id===id);
      if(idx>=0){ products[idx].price = price; products[idx].stock = stock; saveToLS('products', products); renderProducts(products); renderAdminPanel(); alert('Saved'); }
    };
  });
  adminProductsList.querySelectorAll('.adm-delete').forEach(btn=>{
    btn.onclick = ()=>{
      if(!confirm('Delete product?')) return;
      const id = Number(btn.dataset.id);
      products = products.filter(x=>x.id!==id);
      saveToLS('products', products);
      renderProducts(products);
      renderAdminPanel();
    };
  });
}
adminAddProductForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const name = document.getElementById('admin-prod-name').value.trim();
  const category = document.getElementById('admin-prod-category').value.trim();
  const price = Number(document.getElementById('admin-prod-price').value);
  const stock = Number(document.getElementById('admin-prod-stock').value);
  const image = document.getElementById('admin-prod-image').value.trim() || 'https://via.placeholder.com/300';
  const id = (products.reduce((m,p)=>Math.max(m,p.id),0) || 0) + 1;
  products.push({id,name,category,price,stock,image});
  saveToLS('products', products);
  renderProducts(products);
  renderAdminPanel();
  adminAddProductForm.reset();
});

/* helper used by product card edit button */
adminProductsList.querySelectorAll('.adm-save').forEach(btn=>{
  btn.onclick = ()=>{
    const id = Number(btn.dataset.id);

    const priceInput = document.querySelector(`.adm-price[data-id="${id}"]`);
    const stockInput = document.querySelector(`.adm-stock[data-id="${id}"]`);

    const newPrice = Number(priceInput.value);
    const newStock = Number(stockInput.value);

    const p = products.find(x=>x.id===id);
    if(!p) return;

    p.price = newPrice;
    p.stock = newStock;

    saveToLS('products', products);

    renderProducts(products);
    renderAdminPanel();
    notify('Product saved');
  };
});


adminProductsList.querySelectorAll('.adm-delete').forEach(btn=>{
  btn.onclick = ()=>{
    const id = Number(btn.dataset.id);
    products = products.filter(p=>p.id !== id);

    saveToLS('products', products);

    renderProducts(products);
    renderAdminPanel();
    notify('Product deleted');
  };
});

/* ------------------ UI state after login/signup ------------------ */
/* ------------------ UI STATE AFTER LOGIN / SIGNUP ------------------ */
/* ------------------ FULL INIT & LOGIN FIX ------------------ */
function renderAfterAuth() {
  // Hide auth overlay, show main content
  showMain();

  // Ensure currentUser has a cart array
  if(currentUser && !Array.isArray(currentUser.cart)) currentUser.cart = [];

  // Restore guest cart if not logged in
  if(!currentUser) guestCart = loadFromLS('guestCart') || [];

  // Update sidebar user
  sidebarUser.textContent = currentUser ? `${currentUser.username} (${currentUser.role})` : 'Guest';

  // Show/hide profile and logout buttons
  logoutBtn.style.display = currentUser ? 'inline-block' : 'none';
  profileBtn.style.display = currentUser ? 'inline-block' : 'none';

  // Show/hide cart link
  cartLink.style.display = currentUser && currentUser.role === 'seller' ? 'none' : 'inline-block';

  // Admin panel
  if(currentUser && currentUser.role === 'admin'){
    adminPanel.style.display = 'block';
    renderAdminPanel();
  } else {
    adminPanel.style.display = 'none';
  }

  // Load products fresh from localStorage
  products = loadFromLS('products') || defaultProducts.slice();
  renderProducts(products);

  // Update mini-cart
  updateCartCount();
  showMiniCart();
}

/* ------------------ INIT APP ------------------ */
/* ------------------ DEFAULT PRODUCTS VERSION ------------------ */

/* ------------------ INIT APP ------------------ */
function init() {
  // Load stored version
  const storedVersion = loadFromLS('products_version');

  // If no stored products or version mismatch, seed defaultProducts
  if (!loadFromLS('products') || storedVersion !== DEFAULT_PRODUCTS_VERSION) {
    products = defaultProducts.map(p => ({ ...p })); // clone
    saveToLS('products', products);
    saveToLS('products_version', DEFAULT_PRODUCTS_VERSION);
  } else {
    products = loadFromLS('products');
  }

  // Load users & currentUser
  users = loadFromLS('users') || [];
  saveToLS('users', users);

  currentUser = loadFromLS('currentUser');

  // After login / verified user
  if (currentUser && currentUser.verified) {
    renderAfterAuth();
  } else {
    showAuthOverlay('signin');
  }

  // Wire mini-cart buttons
  miniContinue.addEventListener('click', () => miniCart.style.display='none');
  miniView.addEventListener('click', () => window.location.href='cart.html');

  // Update cart count
  updateCartCount();
}

/* ------------------ GLOBAL APP OBJECT ------------------ */
window.app = {
  products,
  users,
  currentUser,
  productsVersion: DEFAULT_PRODUCTS_VERSION,
  saveState: () => {
    saveToLS('products', products);
    saveToLS('products_version', DEFAULT_PRODUCTS_VERSION);
    saveToLS('users', users);
    saveToLS('currentUser', currentUser);
  }
};

// Run init
init();
