// ---------- Troca de abas (dossiês) ----------
const tabs = document.querySelectorAll('.tab[data-tab]');
const dossiers = document.querySelectorAll('.dossier[data-topic]');

function showTopic(topic) {
  dossiers.forEach(d => d.classList.toggle('is-visible', d.dataset.topic === topic));
  tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === topic));
  const target = document.getElementById(topic);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.disabled) return;
    showTopic(tab.dataset.tab);
  });
});

// Chips de atalho na seção de herói funcionam como as abas
document.querySelectorAll('.chip[data-tab]').forEach(chip => {
  chip.addEventListener('click', () => showTopic(chip.dataset.tab));
});

// ---------- Busca do topo: leva para a aba certa ----------
const topicSearch = document.getElementById('topicSearch');
topicSearch.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = document.getElementById('q').value.toLowerCase();

  if (value.includes('cnh') || value.includes('habilita') || value.includes('carteira')) {
    showTopic('cnh');
  } else if (value.includes('passaporte')) {
    showTopic('passaporte');
  } else {
    showTopic('cnh'); // padrão enquanto só há dois temas
  }
});

// ---------- Assistente baseado em regras (sem custo de API) ----------
// Cada entrada tem palavras-chave e uma resposta pronta.
// Para adicionar novos temas, basta acrescentar objetos nesta lista.
const RESPOSTAS = [
  // Saudações e conversa básica
  {
    palavras: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite'],
    resposta: 'Oi! Pode perguntar sobre CNH ou passaporte — prazo, custo, documentos, o que for.'
  },
  {
    palavras: ['obrigad', 'valeu', 'vlw'],
    resposta: 'Por nada! Se aparecer outra dúvida, é só perguntar.'
  },
  {
    palavras: ['quem é você', 'quem e voce', 'o que você faz', 'o que voce faz'],
    resposta: 'Sou um assistente simples deste site: respondo dúvidas comuns sobre CNH e passaporte com base em informações públicas.'
  },

  // CNH
  {
    palavras: ['tempo', 'demora', 'prazo cnh', 'quanto tempo cnh', 'quanto tempo demora a cnh'],
    resposta: 'A CNH definitiva costuma sair em até 30 dias após a aprovação no exame de direção, mas o processo completo (exames + aulas) pode levar de 1 a 3 meses, dependendo da agenda da autoescola.'
  },
  {
    palavras: ['custo cnh', 'valor cnh', 'preço cnh', 'preco cnh', 'quanto custa a cnh', 'quanto custa cnh'],
    resposta: 'O valor varia por estado e inclui taxas do Detran, exames médicos e aulas na autoescola. Consulte o valor atualizado direto no site do Detran do seu estado.'
  },
  {
    palavras: ['renovar cnh', 'renovação cnh', 'renovacao cnh', 'cnh vencida', 'cnh venceu'],
    resposta: 'Para renovar, o processo é bem mais rápido que a primeira habilitação: geralmente só exame médico (e psicotécnico, dependendo da idade e categoria) e o pagamento da taxa — sem provas nem aulas.'
  },
  {
    palavras: ['reprovar', 'reprovei', 'reprovado', 'não passei', 'nao passei'],
    resposta: 'Se reprovar na teórica ou na prática, você pode refazer o exame depois de um prazo mínimo definido pelo Detran (costuma ser em torno de 15 dias), geralmente com uma taxa extra.'
  },
  {
    palavras: ['categoria a', 'categoria b', 'moto ou carro', 'carro ou moto'],
    resposta: 'A categoria A é para motos, a B para carros. Dá pra fazer as duas juntas (processo chamado de habilitação simultânea) ou uma de cada vez — isso muda o valor total.'
  },
  {
    palavras: ['online cnh', 'cnh pela internet', 'cnh digital'],
    resposta: 'Parte do processo (inscrição, agendamento e pagamento das taxas) é on-line pelo site do Detran, mas exames médicos, provas e aulas práticas são presenciais.'
  },

  // Passaporte
  {
    palavras: ['passaporte demora', 'prazo passaporte', 'quanto tempo passaporte', 'quanto tempo demora o passaporte'],
    resposta: 'Depois do atendimento na Polícia Federal, o passaporte costuma ficar pronto entre 10 e 15 dias úteis.'
  },
  {
    palavras: ['custo passaporte', 'valor passaporte', 'preço passaporte', 'preco passaporte', 'quanto custa o passaporte', 'quanto custa passaporte'],
    resposta: 'O custo é o valor da GRU (Guia de Recolhimento da União), emitida no site da Polícia Federal. O valor é definido pelo governo e pode mudar — confira sempre na hora de emitir a guia.'
  },
  {
    palavras: ['validade passaporte', 'passaporte vence', 'quanto tempo vale o passaporte'],
    resposta: 'O passaporte brasileiro comum tem validade de 10 anos para maiores de 18 anos (prazos menores para crianças e adolescentes).'
  },
  {
    palavras: ['perdi o passaporte', 'passaporte perdido', 'roubaram meu passaporte'],
    resposta: 'Em caso de perda ou roubo, registre um Boletim de Ocorrência e faça um novo agendamento na Polícia Federal como se fosse uma nova via — o processo e os documentos são praticamente os mesmos.'
  },
  {
    palavras: ['agendar passaporte', 'marcar passaporte', 'onde agendar'],
    resposta: 'O agendamento é feito só pelo site oficial da Polícia Federal. Desconfie de qualquer site ou pessoa que cobre para "garantir" uma vaga.'
  },

  // Genéricas
  {
    palavras: ['documento', 'preciso levar', 'o que levar'],
    resposta: 'Cada tema tem sua lista de documentos na caixinha "Documentos necessários" ao lado dos passos. De modo geral: documento oficial com foto, CPF e comprovante de pagamento das taxas.'
  },
  {
    palavras: ['menor de idade', 'menor', 'criança passaporte', 'crianca passaporte'],
    resposta: 'Passaporte para menores de idade exige autorização dos responsáveis legais. As regras variam conforme a situação — verifique no site da Polícia Federal antes de agendar.'
  },
  {
    palavras: ['fazer online', 'tudo pela internet', 'sem sair de casa'],
    resposta: 'Uma parte do processo dá pra fazer on-line (cadastro, agendamento, pagamento de taxas), mas etapas como exames, provas e coleta de biometria costumam exigir presença física.'
  },
  {
    palavras: ['gratis', 'grátis', 'de graça', 'sem pagar'],
    resposta: 'CNH e passaporte têm taxas oficiais obrigatórias — não é possível emitir de graça. Desconfie de quem oferecer isso.'
  }
];

const RESPOSTA_PADRAO = 'Ainda não tenho uma resposta pronta para isso. Dá uma olhada nos passos e na lista de documentos do tema correspondente ali em cima, ou confira o site oficial do órgão responsável.';

function responder(pergunta) {
  const texto = pergunta.toLowerCase();
  const encontrada = RESPOSTAS.find(item =>
    item.palavras.some(palavra => texto.includes(palavra))
  );
  return encontrada ? encontrada.resposta : RESPOSTA_PADRAO;
}

const assistForm = document.getElementById('assistForm');
const assistInput = document.getElementById('assistInput');
const assistLog = document.getElementById('assistLog');

function addMessage(texto, tipo) {
  const div = document.createElement('div');
  div.className = `msg msg--${tipo}`;
  div.textContent = texto;
  assistLog.appendChild(div);
  assistLog.scrollTop = assistLog.scrollHeight;
}

assistForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const pergunta = assistInput.value.trim();
  if (!pergunta) return;

  addMessage(pergunta, 'user');
  assistInput.value = '';

  setTimeout(() => {
    addMessage(responder(pergunta), 'bot');
  }, 300);
});
