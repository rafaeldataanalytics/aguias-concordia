/* =========================================================
   ÁGUIAS DE CONCÓRDIA
   NOTÍCIAS — GOOGLE SHEETS + DESTAQUE + FILTROS
   + PAGINAÇÃO + HOME + GOOGLE DRIVE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     GOOGLE SHEETS
  ========================================================= */

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/" +
    "2PACX-1vTmOu4NYHC7VKHJHCcnyoLmPywh4v2q31C6JP8KmV10yjL8ZLKBzmzck-DJNcUot5wzAAYKxoTsnP9C" +
    "/pub?gid=1804737077&single=true&output=csv";

  /* =========================================================
     ELEMENTOS — PÁGINA DE NOTÍCIAS
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
     ELEMENTOS — HOME
  ========================================================= */

  const listaNoticiasHome = document.getElementById("lista-noticias-home");

  /* =========================================================
     ELEMENTO — DESTAQUE
  ========================================================= */

  const destaqueCard = document.querySelector(".destaque-card");

  /* =========================================================
     CONFIGURAÇÃO
  ========================================================= */

  const noticiasPorPagina = 6;

  let noticias = [];

  let paginaAtual = 1;

  let categoriaAtual = "todas";

  /* =========================================================
     NORMALIZAR TEXTO
  ========================================================= */

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  /* =========================================================
     CONVERTER LINK DO GOOGLE DRIVE
  ========================================================= */

  function converterImagemDrive(url) {
    if (!url) {
      return "";
    }

    const match = url.match(/\/d\/([^/]+)/);

    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }

    return url;
  }

  /* =========================================================
     ESCAPAR HTML
  ========================================================= */

  function escaparHTML(texto) {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================================================
     LER CSV

     Suporta vírgulas dentro de textos entre aspas.
  ========================================================= */

  function lerCSV(texto) {
    const linhas = [];

    let linha = [];

    let valor = "";

    let dentroDeAspas = false;

    for (let i = 0; i < texto.length; i++) {
      const caractere = texto[i];

      const proximo = texto[i + 1];

      /* Aspas duplas dentro de campo */

      if (caractere === '"' && dentroDeAspas && proximo === '"') {
        valor += '"';

        i++;

        continue;
      }

      /* Abre ou fecha campo entre aspas */

      if (caractere === '"') {
        dentroDeAspas = !dentroDeAspas;

        continue;
      }

      /* Separador de coluna */

      if (caractere === "," && !dentroDeAspas) {
        linha.push(valor);

        valor = "";

        continue;
      }

      /* Quebra de linha */

      if ((caractere === "\n" || caractere === "\r") && !dentroDeAspas) {
        if (caractere === "\r" && proximo === "\n") {
          i++;
        }

        linha.push(valor);

        valor = "";

        if (linha.some((item) => item.trim() !== "")) {
          linhas.push(linha);
        }

        linha = [];

        continue;
      }

      valor += caractere;
    }

    /* Último registro */

    if (valor !== "" || linha.length > 0) {
      linha.push(valor);

      if (linha.some((item) => item.trim() !== "")) {
        linhas.push(linha);
      }
    }

    if (linhas.length < 2) {
      return [];
    }

    /* Cabeçalhos */

    const cabecalhos = linhas[0].map((coluna) => normalizar(coluna));

    /* Registros */

    return linhas.slice(1).map((valores) => {
      const registro = {};

      cabecalhos.forEach((cabecalho, indice) => {
        registro[cabecalho] = (valores[indice] || "").trim();
      });

      return registro;
    });
  }

  /* =========================================================
     NORMALIZAR DATA

     Aceita:
     2026-08-27
     27/08/2026
  ========================================================= */

  function normalizarData(data) {
    const valor = String(data || "").trim();

    if (!valor) {
      return "";
    }

    /* Formato ISO */

    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return valor;
    }

    /* Formato brasileiro */

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      const [dia, mes, ano] = valor.split("/");

      return `${ano}-${mes}-${dia}`;
    }

    return valor;
  }

  /* =========================================================
     FORMATAR DATA
  ========================================================= */

  function formatarData(data) {
    const dataNormalizada = normalizarData(data);

    if (!dataNormalizada) {
      return "";
    }

    const partes = dataNormalizada.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  /* =========================================================
     OBTER INTERAÇÕES DA NOTÍCIA
  ========================================================= */

  function obterInteracoes(noticia) {
    const interacao = window.interacoesPorNoticia?.[noticia.id];

    return {
      curtidas: interacao?.curtidas ?? 0,
      visualizacoes: interacao?.visualizacoes ?? 0,
    };
  }

  /* =========================================================
     CRIAR CARD DE NOTÍCIA
  ========================================================= */

  function criarCard(noticia) {
    const artigo = document.createElement("article");

    artigo.className = "noticia-card";

    const id = escaparHTML(noticia.id);

    artigo.dataset.noticiaId = id;

    const interacoes = obterInteracoes(noticia);

    const categoria = escaparHTML(noticia.categoria);

    const titulo = escaparHTML(noticia.titulo);

    const resumo = escaparHTML(noticia.resumo);

    const imagem = escaparHTML(converterImagemDrive(noticia.imagem));

    const link = escaparHTML(noticia.link);

    artigo.innerHTML = `
      <div class="noticia-card__imagem">

        <img
          src="${imagem}"
          alt="${titulo}"
          loading="lazy"
        >

      </div>

      <div class="noticia-card__conteudo">

        <span class="noticia-card__categoria">
          ${categoria}
        </span>

        <time
          class="noticia-data"
          datetime="${noticia.data}"
        >
          ${formatarData(noticia.data)}
        </time>

        <h3>
          ${titulo}
        </h3>

        <p>
          ${resumo}
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
              ${interacoes.curtidas}
            </span>

          </button>

          <span
            class="metrica"
            aria-label="${interacoes.visualizacoes} visualizações"
          >

            <span aria-hidden="true">
              👁
            </span>

            <span class="metrica__valor">
              ${interacoes.visualizacoes}
            </span>

          </span>

        </div>

        <a
          href="${link}"
          class="noticia-card__link"
        >
          Ler notícia →
        </a>

      </div>
    `;

    return artigo;
  }

  /* =========================================================
   CURTIDAS — PERSISTÊNCIA LOCAL
========================================================= */

  function ativarCurtidas() {
    const CHAVE_CURTIDAS = "aguiasCurtidas";

    let curtidasSalvas = JSON.parse(
      localStorage.getItem(CHAVE_CURTIDAS) || "[]",
    );

    /*
    Aplica as curtidas já registradas no navegador
  */
    document.querySelectorAll(".metrica--curtida").forEach((botao) => {
      const elemento = botao.closest("[data-noticia-id]");

      if (!elemento) {
        return;
      }

      const idNoticia = elemento.dataset.noticiaId;

      if (!idNoticia) {
        return;
      }

      if (curtidasSalvas.includes(idNoticia)) {
        const valor = botao.querySelector(".metrica__valor");

        if (valor) {
          const interacao = window.interacoesPorNoticia?.[idNoticia];

          const curtidasBase = interacao?.curtidas ?? 0;

          valor.textContent = curtidasBase + 1;
        }

        botao.classList.add("curtida-ativa");

        botao.setAttribute("aria-label", "Notícia curtida");
      }

      /*
      Evita adicionar o evento duas vezes
    */
      if (botao.dataset.curtidaAtivada === "true") {
        return;
      }

      botao.dataset.curtidaAtivada = "true";

      botao.addEventListener("click", () => {
        if (curtidasSalvas.includes(idNoticia)) {
          return;
        }

        curtidasSalvas.push(idNoticia);

        localStorage.setItem(CHAVE_CURTIDAS, JSON.stringify(curtidasSalvas));

        /*
        Atualiza todos os elementos dessa mesma notícia
      */
        document
          .querySelectorAll(
            `[data-noticia-id="${idNoticia}"] .metrica--curtida`,
          )
          .forEach((outroBotao) => {
            const valor = outroBotao.querySelector(".metrica__valor");

            if (!valor) {
              return;
            }

            const interacao = window.interacoesPorNoticia?.[idNoticia];

            const curtidasBase = interacao?.curtidas ?? 0;

            valor.textContent = curtidasBase + 1;

            outroBotao.classList.add("curtida-ativa");

            outroBotao.setAttribute("aria-label", "Notícia curtida");
          });
      });
    });
  }

  /* =========================================================
   VISUALIZAÇÕES — PERSISTÊNCIA LOCAL
========================================================= */

  function ativarVisualizacoes() {
    const CHAVE_VISUALIZACOES = "aguiasVisualizacoes";

    let visualizacoesSalvas = JSON.parse(
      localStorage.getItem(CHAVE_VISUALIZACOES) || "{}",
    );

    /*
    RESTAURAR VISUALIZAÇÕES
  */

    document.querySelectorAll("[data-noticia-id]").forEach((elemento) => {
      const idNoticia = elemento.dataset.noticiaId;

      if (!idNoticia) {
        return;
      }

      const interacao = window.interacoesPorNoticia?.[idNoticia];

      const visualizacoesBase = interacao?.visualizacoes ?? 0;

      const visualizacoesLocais = visualizacoesSalvas[idNoticia] ?? 0;

      const valor = elemento.querySelector(
        ".metrica:not(.metrica--curtida) .metrica__valor",
      );

      if (valor) {
        valor.textContent = visualizacoesBase + visualizacoesLocais;
      }
    });

    /*
    EVITAR DUPLICAR O EVENTO
  */

    if (document.body.dataset.visualizacoesAtivadas === "true") {
      return;
    }

    document.body.dataset.visualizacoesAtivadas = "true";

    /*
    REGISTRAR VISUALIZAÇÃO
  */

    document.addEventListener("click", (evento) => {
      const link = evento.target.closest("[data-noticia-id] a");

      if (!link) {
        return;
      }

      const elemento = link.closest("[data-noticia-id]");

      if (!elemento) {
        return;
      }

      const idNoticia = elemento.dataset.noticiaId;

      if (!idNoticia) {
        return;
      }

      const interacao = window.interacoesPorNoticia?.[idNoticia];

      const visualizacoesBase = interacao?.visualizacoes ?? 0;

      const visualizacoesLocais = visualizacoesSalvas[idNoticia] ?? 0;

      const novasVisualizacoes = visualizacoesLocais + 1;

      visualizacoesSalvas[idNoticia] = novasVisualizacoes;

      localStorage.setItem(
        CHAVE_VISUALIZACOES,
        JSON.stringify(visualizacoesSalvas),
      );

      /*
      ATUALIZAR TODOS OS CARDS DA MESMA NOTÍCIA
    */

      document
        .querySelectorAll(`[data-noticia-id="${idNoticia}"]`)
        .forEach((outroElemento) => {
          const outroValor = outroElemento.querySelector(
            ".metrica:not(.metrica--curtida) .metrica__valor",
          );

          if (outroValor) {
            outroValor.textContent = visualizacoesBase + novasVisualizacoes;
          }
        });
    });
  }

  /* =========================================================
     DESTAQUE — NOTÍCIA MAIS RECENTE
  ========================================================= */
  function mostrarDestaque() {
    if (!destaqueCard || noticias.length === 0) {
      return;
    }

    const noticiaDestaque = noticias[0];

    const id = escaparHTML(noticiaDestaque.id);

    const interacoes = obterInteracoes(noticiaDestaque);

    const categoria = escaparHTML(noticiaDestaque.categoria);

    const titulo = escaparHTML(noticiaDestaque.titulo);

    const resumo = escaparHTML(noticiaDestaque.resumo);

    const imagem = escaparHTML(converterImagemDrive(noticiaDestaque.imagem));

    const link = escaparHTML(noticiaDestaque.link);

    destaqueCard.dataset.noticiaId = id;

    destaqueCard.innerHTML = `
    <div class="destaque-card__imagem">

      <img
        src="${imagem}"
        alt="${titulo}"
      >

    </div>

    <div class="destaque-card__conteudo">

      <span class="noticia-card__categoria">
        ${categoria}
      </span>

      <time
        class="noticia-data"
        datetime="${noticiaDestaque.data}"
      >
        ${formatarData(noticiaDestaque.data)}
      </time>

      <h3>
        ${titulo}
      </h3>

      <p>
        ${resumo}
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
            ${interacoes.curtidas}
          </span>

        </button>

        <span
          class="metrica"
          aria-label="${interacoes.visualizacoes} visualizações"
        >

          <span aria-hidden="true">
            👁
          </span>

          <span class="metrica__valor">
            ${interacoes.visualizacoes}
          </span>

        </span>

      </div>

      <a
        href="${link}"
        class="botao botao--secundario"
      >
        Ler notícia
      </a>

    </div>
  `;
  }

  /* =========================================================
     HOME — 3 NOTÍCIAS MAIS RECENTES
  ========================================================= */

  function mostrarNoticiasHome() {
    if (!listaNoticiasHome) {
      return;
    }

    const noticiasRecentes = [...noticias]
      .sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
      })
      .slice(0, 3);

    listaNoticiasHome.innerHTML = "";

    noticiasRecentes.forEach((noticia) => {
      listaNoticiasHome.appendChild(criarCard(noticia));
    });
  }

  /* =========================================================
     FILTRAR NOTÍCIAS
  ========================================================= */

  function obterNoticiasFiltradas() {
    let resultado;

    if (categoriaAtual === "todas") {
      resultado = [...noticias];
    } else {
      resultado = noticias.filter((noticia) => {
        const categoria = normalizar(noticia.categoria);

        if (categoriaAtual === "competicoes" && categoria === "competicao") {
          return true;
        }

        return categoria === categoriaAtual;
      });
    }

    return resultado.sort((a, b) => {
      return new Date(b.data) - new Date(a.data);
    });
  }

  /* =========================================================
   MOSTRAR NOTÍCIAS
========================================================= */

  function mostrarNoticias() {
    if (!listaNoticias) {
      return;
    }

    const filtradas = obterNoticiasFiltradas();

    const inicio = (paginaAtual - 1) * noticiasPorPagina;

    const fim = inicio + noticiasPorPagina;

    const noticiasPagina = filtradas.slice(inicio, fim);

    listaNoticias.innerHTML = "";

    noticiasPagina.forEach((noticia) => {
      listaNoticias.appendChild(criarCard(noticia));
    });

    ativarCurtidas();

    ativarVisualizacoes();

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

      categoriaAtual = normalizar(filtro.textContent);

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
     ANTERIOR
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
     PRÓXIMA
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
     CARREGAR GOOGLE SHEETS
  ========================================================= */

  async function carregarNoticias() {
    try {
      console.log("Consultando Google Sheets — Notícias...");

      const resposta = await fetch(CSV_URL, {
        cache: "no-store",
      });

      if (!resposta.ok) {
        throw new Error("Erro HTTP: " + resposta.status);
      }

      const texto = await resposta.text();

      console.log("CSV de notícias recebido:", texto);

      const registros = lerCSV(texto);

      console.log("Registros encontrados:", registros);

      /* =====================================================
         TRANSFORMAR DADOS
      ===================================================== */

      noticias = registros
        .filter((noticia) => {
          return normalizar(noticia.ativo) === "sim";
        })
        .map((noticia) => {
          return {
            id: noticia.id || "",

            categoria: noticia.categoria || "Paradesporto",

            data: normalizarData(noticia.data),

            titulo: noticia.titulo || "Notícia",

            resumo: noticia.resumo || "",

            imagem: noticia.imagem || "assets/atletas.jpg",

            link: noticia.link || "noticias.html",
          };
        })
        .filter((noticia) => {
          return noticia.titulo && noticia.data;
        });

      /* =====================================================
         ORDENAR — MAIS RECENTE PRIMEIRO
      ===================================================== */

      noticias.sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
      });

      console.log("Notícias ativas:", noticias);

      /* =====================================================
         RENDERIZAR TUDO
      ===================================================== */

      mostrarDestaque();

      mostrarNoticias();

      mostrarNoticiasHome();

      ativarCurtidas();

      ativarVisualizacoes();
    } catch (erro) {
      console.error("Erro ao carregar notícias:", erro);

      mostrarErro();
    }
  }

  /* =========================================================
     ERRO
  ========================================================= */

  function mostrarErro() {
    if (listaNoticias) {
      listaNoticias.innerHTML = `
        <div class="documentos-vazio">
          <p>
            Não foi possível carregar as notícias.
          </p>
        </div>
      `;
    }

    if (listaNoticiasHome) {
      listaNoticiasHome.innerHTML = `
        <div class="documentos-vazio">
          <p>
            Não foi possível carregar as notícias.
          </p>
        </div>
      `;
    }

    if (destaqueCard) {
      destaqueCard.innerHTML = `
        <div class="destaque-card__conteudo">
          <p>
            Não foi possível carregar
            a notícia em destaque.
          </p>
        </div>
      `;
    }
  }

  /* =========================================================
     ATUALIZAR QUANDO AS INTERAÇÕES FOREM CARREGADAS
  ========================================================= */

  document.addEventListener("interacoesCarregadas", () => {
    mostrarDestaque();
    mostrarNoticias();
    mostrarNoticiasHome();

    if (window.interacoesPorNoticia) {
      mostrarDestaque();
      mostrarNoticias();
      mostrarNoticiasHome();
      ativarCurtidas();

      ativarVisualizacoes();
    }
  });

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  carregarNoticias();

  ativarVisualizacoes();
});
