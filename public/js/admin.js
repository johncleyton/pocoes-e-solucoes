// ============================================
// ADMIN - Frontend JavaScript
// CRUD de poções via AJAX com autenticação
// ============================================

const API_URL = '/api/pocoes';

// ==================== AUTH ====================

function getToken() {
  return localStorage.getItem('admin_token');
}

function checkAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }

  // Verificar validade do token
  fetch('/api/admin/verify', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(res => {
    if (!res.ok) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_usuario');
      window.location.href = 'login.html';
    }
  })
  .catch(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_usuario');
    window.location.href = 'login.html';
  });

  return true;
}

function logout() {
  const token = getToken();
  if (token) {
    fetch('/api/admin/logout', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    }).catch(() => {});
  }
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_usuario');
  window.location.href = 'login.html';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken(),
  };
}

// ==================== ALERTS ====================

function showAlert(type, message) {
  const el = document.getElementById(`alert-${type}`);
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'none';
  }, 4000);
}

// ==================== LOAD TABLE ====================

async function loadPotions() {
  const tbody = document.getElementById('potions-table-body');

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao buscar poções');
    const pocoes = await response.json();

    if (pocoes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">Nenhuma poção cadastrada.</td></tr>`;
      return;
    }

    tbody.innerHTML = pocoes.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.imagem ? `<img src="${p.imagem}" alt="${p.nome}" onerror="this.style.display='none'">` : '—'}</td>
        <td>${p.nome}</td>
        <td>${p.descricao.length > 60 ? p.descricao.substring(0, 60) + '...' : p.descricao}</td>
        <td>${p.preco} moedas</td>
        <td><button class="btn-delete" onclick="deletePotion(${p.id})">Remover</button></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--accent);">Erro ao carregar. Verifique o servidor.</td></tr>`;
  }
}

// ==================== CREATE ====================

async function createPotion(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const imagem = document.getElementById('imagem').value.trim();
  const preco = parseFloat(document.getElementById('preco').value);

  if (!nome || !descricao || isNaN(preco) || preco <= 0) {
    showAlert('error', 'Preencha todos os campos obrigatórios corretamente.');
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nome, descricao, imagem: imagem || null, preco }),
    });

    if (response.status === 401) {
      showAlert('error', 'Sessão expirada. Redirecionando para login...');
      setTimeout(() => logout(), 2000);
      return;
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao cadastrar');
    }

    showAlert('success', `Poção "${nome}" cadastrada com sucesso!`);
    document.getElementById('potion-form').reset();
    await loadPotions();
  } catch (err) {
    showAlert('error', err.message);
  }
}

// ==================== DELETE ====================

async function deletePotion(id) {
  if (!confirm('Tem certeza que deseja remover esta poção?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (response.status === 401) {
      showAlert('error', 'Sessão expirada. Redirecionando para login...');
      setTimeout(() => logout(), 2000);
      return;
    }

    if (!response.ok) throw new Error('Erro ao remover');

    showAlert('success', 'Poção removida com sucesso!');
    await loadPotions();
  } catch (err) {
    showAlert('error', err.message);
  }
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticação
  if (!checkAuth()) return;

  // Mostrar nome do admin
  const usuario = localStorage.getItem('admin_usuario');
  const userEl = document.getElementById('admin-user');
  if (userEl && usuario) {
    userEl.textContent = `Admin: ${usuario}`;
  }

  // Configurar logout
  document.getElementById('btn-logout').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // Carregar poções e configurar form
  loadPotions();
  document.getElementById('potion-form').addEventListener('submit', createPotion);
});
