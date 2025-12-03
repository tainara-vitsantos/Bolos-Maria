// ---------- Dados e estado do carrinho ----------
const cart = []; // {id,name,price,qty}
const cartCountEl = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalEl = document.getElementById('cartTotal');

function formatBRL(value){
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(value);
}

// ---------- Atualizar UI do carrinho ----------
function updateCartUI(){
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  cartCountEl.textContent = totalQty;

  cartItemsContainer.innerHTML = '';

  if(cart.length === 0){
    cartItemsContainer.innerHTML = '<p class="text-muted">Seu carrinho está vazio.</p>';
  } else {
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'd-flex justify-content-between align-items-center mb-2';
      row.innerHTML = `
        <div>
          <div class="fw-bold">${item.name}</div>
          <small class="text-muted">Unit: ${formatBRL(item.price)}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <input type="number" min="1" value="${item.qty}" class="form-control form-control-sm"
            style="width:70px" data-id="${item.id}">
          <div class="text-end">
            <div>${formatBRL(item.price * item.qty)}</div>
            <button class="btn btn-link btn-sm text-danger remove-item" data-id="${item.id}">
              Remover
            </button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(row);
    });
  }

  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  cartTotalEl.textContent = formatBRL(total);

  document
    .querySelectorAll('#cartItemsContainer input[type="number"]')
    .forEach(input => {
      input.addEventListener('change', (e)=>{
        const id = e.target.dataset.id;
        const newQty = Math.max(1, parseInt(e.target.value) || 1);
        const idx = cart.findIndex(x=>x.id==id);
        if(idx>=0){
          cart[idx].qty = newQty;
          updateCartUI();
        }
      });
    });

  document.querySelectorAll('.remove-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      const idx = cart.findIndex(x=>x.id==id);
      if(idx>=0){
        cart.splice(idx,1);
        updateCartUI();
      }
    });
  });
}

// ---------- ADICIONAR AO CARRINHO ----------
document.querySelectorAll('.add-to-cart').forEach(btn=>{
  btn.addEventListener('click', ()=>{

    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);

    const qtyInput = document.querySelector(`.qty-input[data-product-id="${id}"]`);
    const qty = Math.max(1, parseInt(qtyInput?.value || 1));

    const existing = cart.find(x=>x.id==id);

    if(existing){ 
      existing.qty += qty; 
    } else { 
      cart.push({ id, name, price, qty }); 
    }

    updateCartUI();

    const modalAdicionado = new bootstrap.Modal(document.getElementById("modalAdicionado"));
    document.getElementById("msgAdicionado").innerText =
      `${qty}x ${name} foi adicionado ao carrinho!`;
    modalAdicionado.show();

    btn.classList.add('disabled');
    setTimeout(()=> btn.classList.remove('disabled'), 400);
  });
});

// ---------- MODAIS (AGORA SOMENTE UMA VEZ) ----------
const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
const clearCartModal = new bootstrap.Modal(document.getElementById('clearCartModal'));
const encomendaModal = new bootstrap.Modal(document.getElementById('encomendaModal'));

document.getElementById('openCartBtn').addEventListener('click', ()=> cartModal.show());

// ---------- LIMPAR CARRINHO ----------
document.getElementById('clearCartBtn').addEventListener('click', ()=>{
  if(cart.length === 0) return;

  cart.splice(0, cart.length);
  updateCartUI();
  clearCartModal.show();
});

// ---------- FINALIZAR PEDIDO -> ABRIR MODAL DE ENCOMENDA ----------
document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  if(cart.length === 0) return;

  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  const qtdTotal = cart.reduce((s,i)=>s + i.qty, 0);

  document.getElementById("encomendaResumo").innerHTML =
    `Quantidade total: <strong>${qtdTotal}</strong><br>
     Total: <strong>${formatBRL(total)}</strong>`;

  cartModal.hide();
  encomendaModal.show();
});

// ---------- SCROLL REVEAL ----------
const faders = document.querySelectorAll('.fade-up');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.15 });

['#cardapio', '#sobre', '#depoimentos', '#contato'].forEach(sel=>{
  const el = document.querySelector(sel);
  if(el){
    el.classList.add('fade-up');
    io.observe(el);
  }
});

updateCartUI();

document.getElementById('sendWhatsAppBtn').addEventListener('click', () => {
  if (cart.length === 0) return;

  // Número da Maria (somente números)
  const phone = "5514988055751"; // Ex: 55 + DDD + número → 5514988055751

  let msg = "*NOVO PEDIDO — Enviado pelo site*%0A%0A";

  msg += "*Itens:*%0A";
  cart.forEach(item => {
    msg += `• ${item.qty}x ${item.name} — ${formatBRL(item.price)}%0A`;
  });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const qtdTotal = cart.reduce((s, i) => s + i.qty, 0);

  msg += `%0A*Quantidade total:* ${qtdTotal}%0A`;
  msg += `*Total:* ${formatBRL(total)}%0A%0A`;

  msg += "Por favor, confirme meu pedido 😊";

  // Monta o link
  const url = `https://wa.me/${phone}?text=${msg}`;

  // Abre o WhatsApp
  window.open(url, "_blank");
});
