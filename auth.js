// Script compartilhado de autenticação.
// Inclua este arquivo (depois do supabaseClient.js) em toda página que
// tenha a área de navegação com id="navAuthArea".

async function atualizarNavegacaoAuth() {
  const area = document.getElementById('navAuthArea');
  if (!area) return;

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    const nome = session.user.user_metadata?.nome || session.user.email;
    area.innerHTML = `
      <a href="minha-conta.html" class="nav-link">${nome}</a>
      <button id="btnLogout" class="nav-link nav-link--ghost" type="button">Sair</button>
    `;
    document.getElementById('btnLogout').addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.location.href = 'index.html';
    });
  } else {
    area.innerHTML = `
      <a href="login.html" class="nav-link">Entrar</a>
      <a href="cadastro.html" class="nav-link nav-link--cta">Criar conta</a>
    `;
  }
}

// Usado em páginas que exigem login (ex: minha-conta.html).
// Redireciona para o login se não houver sessão ativa.
async function exigirLogin() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

document.addEventListener('DOMContentLoaded', atualizarNavegacaoAuth);
