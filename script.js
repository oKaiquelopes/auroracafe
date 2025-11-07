// ===== Produtos (personalize) =====
const PRODUCTS = [
  {id:1,title:'Cappuccino Especial',desc:'Leite vaporizado, café expresso e espuma cremosa',price:8.5,prodMedia:'img/produtos/capucchino.png'},
  {id:2,title:'Latte',desc:'Leite com café suave',price:7.5,prodMedia:'img/produtos/latte.png'},
  {id:3,title:'Espresso Duplo',desc:'Dose dupla de café concentrado',price:6.0,prodMedia:'img/produtos/expresso_duplo.png'},
  {id:4,title:'Pão de Queijo',desc:'Quentinho e macio (unidade)',price:4.5,prodMedia:'img/produtos/paoqueijo.png'},
  {id:5,title:'Brownie',desc:'Brownie artesanal',price:6.0,prodMedia:'img/produtos/brownie.png'},
  {id:6,title:'Café Gelado',desc:'Frappé de café',price:9.0,prodMedia:'img/produtos/cafe_gelado.png'},
  {id:7,title:'Chocolate Gelado',desc:'Achocolatado Gelado Nestlé',price:12.0,prodMedia:'img/produtos/achocolatado.png'},
  {id:8,title:'Bolo de Chocolate',desc:'Generosa Fatia de Bolo',price:18.0,prodMedia:'img/produtos/bolo_chocolate.png'},
  {id:9,title:'Xícara de Chá',desc:'Chá quente',price:8.0,prodMedia:'img/produtos/cha.png'},
  {id:10,title:'Misto Quente',desc:'Muuuito queijo',price:12.0,prodMedia:'img/produtos/misto_quente.png'}
];

// ===== Estado do carrinho =====
const cart = {};
const WA_NUMBER = '5515996916423';

// helpers
const q = sel => document.querySelector(sel);
const qAll = sel => document.querySelectorAll(sel);

function formatBRL(v){ return 'R$ '+v.toFixed(2).replace('.',','); }

// Render catalog
const catalogEl = q('#catalog');
function renderCatalog(){
  catalogEl.innerHTML = '';
  PRODUCTS.forEach(p => {
    const el = document.createElement('article');
    el.className = 'product fade-up';
    el.innerHTML = `
      <div class="prod-media"><img style="height:150px" src="${p.prodMedia}" alt=""></div>
      <div>
        <div style="font-weight:700">${p.title}</div>
        <div class="small">${p.desc}</div>
      </div>
      <div class="prod-info">
        <div class="price">${formatBRL(p.price)}</div>
        <div>
          <button style="cursor:pointer;background-color:var(--accent);color:var(--bg);" class="ghost" onclick="addToCartById(${p.id})">Adicionar</button>
        </div>
      </div>
    `;
    catalogEl.appendChild(el);
  });
  requestAnimationFrame(()=>{document.querySelectorAll('.fade-up').forEach((el,i)=>setTimeout(()=>el.classList.add('show'),i*80))});
}

// Cart operations
function addToCartById(id){
  const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
  cart[id] = cart[id] || { ...p, qty:0 };
  cart[id].qty++;
  updateCartUI();
  flashCart();
  showToast(); // <- exibe feedback visual
}

function updateCartUI(){
  const cartItemsEl = q('#cartItems');
  cartItemsEl.innerHTML = '';
  const ids = Object.keys(cart);
  if(ids.length===0){ q('#cartEmpty').style.display='block'; } else { q('#cartEmpty').style.display='none'; }
  let total = 0, totalQty=0;
  ids.forEach(id=>{
    const it = cart[id];
    total += it.price*it.qty; totalQty += it.qty;
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:700">${it.title}</div>
        <div class="small">${formatBRL(it.price)} x ${it.qty} = ${formatBRL(it.price*it.qty)}</div>
      </div>
      <div class="qty">
        <button class="ghost" onclick="changeQty(${it.id}, -1)">-</button>
        <div class="small">${it.qty}</div>
        <button class="ghost" onclick="changeQty(${it.id}, 1)">+</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });
  q('#cartTotal').textContent = formatBRL(total);
  q('#cartCount').textContent = totalQty;
  q('#cartTotalItems').textContent = totalQty;
}

function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty<=0) delete cart[id];
  updateCartUI();
}

function clearCart(){
  for(const k in cart) delete cart[k];
  updateCartUI();
}

// Cart panel toggle
const cartPanel = q('#cartPanel');
function toggleCart(){ cartPanel.classList.toggle('open'); }
q('#openCartBtn').addEventListener('click', toggleCart);
q('#openCartBtnMobile').addEventListener('click', toggleCart);
q('#closeCart').addEventListener('click', toggleCart);
q('#clearCartBtn').addEventListener('click', ()=>{ clearCart(); });

// checkout -> prefill WhatsApp
function buildOrderText(name, phone){
  const lines = [];
  lines.push('Pedido pelo Site:');
  if(name) lines.push('Nome: '+name);
  if(phone) lines.push('Celular: '+phone);
  lines.push('---');
  let total = 0;
  for(const id of Object.keys(cart)){
    const it = cart[id];
    lines.push(`${it.qty}x ${it.title} - R$ ${it.price.toFixed(2).replace('.',',')}`);
    total += it.price*it.qty;
  }
  lines.push('---');
  lines.push('Total: R$ '+total.toFixed(2).replace('.',','));
  return lines.join('\n');
}

q('#checkoutBtn').addEventListener('click', ()=>{
  const name = q('#custName').value.trim();
  const phone = q('#custPhone').value.trim();
  if(Object.keys(cart).length===0){ alert('Seu carrinho está vazio.'); return; }
  if(!phone){ alert('Digite seu celular para que possamos confirmar o pedido.'); return; }
  const text = buildOrderText(name, phone);
  const url = `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent(text);
  window.open(url, '_blank');
});

q('#copyOrder').addEventListener('click', ()=>{
  if(Object.keys(cart).length===0){ alert('Carrinho vazio.'); return; }
  const text = buildOrderText(q('#custName').value.trim(), q('#custPhone').value.trim());
  navigator.clipboard.writeText(text).then(()=>alert('Pedido copiado!'));
});

function flashCart(){
  const el = q('#openCartBtn');
  el.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:350});
}

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('viewMenu').addEventListener('click', ()=>document.getElementById('menu').scrollIntoView({behavior:'smooth'}));

// init
renderCatalog(); updateCartUI();

// ===== TOAST =====
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}
