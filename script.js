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

// ---------- Adicionar ao carrinho (COM MODAL) ----------
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

    // ---- Modal de adicionado ao carrinho ----
    const modalAdicionado = new bootstrap.Modal(document.getElementById("modalAdicionado"));
    document.getElementById("msgAdicionado").innerText =
      `${qty}x ${name} foi adicionado ao carrinho!`;
    modalAdicionado.show();

    // Efeito no botão
    btn.classList.add('disabled');
    setTimeout(()=> btn.classList.remove('disabled'), 400);
  });
});

// ---------- Modais ----------
const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
const modalPedidoFinalizado = new bootstrap.Modal(document.getElementById("modalPedidoFinalizado"));
const modalCarrinhoLimpo = new bootstrap.Modal(document.getElementById("modalCarrinhoLimpo"));

document.getElementById('openCartBtn').addEventListener('click', ()=> cartModal.show());

// limpar carrinho — COM MODAL
document.getElementById('clearCartBtn').addEventListener('click', ()=>{
  cart.splice(0, cart.length);
  updateCartUI();
  modalCarrinhoLimpo.show();
});

// finalizar pedido — COM MODAL
document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  if(cart.length === 0){
    modalPedidoFinalizado.show();
    return;
  }

  const productSummary = cart.map(i => `${i.qty} x ${i.name}`).join(' — ');

  document.getElementById('orderProduct').value = 'Pedido: ' + productSummary;
  document.getElementById('orderPrice').value = formatBRL(
    cart.reduce((s,i)=>s + i.price * i.qty, 0)
  );
  document.getElementById('orderQty').value =
    cart.reduce((s,i)=>s + i.qty, 0);

  const encomendaModal = new bootstrap.Modal(document.getElementById('encomendaModal'));
  cartModal.hide();
  encomendaModal.show();
});

// ---------- "Fazer Pedido" direto do card ----------
document.querySelectorAll('.order-now').forEach(btn=>{
  btn.addEventListener('click', ()=>{

    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);

    document.getElementById('orderProduct').value = name;
    document.getElementById('orderPrice').value = formatBRL(price);

    const qtyInput = document.querySelector(`.qty-input[data-product-id="${id}"]`);
    document.getElementById('orderQty').value =
      qtyInput ? Math.max(1, parseInt(qtyInput.value || 1)) : 1;
  });
});

// ---------- Envio do formulário de encomenda ----------
document.getElementById('orderForm').addEventListener('submit', function(e){
  e.preventDefault();
  if(!this.checkValidity()){
    this.classList.add('was-validated');
    return;
  }

  modalPedidoFinalizado.show();

  const modalEl = document.getElementById('encomendaModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();

  this.reset();
  this.classList.remove('was-validated');
});

// ---------- Formulário de contato ----------
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  if(!this.checkValidity()){
    this.classList.add('was-validated');
    return;
  }

  modalPedidoFinalizado.show();
  this.reset();
  this.classList.remove('was-validated');
});

// ---------- Scroll reveal ----------
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

