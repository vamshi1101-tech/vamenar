// ---------- Data ----------
const PRODUCTS = [
  { id:"p-longi-550", name:"LONGi Hi-MO 6 550W Bifacial", brand:"LONGi", category:"Panels", price:16490, mrp:19990, rating:4.7, watt:550, efficiency:22.5, tag:"Top Seller", stock:120 },
  { id:"p-adani-540", name:"Adani Mono PERC 540W", brand:"Adani", category:"Panels", price:14990, mrp:17990, rating:4.6, watt:540, efficiency:21.8, stock:90 },
  { id:"p-trina-600", name:"Trina Vertex 600W", brand:"Trina", category:"Panels", price:18990, mrp:21990, rating:4.8, watt:600, efficiency:23.1, tag:"New", stock:60 },
  { id:"b-exide-5", name:"Exide LFP Battery 5 kWh", brand:"Exide", category:"Batteries", price:124900, mrp:139900, rating:4.5, stock:40 },
  { id:"b-amara-10", name:"Amara Raja 10 kWh LFP", brand:"Amara Raja", category:"Batteries", price:235000, mrp:259000, rating:4.6, tag:"Best Value", stock:35 },
  { id:"i-sungrow-10", name:"Sungrow Hybrid Inverter 10 kW", brand:"Sungrow", category:"Inverters", price:184000, mrp:199000, rating:4.6, efficiency:97.8, stock:50 },
  { id:"i-growatt-5", name:"Growatt SPF 5000ES 5 kW", brand:"Growatt", category:"Inverters", price:88500, mrp:98900, rating:4.4, efficiency:96.5, stock:70 },
  { id:"ev-abb-7", name:"ABB Terra AC 7.4 kW", brand:"ABB", category:"EV Chargers", price:77900, mrp:89900, rating:4.5, stock:55 },
  { id:"ev-tata-30", name:"Tata Power DC Fast 30 kW", brand:"Tata Power", category:"EV Chargers", price:483000, mrp:529000, rating:4.3, tag:"Commercial", stock:12 },
  { id:"sm-hue", name:"Philips Hue Starter Kit", brand:"Philips", category:"Smart Home", price:12999, mrp:16999, rating:4.7, stock:150 },
  { id:"el-lg-55", name:"LG 55\" 4K OLED TV", brand:"LG", category:"Electronics", price:109900, mrp:149900, rating:4.8, tag:"Energy Star", stock:25 },
];
const CATEGORIES = ["Panels","Batteries","Inverters","EV Chargers","Smart Home","Electronics"];
const BRANDS = [...new Set(PRODUCTS.map(p=>p.brand))];

// ---------- State ----------
let STATE = { q:"", category:"All", brand:"All", sort:"popularity", discount:null, rating:null, cart:[], pin:"" };

// ---------- Utils ----------
const inr = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const pct = (mrp, price) => Math.round(((mrp-price)/mrp)*100);

// ---------- Elements ----------
const q = document.getElementById('q');
const suggest = document.getElementById('suggest');
const brandSelect = document.getElementById('brandSelect');
const sortSelect = document.getElementById('sortSelect');
const chips = document.getElementById('categoryChips');
const grid = document.getElementById('grid');
const pin = document.getElementById('pin');
const deliveryHint = document.getElementById('deliveryHint');
const drawer = document.getElementById('drawer');
const cartBtn = document.getElementById('cartBtn');
const bag = document.getElementById('bag');
const sub = document.getElementById('sub');
const gst = document.getElementById('gst');
const tot = document.getElementById('tot');
const checkout = document.getElementById('checkout');
const clearBtn = document.getElementById('clear');
const cartCount = document.getElementById('cartCount');

// ---------- Init Controls ----------
brandSelect.innerHTML = `<option value="All">All Brands</option>` + BRANDS.map(b=>`<option value="${b}">${b}</option>`).join('');
chips.innerHTML = [`<span data-cat="All" class="pill chip active">All</span>`, ...CATEGORIES.map(c=>`<span data-cat="${c}" class="pill chip">${c}</span>`)].join('');

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Event Listeners ----------
q.addEventListener('input', ()=>{ STATE.q = q.value.trim(); render(); renderSuggest(); });
brandSelect.addEventListener('change', ()=>{ STATE.brand = brandSelect.value; render(); });
sortSelect.addEventListener('change', ()=>{ STATE.sort = sortSelect.value; render(); });
chips.addEventListener('click', (e)=>{ const el = e.target.closest('.chip'); if(!el) return; chips.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); el.classList.add('active'); STATE.category = el.getAttribute('data-cat'); render(); });

document.querySelectorAll('[data-discount]').forEach(el=> el.addEventListener('click',()=>{ STATE.discount = Number(el.getAttribute('data-discount')); render(); }));
document.querySelectorAll('[data-rating]').forEach(el=> el.addEventListener('click',()=>{ STATE.rating = Number(el.getAttribute('data-rating')); render(); }));

pin.addEventListener('input', ()=>{ 
  STATE.pin = pin.value; 
  if(pin.value.length===6){ 
    const d = new Date(Date.now()+4*24*3600*1000); 
    deliveryHint.textContent = `Delivery by ${d.toLocaleDateString('en-IN')}`; 
  } else { 
    deliveryHint.textContent = 'Enter pincode to check delivery'; 
  } 
});

cartBtn.addEventListener('click', ()=>{ drawer.classList.toggle('open'); });
clearBtn.addEventListener('click', ()=>{ STATE.cart = []; saveCart(); renderCart(); });
checkout.addEventListener('click', ()=>{ alert('Order placed! (demo)'); STATE.cart = []; saveCart(); renderCart(); drawer.classList.remove('open'); });

// Close drawer on outside click
window.addEventListener('click',(e)=>{ if(e.target===drawer) drawer.classList.remove('open'); });

// ---------- Cart Ops ----------
function addToCart(p){ 
  const f = STATE.cart.find(c=>c.id===p.id); 
  if(f){ f.qty = Math.min(f.qty+1, p.stock); } 
  else { STATE.cart.push({ id:p.id, qty:1 }); } 
  saveCart(); 
  renderCart(); 
  drawer.classList.add('open'); 
}
function changeQty(id, d){ 
  const it = STATE.cart.find(c=>c.id===id); 
  if(!it) return; 
  it.qty = Math.max(1, it.qty + d); 
  saveCart(); 
  renderCart(); 
}
function removeFromCart(id){ 
  STATE.cart = STATE.cart.filter(c=>c.id!==id); 
  saveCart(); 
  renderCart(); 
}
function saveCart(){ 
  localStorage.setItem('vam_cart', JSON.stringify(STATE.cart)); 
  cartCount.textContent = String(STATE.cart.reduce((s,c)=>s+c.qty,0)); 
}
function loadCart(){ 
  try{ STATE.cart = JSON.parse(localStorage.getItem('vam_cart')||'[]'); }catch{ STATE.cart=[] } 
  cartCount.textContent = String(STATE.cart.reduce((s,c)=>s+c.qty,0)); 
}

// ---------- Render ----------
function render(){
  let list = PRODUCTS.filter(p=>
    (STATE.category==='All' || p.category===STATE.category) &&
    (STATE.brand==='All' || p.brand===STATE.brand) &&
    (p.name.toLowerCase().includes(STATE.q.toLowerCase()) || p.brand.toLowerCase().includes(STATE.q.toLowerCase()))
  );
  if(STATE.discount){ list = list.filter(p=> pct(p.mrp,p.price) >= STATE.discount); }
  if(STATE.rating){ list = list.filter(p=> p.rating >= STATE.rating); }
  if(STATE.sort==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(STATE.sort==='price-desc') list.sort((a,b)=>b.price-a.price);
  if(STATE.sort==='rating') list.sort((a,b)=>b.rating-a.rating);
  if(STATE.sort==='discount') list.sort((a,b)=>pct(b.mrp,b.price)-pct(a.mrp,a.price));

  grid.innerHTML = list.map(p=>`
    <div class="card product">
      <div class="thumb">${p.category}</div>
      <div class="p-head">
        <div style="min-width:0">
          <div class="p-meta">${p.brand} • ${p.category}</div>
          <div class="p-title">${p.name}</div>
        </div>
        <button class="btn ghost" aria-label="wishlist">♡</button>
      </div>
      <div class="bd" style="padding-top:0">
        <div style="display:flex;gap:6px;align-items:center;margin:6px 0 10px">
          <span class="pill">★ ${p.rating.toFixed(1)}</span>
          <span class="pill badge">${pct(p.mrp,p.price)}% off</span>
          ${p.tag?`<span class="tag">${p.tag}</span>`:''}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <b>${inr(p.price)}</b><span class="strike">${inr(p.mrp)}</span>
            ${p.watt?`<div style="font-size:12px;margin-top:4px">${p.watt} W • ${p.efficiency||''}% eff</div>`:''}
          </div>
          <button class="btn primary" data-add="${p.id}">Add</button>
        </div>
      </div>
    </div>
  `).join('');

  // bind add buttons
  grid.querySelectorAll('[data-add]').forEach(btn=> btn.addEventListener('click', ()=>{
    const id = btn.getAttribute('data-add');
    const prod = PRODUCTS.find(p=>p.id===id);
    if(prod) addToCart(prod);
  }));
}

function renderSuggest(){
  const qv = STATE.q.toLowerCase();
  if(!qv){ suggest.style.display='none'; return; }
  const list = PRODUCTS.filter(p=> p.name.toLowerCase().includes(qv)).slice(0,6);
  if(!list.length){ suggest.style.display='none'; return; }
  suggest.style.display='block';
  suggest.innerHTML = list.map(p=>`<div data-sel="${p.name}"><span>${p.name}</span><span style="color:#8aa0b7">${p.brand}</span></div>`).join('');
  suggest.querySelectorAll('[data-sel]').forEach(el=> el.addEventListener('click',()=>{ 
    q.value = el.getAttribute('data-sel'); 
    STATE.q = q.value; 
    render(); 
    suggest.style.display='none'; 
  }));
}

function renderCart(){
  if(!STATE.cart.length){ 
    bag.innerHTML = '<div class="hint">Your bag is empty. Add items to proceed.</div>'; 
    sub.textContent=gst.textContent=tot.textContent=inr(0); 
    cartCount.textContent='0'; 
    return; 
  }
  bag.innerHTML = STATE.cart.map(ci=>{
    const p = PRODUCTS.find(x=>x.id===ci.id);
    if(!p) return '';
    return `<div class="row">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
        <div>
          <div style="font-weight:700">${p.name}</div>
          <div class="hint">${p.brand} • ${p.category}</div>
          <div style="margin-top:6px">${inr(p.price)}</div>
        </div>
        <button class="btn" data-remove="${p.id}">✖</button>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;align-items:center">
        <div class="qty">
          <button class="btn" data-dec="${p.id}">−</button>
          <span style="min-width:24px;text-align:center">${ci.qty}</span>
          <button class="btn" data-inc="${p.id}">+</button>
        </div>
        <div>${inr(p.price*ci.qty)}</div>
      </div>
    </div>`;
  }).join('');

  bag.querySelectorAll('[data-inc]').forEach(b=> b.addEventListener('click',()=> changeQty(b.getAttribute('data-inc'), +1)));
  bag.querySelectorAll('[data-dec]').forEach(b=> b.addEventListener('click',()=> changeQty(b.getAttribute('data-dec'), -1)));
  bag.querySelectorAll('[data-remove]').forEach(b=> b.addEventListener('click',()=> removeFromCart(b.getAttribute('data-remove'))));

  const subtotal = STATE.cart.reduce((s,ci)=>{ const p = PRODUCTS.find(x=>x.id===ci.id); return s + (p?p.price*ci.qty:0); },0);
  const tax = subtotal*0.18; const total = subtotal + tax;
  sub.textContent = inr(subtotal); gst.textContent = inr(tax); tot.textContent = inr(total);
  cartCount.textContent = String(STATE.cart.reduce((s,c)=>s+c.qty,0));
}

// ---------- Boot ----------
function boot(){
  loadCart();
  render();
  renderCart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
