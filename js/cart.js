let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Group items by category
function groupByCategory(items){
  return items.reduce((acc, item)=>{
    if(!item.quantity) item.quantity=1;
    if(!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

// Update cart count
function updateCartCount(){
  const count = document.getElementById("cart-count");
  if(count) count.innerText = cart.reduce((acc,i)=>acc+i.quantity,0);
}

// Animate total
function animateTotal(element, newTotal){
  const current = parseFloat(element.getAttribute('data-total')) || 0;
  const diff = newTotal - current;
  let start = null;
  function step(timestamp){
    if(!start) start=timestamp;
    const progress = Math.min((timestamp-start)/300,1);
    const value = Math.round(current+diff*progress);
    element.innerText = `Total: $${value}`;
    if(progress<1) requestAnimationFrame(step);
    else element.setAttribute('data-total', newTotal);
  }
  requestAnimationFrame(step);
}

// Load Cart
function loadCart(){
  const cartItemsDiv = document.getElementById("cart-items");
  const cartTotalDiv = document.getElementById("cart-total");
  if(!cartItemsDiv) return;

  cartItemsDiv.innerHTML = "";
  if(cart.length===0){
    cartItemsDiv.innerHTML = "<p style='text-align:center;color:#666;'>Your cart is empty.</p>";
    cartTotalDiv.innerText="";
    updateCartCount();
    return;
  }

  const grouped = groupByCategory(cart);
  let overallTotal = 0;

  for(let category in grouped){
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category-group";

    const categoryTitle = document.createElement("h3");
    categoryTitle.innerText = category.charAt(0).toUpperCase()+category.slice(1);
    categoryDiv.appendChild(categoryTitle);

    let categoryTotal = 0;
    grouped[category].forEach(item=>{
      const realIndex = cart.findIndex(c=>c.id===item.id && c.category===item.category);
      categoryTotal += item.price*item.quantity;

      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div>
          <span>${item.name}</span>
          <span class="category">${item.category.charAt(0).toUpperCase()+item.category.slice(1)}</span>
          <div class="quantity-controls">
            <button onclick="decreaseQty(${realIndex})">−</button>
            <span class="qty">${item.quantity}</span>
            <button onclick="increaseQty(${realIndex})">+</button>
          </div>
        </div>
        <button onclick="removeFromCart(${realIndex})">Remove</button>
      `;
      categoryDiv.appendChild(cartItem);
    });

    const categorySub = document.createElement("div");
    categorySub.className = "category-subtotal";
    categorySub.innerText = `Subtotal: $${categoryTotal}`;
    categoryDiv.appendChild(categorySub);

    cartItemsDiv.appendChild(categoryDiv);
    overallTotal += categoryTotal;
  }

  animateTotal(cartTotalDiv, overallTotal);
  updateCartCount();
}

// Quantity Controls
function increaseQty(index){
  cart[index].quantity += 1;
  localStorage.setItem("cart",JSON.stringify(cart));
  loadCart();
  showMiniCart();
}

function decreaseQty(index){
  if(cart[index].quantity>1){
    cart[index].quantity -=1;
  } else removeFromCart(index);
  localStorage.setItem("cart",JSON.stringify(cart));
  loadCart();
  showMiniCart();
}

// Remove Item
function removeFromCart(index){
  cart.splice(index,1);
  localStorage.setItem("cart",JSON.stringify(cart));
  loadCart();
}

// Mini Cart Flyout
function showMiniCart(){
  const miniCart = document.getElementById("mini-cart");
  const miniCartItems = document.getElementById("mini-cart-items");
  const miniCartTotal = document.getElementById("mini-cart-total");

  if(cart.length===0){
    miniCartItems.innerHTML="<p style='text-align:center;color:#666;'>Cart is empty</p>";
    miniCartTotal.innerText="";
    miniCart.classList.remove("show");
    return;
  }

  miniCartItems.innerHTML="";
  cart.forEach(item=>{
    const div = document.createElement("div");
    div.className="mini-cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span>${item.name} x${item.quantity} - $${item.price*item.quantity}</span>
    `;
    miniCartItems.appendChild(div);
  });

  const total = cart.reduce((acc,i)=>acc+i.price*i.quantity,0);
  miniCartTotal.innerText = `Total: $${total}`;
  miniCart.classList.add("show");

  setTimeout(()=>miniCart.classList.remove("show"),3500);
}

// Checkout & Confetti
const checkoutForm = document.getElementById("checkout-form");
if(checkoutForm){
  checkoutForm.addEventListener("submit", function(e){
    e.preventDefault();
    if(cart.length===0){ alert("Your cart is empty!"); return;}
    cart=[]; localStorage.setItem("cart",JSON.stringify(cart));
    loadCart();
    document.getElementById("checkout-message").innerText="Order placed successfully!";
    checkoutForm.reset();
    launchConfetti();
  });
}

// Confetti
function launchConfetti(){
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = [];
  for(let i=0;i<150;i++){
    pieces.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height-100,
      r: Math.random()*6+4,
      d: Math.random()*15+5,
      color: `hsl(${Math.random()*360},70%,50%)`,
      tilt: Math.random()*10-10
    });
  }
  let angle = 0;
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      ctx.beginPath();
      ctx.lineWidth=p.r/2;
      ctx.strokeStyle=p.color;
      ctx.moveTo(p.x+p.tilt+angle, p.y);
      ctx.lineTo(p.x+p.tilt, p.y+p.d);
      ctx.stroke();
    });
    update();
  }
  function update(){
    angle +=0.01;
    pieces.forEach(p=>{
      p.y += Math.cos(angle+p.d)*0.5 +0.5;
      p.x += Math.sin(angle)*0.5;
      if(p.y>canvas.height){ p.y=-10; p.x=Math.random()*canvas.width;}
    });
    requestAnimationFrame(draw);
  }
  draw();
}

window.onload = loadCart;
