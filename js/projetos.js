/* =========================================================
   ÁGUIAS DE CONCÓRDIA
   PROJETOS — DADOS E RENDERIZAÇÃO
========================================================= */

/* =========================================================
   DADOS DOS PROJETOS
   -----------------------------------------
   Dados provisórios para teste.
   
   Os documentos NÃO ficam mais aqui.
   Eles serão consultados no Portal da Transparência.
========================================================= */

const projetos = [
  {
    titulo: "Projeto de Basquetebol em Cadeira de Rodas",

    categoria: "Paradesporto",

    situacao: "Em execução",

    descricao:
      "Projeto voltado ao desenvolvimento do basquetebol em cadeira de rodas, promovendo esporte, inclusão, participação e desenvolvimento dos atletas.",

    informacoes: {
      proponente: "Águias de Concórdia",
      modalidade: "Basquetebol em cadeira de rodas",
      periodo: "2026",
      publico: "Pessoas com deficiência",
      local: "Concórdia - SC",
    },
  },

  {
    titulo: "Projeto de Desenvolvimento Esportivo",

    categoria: "Desenvolvimento esportivo",

    situacao: "Em execução",

    descricao:
      "Projeto destinado ao desenvolvimento esportivo dos atletas, fortalecendo treinamentos, competições e atividades relacionadas ao paradesporto.",

    informacoes: {
      proponente: "Águias de Concórdia",
      modalidade: "Paradesporto",
      periodo: "2026",
      publico: "Atletas da entidade",
      local: "Concórdia - SC",
    },
  },

  {
    titulo: "Projeto de Inclusão pelo Esporte",

    categoria: "Inclusão",

    situacao: "Em captação",

    descricao:
      "Projeto que busca ampliar as oportunidades de participação esportiva e promover inclusão por meio do esporte e do paradesporto.",

    informacoes: {
      proponente: "Águias de Concórdia",
      modalidade: "Paradesporto",
      periodo: "2026",
      publico: "Pessoas com deficiência",
      local: "Concórdia - SC",
    },
  },
];

/* =========================================================
   CONTAINER
========================================================= */

const listaProjetos = document.getElementById("lista-projetos");

/* =========================================================
   NOMES DAS INFORMAÇÕES
========================================================= */

const nomesInformacoes = {
  proponente: "Proponente",
  modalidade: "Modalidade",
  periodo: "Período",
  publico: "Público",
  local: "Local",
};

/* =========================================================
   RENDERIZAR PROJETOS
========================================================= */

function renderizarProjetos() {
  if (!listaProjetos) {
    return;
  }

  listaProjetos.innerHTML = "";

  projetos.forEach((projeto) => {
    const artigo = document.createElement("article");

    artigo.className = "projeto-detalhe";

    /* =====================================================
       INFORMAÇÕES DO PROJETO
    ===================================================== */

    const informacoesHTML = Object.entries(projeto.informacoes)
      .map(([chave, valor]) => {
        return `
          <div>
            <strong>
              ${nomesInformacoes[chave] || chave}
            </strong>

            <span>
              ${valor}
            </span>
          </div>
        `;
      })
      .join("");

    /* =====================================================
       PROJETO
    ===================================================== */

    artigo.innerHTML = `

      <div class="projeto-detalhe__imagem">

        <img
          src="assets/atletas.jpg"
          alt="${projeto.titulo}"
        >

      </div>


      <div class="projeto-detalhe__conteudo">

        <span class="projeto-detalhe__categoria">
          ${projeto.categoria}
        </span>


        <h3>
          ${projeto.titulo}
        </h3>


        <p>
          ${projeto.descricao}
        </p>


        <div class="projeto-status">

          <strong>
            Situação
          </strong>

          <span class="projeto-status__valor">
            ${projeto.situacao}
          </span>

        </div>


        <div class="projeto-detalhe__informacoes">

          ${informacoesHTML}

        </div>


        <!-- DOCUMENTOS NA TRANSPARÊNCIA -->

        <div class="projeto-detalhe__acao">

          <a
            href="transparencia.html#projetos"
            class="botao"
            aria-label="Ver documentos e prestação de contas de ${projeto.titulo}"
          >

            <i
              class="fa-solid fa-file-lines"
              aria-hidden="true"
            ></i>

            Ver documentos e prestação de contas

          </a>

        </div>

      </div>

    `;

    listaProjetos.appendChild(artigo);
  });
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  renderizarProjetos();
});
