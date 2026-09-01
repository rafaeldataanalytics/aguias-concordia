/* =========================================================
   ÁGUIAS DE CONCÓRDIA
   NOTÍCIAS — DADOS + DESTAQUE + FILTROS + PAGINAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     DADOS DAS NOTÍCIAS
     ---------------------------------------------------------
     Dados provisórios para teste.

     FUTURAMENTE:
     Google Sheets → JavaScript
  ========================================================= */

  const noticias = [
    {
      categoria: "Competição",
      data: "2026-01-10",
      titulo: "Águias de Concórdia participam de competição",
      resumo:
        "Confira a participação da equipe em mais uma competição de paradesporto.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Conquistas",
      data: "2026-01-15",
      titulo: "Águias conquistam destaque nas competições",
      resumo:
        "Veja os resultados e conquistas da equipe ao longo da temporada.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Paradesporto",
      data: "2026-01-20",
      titulo: "Esporte, inclusão e transformação",
      resumo:
        "Conheça as atividades e ações desenvolvidas pelos Águias de Concórdia.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Institucional",
      data: "2026-01-25",
      titulo: "Novidades dos Águias de Concórdia",
      resumo: "Confira as novidades e informações institucionais da entidade.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Competição",
      data: "2026-02-05",
      titulo: "Preparação para novos desafios",
      resumo: "A equipe se prepara para novos desafios e competições.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Paradesporto",
      data: "2026-02-12",
      titulo: "Atividades e ações da entidade",
      resumo: "Confira as atividades realizadas pelos Águias de Concórdia.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Competição",
      data: "2026-02-20",
      titulo: "Águias iniciam nova etapa de competições",
      resumo:
        "A equipe inicia uma nova etapa de preparação e participação esportiva.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Conquistas",
      data: "2026-03-01",
      titulo: "Equipe comemora novos resultados",
      resumo: "Confira os resultados alcançados pelos atletas dos Águias.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Paradesporto",
      data: "2026-03-10",
      titulo: "Paradesporto ganha novas oportunidades",
      resumo: "Novas ações fortalecem a participação esportiva.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Institucional",
      data: "2026-03-18",
      titulo: "Águias apresentam novidades",
      resumo: "Confira as novidades e projetos da entidade.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Competição",
      data: "2026-04-02",
      titulo: "Nova competição no calendário",
      resumo: "Veja os próximos desafios da equipe.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },

    {
      categoria: "Conquistas",
      data: "2026-04-15",
      titulo: "Mais uma conquista dos Águias",
      resumo: "Confira mais um resultado importante da equipe.",
      imagem: "assets/atletas.jpg",
      curtidas: 0,
      visualizacoes: 0,
    },
  ];

  /* =========================================================
     ELEMENTOS DA PÁGINA
  ========================================================= */

  const listaNoticias = document.getElementById("lista-noticias");

  const filtros = document.querySelectorAll(".filtro");

  const paginas = document.querySelectorAll(".paginacao__pagina");

  const botaoAnterior = document.querySelector(
    ".paginacao__botao[aria-label='Página anterior']",
  );

  const botaoProxima = document.querySelector(
    ".paginacao__botao[aria-label='Próxima página']",
  );

  /* =========================================================
     VERIFICAÇÃO
  ========================================================= */

  if (!listaNoticias) {
    return;
  }

  /* =========================================================
     CONFIGURAÇÃO
  ========================================================= */

  const noticiasPorPagina = 6;

  let paginaAtual = 1;

  let categoriaAtual = "todas";

  /* =========================================================
     ORDENAR NOTÍCIAS
     ---------------------------------------------------------
     Mais recentes primeiro.
  ========================================================= */

  const noticiasOrdenadas = [...noticias].sort((a, b) => {
    return new Date(b.data) - new Date(a.data);
  });

  /* =========================================================
     FORMATA DATA
  ========================================================= */

  function formatarData(data) {
    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  /* =========================================================
     FILTRAR NOTÍCIAS
  ========================================================= */

  function obterNoticiasFiltradas() {
    if (categoriaAtual === "todas") {
      return noticiasOrdenadas;
    }

    return noticiasOrdenadas.filter((noticia) => {
      const categoria = noticia.categoria.toLowerCase().trim();

      if (categoriaAtual === "competições" && categoria === "competição") {
        return true;
      }

      return categoria === categoriaAtual;
    });
  }

  /* =========================================================
     CRIAR CARD
  ========================================================= */

  function criarCard(noticia) {
    const artigo = document.createElement("article");

    artigo.className = "noticia-card";

    artigo.innerHTML = `

      <div class="noticia-card__imagem">

        <img
          src="${noticia.imagem}"
          alt="${noticia.titulo}"
          loading="lazy"
        >

      </div>


      <div class="noticia-card__conteudo">

        <span class="noticia-card__categoria">
          ${noticia.categoria}
        </span>


        <time
          class="noticia-data"
          datetime="${noticia.data}"
        >
          ${formatarData(noticia.data)}
        </time>


        <h3>
          ${noticia.titulo}
        </h3>


        <p>
          ${noticia.resumo}
        </p>


        <div
          class="conteudo-metricas"
          aria-label="Interações da notícia"
        >

          <button
            type="button"
            class="metrica metrica--curtida"
            aria-label="Curtir esta notícia"
          >

            <span aria-hidden="true">
              ♥
            </span>

            <span class="metrica__valor">
              ${noticia.curtidas}
            </span>

          </button>


          <span
            class="metrica"
            aria-label="${noticia.visualizacoes} visualizações"
          >

            <span aria-hidden="true">
              👁
            </span>

            <span class="metrica__valor">
              ${noticia.visualizacoes}
            </span>

          </span>

        </div>


        <a
          href="#"
          class="noticia-card__link"
        >
          Ler notícia →
        </a>

      </div>

    `;

    return artigo;
  }

  /* =========================================================
     RENDERIZAR DESTAQUE
     ---------------------------------------------------------
     A notícia mais recente será o destaque.
  ========================================================= */

  function renderizarDestaque() {
    const destaque = noticiasOrdenadas[0];

    if (!destaque) {
      return;
    }

    const imagem = document.querySelector(".destaque-card__imagem img");

    const categoria = document.querySelector(
      ".destaque-card__conteudo .noticia-card__categoria",
    );

    const data = document.querySelector(
      ".destaque-card__conteudo .noticia-data",
    );

    const titulo = document.querySelector(".destaque-card__conteudo h3");

    const resumo = document.querySelector(".destaque-card__conteudo > p");

    const curtidas = document.querySelector(
      ".destaque-card .metrica--curtida .metrica__valor",
    );

    const visualizacoes = document.querySelector(
      ".destaque-card .metrica:not(.metrica--curtida) .metrica__valor",
    );

    if (imagem) {
      imagem.src = destaque.imagem;

      imagem.alt = destaque.titulo;
    }

    if (categoria) {
      categoria.textContent = destaque.categoria;
    }

    if (data) {
      data.textContent = formatarData(destaque.data);

      data.setAttribute("datetime", destaque.data);
    }

    if (titulo) {
      titulo.textContent = destaque.titulo;
    }

    if (resumo) {
      resumo.textContent = destaque.resumo;
    }

    if (curtidas) {
      curtidas.textContent = destaque.curtidas;
    }

    if (visualizacoes) {
      visualizacoes.textContent = destaque.visualizacoes;
    }
  }

  /* =========================================================
     MOSTRAR NOTÍCIAS
  ========================================================= */

  function mostrarNoticias() {
    const filtradas = obterNoticiasFiltradas();

    const inicio = (paginaAtual - 1) * noticiasPorPagina;

    const fim = inicio + noticiasPorPagina;

    const noticiasPagina = filtradas.slice(inicio, fim);

    listaNoticias.innerHTML = "";

    noticiasPagina.forEach((noticia) => {
      listaNoticias.appendChild(criarCard(noticia));
    });

    atualizarPaginacao(filtradas.length);
  }

  /* =========================================================
     PAGINAÇÃO
  ========================================================= */

  function atualizarPaginacao(totalNoticias) {
    const totalPaginas = Math.max(
      1,
      Math.ceil(totalNoticias / noticiasPorPagina),
    );

    paginas.forEach((pagina) => {
      const numero = Number(pagina.textContent.trim());

      pagina.style.display = numero <= totalPaginas ? "" : "none";

      pagina.classList.toggle("ativa", numero === paginaAtual);

      if (numero === paginaAtual) {
        pagina.setAttribute("aria-current", "page");
      } else {
        pagina.removeAttribute("aria-current");
      }
    });

    if (botaoAnterior) {
      botaoAnterior.disabled = paginaAtual === 1;
    }

    if (botaoProxima) {
      botaoProxima.disabled = paginaAtual >= totalPaginas;
    }
  }

  /* =========================================================
     FILTROS
  ========================================================= */

  filtros.forEach((filtro) => {
    filtro.addEventListener("click", () => {
      filtros.forEach((item) => {
        item.classList.remove("ativo");

        item.setAttribute("aria-pressed", "false");
      });

      filtro.classList.add("ativo");

      filtro.setAttribute("aria-pressed", "true");

      const texto = filtro.textContent.trim().toLowerCase();

      /* Todas */

      if (texto === "todas") {
        categoriaAtual = "todas";
      } else {
        categoriaAtual = texto;
      }

      paginaAtual = 1;

      mostrarNoticias();
    });
  });

  /* =========================================================
     NÚMEROS DAS PÁGINAS
  ========================================================= */

  paginas.forEach((pagina) => {
    pagina.addEventListener("click", (evento) => {
      evento.preventDefault();

      const numero = Number(pagina.textContent.trim());

      if (!Number.isNaN(numero)) {
        paginaAtual = numero;

        mostrarNoticias();
      }
    });
  });

  /* =========================================================
     BOTÃO ANTERIOR
  ========================================================= */

  if (botaoAnterior) {
    botaoAnterior.addEventListener("click", () => {
      if (paginaAtual > 1) {
        paginaAtual--;

        mostrarNoticias();
      }
    });
  }

  /* =========================================================
     BOTÃO PRÓXIMA
  ========================================================= */

  if (botaoProxima) {
    botaoProxima.addEventListener("click", () => {
      const totalNoticias = obterNoticiasFiltradas().length;

      const totalPaginas = Math.ceil(totalNoticias / noticiasPorPagina);

      if (paginaAtual < totalPaginas) {
        paginaAtual++;

        mostrarNoticias();
      }
    });
  }

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  renderizarDestaque();

  mostrarNoticias();
});
