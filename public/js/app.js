// ============================================
// LOJA - Frontend JavaScript
// Carrega poções via AJAX e renderiza os cards
// ============================================

const API_URL = '/api/pocoes';

// Placeholder image for potions without image
const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect fill="#16213e" width="200" height="200"/>
    <text x="100" y="90" text-anchor="middle" fill="#d4a853" font-size="16">Sem imagem</text>
    <text x="100" y="120" text-anchor="middle" fill="#787878" font-size="12">disponivel</text>
  </svg>
`);

/**
 * Busca todas as poções da API
 */
async function fetchPocoes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao buscar poções');
    return await response.json();
  } catch (err) {
    console.error('Erro:', err);
    return null;
  }
}

/**
 * Cria o HTML de um card de produto
 */
function createProductCard(pocao) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <img 
      src="${pocao.imagem || PLACEHOLDER_IMG}" 
      alt="${pocao.nome}" 
      class="product-image"
      onerror="this.src='${PLACEHOLDER_IMG}'"
    >
    <div class="product-info">
      <h3 class="product-name">${pocao.nome}</h3>
      <p class="product-desc">${pocao.descricao}</p>
      <div class="product-footer">
        <span class="product-price">
          ${pocao.preco} <span class="coin">moedas</span>
        </span>
        <button class="btn-buy" onclick="alert('Pocao adicionada ao caldeirao!')">Comprar</button>
      </div>
    </div>
  `;
  return card;
}

/**
 * Renderiza a lista de poções na página
 */
async function renderProducts() {
  const container = document.getElementById('products-container');
  const pocoes = await fetchPocoes();

  if (!pocoes) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">X</div>
        <p>Erro ao carregar as poções. Verifique se o servidor está rodando.</p>
      </div>
    `;
    return;
  }

  if (pocoes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">--</div>
        <p>Nenhuma poção disponível no momento.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  pocoes.forEach(pocao => {
    container.appendChild(createProductCard(pocao));
  });
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', renderProducts);
