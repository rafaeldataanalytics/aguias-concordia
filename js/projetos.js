/* =========================================================
   ÁGUIAS DE CONCÓRDIA
   PROJETOS — DADOS E RENDERIZAÇÃO
========================================================= */

/* =========================================================
   DADOS DOS PROJETOS
   -----------------------------------------
   Dados provisórios para teste.
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

    documentos: [
      {
        nome: "Projeto completo",
        link: "#",
      },
      {
        nome: "Plano de trabalho",
        link: "#",
      },
      {
        nome: "Termo de fomento",
        link: "#",
      },
      {
        nome: "Relatórios",
        link: "#",
      },
      {
        nome: "Prestação de contas",
        link: "#",
      },
    ],
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

    documentos: [
      {
        nome: "Projeto completo",
        link: "#",
      },
      {
        nome: "Plano de trabalho",
        link: "#",
      },
      {
        nome: "Relatórios",
        link: "#",
      },
      {
        nome: "Prestação de contas",
        link: "#",
      },
    ],
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

    documentos: [
      {
        nome: "Projeto",
        link: "#",
      },
      {
        nome: "Plano de trabalho",
        link: "#",
      },
      {
        nome: "Documentos",
        link: "#",
      },
    ],
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
       INFORMAÇÕES
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
       DOCUMENTOS
    ===================================================== */

    const documentosHTML = projeto.documentos
      .map((documento) => {
        return `
          <li>
            <a
              href="${documento.link}"
              target="_blank"
              rel="noopener noreferrer"
            >

              <i
                class="fa-regular fa-file-lines"
                aria-hidden="true"
              ></i>

              <span>
                ${documento.nome}
              </span>

              <span aria-hidden="true">
                →
              </span>

            </a>
          </li>
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


        <div class="projeto-documentos">

          <h4>
            Documentos do projeto
          </h4>

          <ul>
            ${documentosHTML}
          </ul>

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
