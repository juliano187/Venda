let dados = null;
let filtro = 'todos';
const escolhas = {}; // id do produto -> índice do plano

const $ = s => document.querySelector(s);
const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function linkWhats(produto, plano) {
  const msg = `Olá! Quero comprar o giftcard *${produto.nome}* – plano *${plano.label}* (${brl(plano.preco)}). Como faço o pagamento?`;
  return `https://wa.me/${dados.whatsapp}?text=${encodeURIComponent(msg)}`;
}

function renderFiltros() {
  const nomes = [{ id: 'todos', nome: 'Todos' }, ...dados.produtos];
  $('#filtros').innerHTML = nomes.map(p =>
    `<button class="chip" role="tab" data-id="${p.id}" aria-selected="${p.id === filtro}">${p.nome}</button>`).join('');
}

function renderCards() {
  const lista = dados.produtos.filter(p => filtro === 'todos' || p.id === filtro);
  $('#grade').innerHTML = lista.map(p => {
    const i = escolhas[p.id] ?? 0;
    return `<article class="card" style="--cor:${p.cor}">
      <h3>${p.nome}</h3>
      <p>${p.desc}</p>
      <div class="planos">
        ${p.planos.map((pl, n) => `<button class="plano" data-prod="${p.id}" data-n="${n}" aria-pressed="${n === i}">
          <span>${pl.label}</span><b>${brl(pl.preco)}</b></button>`).join('')}
      </div>
      <a class="btn-comprar" target="_blank" rel="noopener" href="${linkWhats(p, p.planos[i])}">Comprar pelo WhatsApp</a>
    </article>`;
  }).join('');
}

document.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (chip) { filtro = chip.dataset.id; renderFiltros(); renderCards(); return; }
  const pl = e.target.closest('.plano');
  if (pl) { escolhas[pl.dataset.prod] = +pl.dataset.n; renderCards(); }
});

async function iniciar() {
  try {
    dados = await (await fetch('products.json')).json();
  } catch {
    $('#grade').innerHTML = '<p>Não foi possível carregar os produtos. Abra o site por um servidor (http/https).</p>';
    return;
  }
  $('#loja').textContent = $('#loja2').textContent = dados.loja;
  $('#zapRodape').href = `https://wa.me/${dados.whatsapp}?text=${encodeURIComponent('Olá! Quero saber mais sobre os giftcards.')}`;
  renderFiltros();
  renderCards();
}
$('#ano').textContent = new Date().getFullYear();
iniciar();

/* ===== PWA: instalar como aplicativo ===== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(console.error));
}

let promptInstalar = null;
const btn = $('#btnInstalar');
const jaInstalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const ehIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  promptInstalar = e;
  btn.hidden = false;
});

if (ehIos && !jaInstalado) btn.hidden = false; // iOS não tem prompt automático

btn.addEventListener('click', async () => {
  if (promptInstalar) {
    promptInstalar.prompt();
    await promptInstalar.userChoice;
    promptInstalar = null;
    btn.hidden = true;
  } else if (ehIos) {
    $('#modalIos').hidden = false;
  }
});
$('#fecharIos').addEventListener('click', () => $('#modalIos').hidden = true);
window.addEventListener('appinstalled', () => btn.hidden = true);
