/* =========================================================
   ÁGUIAS DE CONCÓRDIA
   NOTÍCIAS — GOOGLE SHEETS + DESTAQUE + FILTROS
   + PAGINAÇÃO + HOME + GOOGLE DRIVE
   + INTERAÇÕES GOOGLE SHEETS
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
     FORMATAR RESUMO DAS NOTÍCIAS
  ========================================================= */

  function formatarResumo(texto) {
    const conteudo = String(texto || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");

    const linhas = conteudo
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean);

    const indiceJogos = linhas.findIndex(
      (linha) => normalizar(linha) === "jogos:",
    );

    /* =========================================================
       NOTÍCIA NORMAL
    ========================================================= */

    if (indiceJogos === -1) {
      return linhas.map((linha) => `<p>${escaparHTML(linha)}</p>`).join("");
    }

    /* =========================================================
       INTRODUÇÃO
    ========================================================= */

    const introducao = linhas
      .slice(0, indiceJogos)
      .map((linha) => `<p>${escaparHTML(linha)}</p>`)
      .join("");

    /* =========================================================
       JOGOS
    ========================================================= */

    const linhasJogos = linhas.slice(indiceJogos + 1);

    const jogos = [];

    for (let i = 0; i < linhasJogos.length; i++) {
      const linha = linhasJogos[i];

      const partes = linha.split("|").map((parte) => parte.trim());

      if (partes.length === 3) {
        const data = partes[0];

        const hora = partes[1];

        let local = partes[2];

        let confronto = "";

        const proximaLinha = linhasJogos[i + 1];

        if (proximaLinha && !proximaLinha.includes("|")) {
          confronto = proximaLinha;

          i++;
        }

        if (!confronto) {
          const matchLocal = local.match(/^(.+?\s-\s[A-Z]{2})\s+(.+)$/);

          if (matchLocal) {
            local = matchLocal[1].trim();

            confronto = matchLocal[2].trim();
          }
        }

        if (confronto) {
          jogos.push({
            data,
            hora,
            local,
            confronto,
          });
        }
      }
    }

    /* =========================================================
       SEGURANÇA
    ========================================================= */

    if (jogos.length === 0) {
      return linhas.map((linha) => `<p>${escaparHTML(linha)}</p>`).join("");
    }

    /* =========================================================
       MONTAR BLOCOS
    ========================================================= */

    const blocosJogos = jogos
      .map(
        (jogo) => `
        <div class="noticia-jogo">

          <div class="noticia-jogo__cabecalho">
            <strong>JOGO</strong>
          </div>

          <div class="noticia-jogo__informacoes">

            <span>
              <span aria-hidden="true">📅</span>
              <strong>${escaparHTML(jogo.data)}</strong>
            </span>

            <span>
              <span aria-hidden="true">🕒</span>
              <strong>${escaparHTML(jogo.hora)}</strong>
            </span>

            <span>
              <span aria-hidden="true">📍</span>
              ${escaparHTML(jogo.local)}
            </span>

          </div>

          <div class="noticia-jogo__confronto">
            ${escaparHTML(jogo.confronto)}
          </div>

        </div>
      `,
      )
      .join("");

    return `
    ${introducao}

    <div class="noticia-jogos">

      <h4>JOGOS</h4>

      ${blocosJogos}

    </div>
  `;
  }

  /* =========================================================
     LER CSV
  ========================================================= */

  function lerCSV(texto) {
    const linhas = [];

    let linha = [];

    let valor = "";

    let dentroDeAspas = false;

    for (let i = 0; i < texto.length; i++) {
      const caractere = texto[i];

      const proximo = texto[i + 1];

      if (caractere === '"' && dentroDeAspas && proximo === '"') {
        valor += '"';

        i++;

        continue;
      }

      if (caractere === '"') {
        dentroDeAspas = !dentroDeAspas;

        continue;
      }

      if (caractere === "," && !dentroDeAspas) {
        linha.push(valor);

        valor = "";

        continue;
      }

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

    if (valor !== "" || linha.length > 0) {
      linha.push(valor);

      if (linha.some((item) => item.trim() !== "")) {
        linhas.push(linha);
      }
    }

    if (linhas.length < 2) {
      return [];
    }

    const cabecalhos = linhas[0].map((coluna) => normalizar(coluna));

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
  ========================================================= */

  function normalizarData(data) {
    const valor = String(data || "").trim();

    if (!valor) {
      return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return valor;
    }

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
     API — REGISTRAR INTERAÇÃO
  ========================================================= */

  const API_INTERACOES =
    "https://script.google.com/macros/s/AKfycbx8NEsynuzAjwGf9lmW2j4ZmCjSdLg1E7Z2NeU5VqHhFTDgLe3xwBTz6at4Hl_GhhNu/exec";

  async function enviarInteracao(acao, idNoticia) {
    try {
      const resposta = await fetch(API_INTERACOES, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          acao: acao,
          id_noticia: idNoticia,
        }),
      });

      const dados = await resposta.json();

      if (!dados.sucesso) {
        throw new Error(dados.erro || "Erro ao registrar interação.");
      }

      console.log(`Interação registrada: ${acao} — ${idNoticia}`);

      console.log("Totais oficiais:", {
        curtidas: dados.curtidas,
        visualizacoes: dados.visualizacoes,
      });

      return dados;
    } catch (erro) {
      console.error(`Erro ao registrar ${acao}:`, erro);

      return null;
    }
  }

  /* =========================================================
     CRIAR CARD DE NOTÍCIA
  ========================================================= */

  function criarCard(noticia, usarFormatoJogos = true) {
    const artigo = document.createElement("article");

    artigo.className = "noticia-card";

    const id = escaparHTML(noticia.id);

    artigo.dataset.noticiaId = id;

    const interacoes = obterInteracoes(noticia);

    const categoria = escaparHTML(noticia.categoria);

    const titulo = escaparHTML(noticia.titulo);

    const resumo = usarFormatoJogos
      ? formatarResumo(noticia.resumo)
      : `<p>${escaparHTML(noticia.resumo.split(/\r?\n/)[0])}</p>`;

    const imagem = escaparHTML(converterImagemDrive(noticia.imagem));

    const linkBase = noticia.link || "noticias.html";

    const separador = linkBase.includes("?") ? "&" : "?";

    const link = escaparHTML(
      `${linkBase}${separador}id=${encodeURIComponent(noticia.id)}`,
    );

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


        <div class="noticia-resumo">
          ${resumo}
        </div>


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
     CURTIDAS — GOOGLE SHEETS + CONTROLE LOCAL
  ========================================================= */

  function ativarCurtidas() {
    const CHAVE_CURTIDAS = "aguiasCurtidas";

    let curtidasSalvas = JSON.parse(
      localStorage.getItem(CHAVE_CURTIDAS) || "[]",
    );

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
        botao.classList.add("curtida-ativa");

        botao.setAttribute("aria-label", "Notícia curtida");
      }

      if (botao.dataset.curtidaAtivada === "true") {
        return;
      }

      botao.dataset.curtidaAtivada = "true";

      botao.addEventListener("click", async () => {
        if (curtidasSalvas.includes(idNoticia)) {
          return;
        }

        if (botao.dataset.curtidaEnviando === "true") {
          return;
        }

        botao.dataset.curtidaEnviando = "true";

        botao.disabled = true;

        const dados = await enviarInteracao("curtir", idNoticia);

        if (!dados) {
          botao.dataset.curtidaEnviando = "false";

          botao.disabled = false;

          return;
        }

        curtidasSalvas.push(idNoticia);

        localStorage.setItem(CHAVE_CURTIDAS, JSON.stringify(curtidasSalvas));

        if (!window.interacoesPorNoticia) {
          window.interacoesPorNoticia = {};
        }

        if (!window.interacoesPorNoticia[idNoticia]) {
          window.interacoesPorNoticia[idNoticia] = {
            curtidas: 0,

            visualizacoes: 0,
          };
        }

        window.interacoesPorNoticia[idNoticia].curtidas = dados.curtidas;

        const novoTotal = dados.curtidas;

        document
          .querySelectorAll(
            `[data-noticia-id="${idNoticia}"] .metrica--curtida`,
          )
          .forEach((outroBotao) => {
            const valor = outroBotao.querySelector(".metrica__valor");

            if (valor) {
              valor.textContent = novoTotal;
            }

            outroBotao.classList.add("curtida-ativa");

            outroBotao.setAttribute("aria-label", "Notícia curtida");

            outroBotao.disabled = true;
          });

        botao.dataset.curtidaEnviando = "false";
      });
    });
  }

  /* =========================================================
     VISUALIZAÇÕES — GOOGLE SHEETS
     
     A visualização é registrada quando a notícia
     é efetivamente aberta.
  ========================================================= */

  async function registrarVisualizacaoAtual() {
    /*
      Descobrir se existe uma notícia
      específica na URL.
    */

    const parametros = new URLSearchParams(window.location.search);

    const idNoticia = parametros.get("id");

    /*
      Se não existe ?id=...
      estamos na listagem/Home.
    */

    if (!idNoticia) {
      return;
    }

    /*
      Evita registrar duas vezes
      durante a mesma execução da página.
    */

    if (document.body.dataset.visualizacaoRegistrada === "true") {
      return;
    }

    /*
      Verificar se a notícia existe
      entre as notícias ativas.
    */

    const noticia = noticias.find((item) => item.id === idNoticia);

    if (!noticia) {
      console.warn("Notícia não encontrada para visualização:", idNoticia);

      return;
    }

    document.body.dataset.visualizacaoRegistrada = "true";

    console.log(`Registrando visualização: ${idNoticia}`);

    const dados = await enviarInteracao("visualizar", idNoticia);

    if (!dados) {
      /*
        Se falhar, libera para uma
        nova tentativa.
      */

      document.body.dataset.visualizacaoRegistrada = "false";

      return;
    }

    /*
      Atualizar contador em memória.
    */

    if (!window.interacoesPorNoticia) {
      window.interacoesPorNoticia = {};
    }

    if (!window.interacoesPorNoticia[idNoticia]) {
      window.interacoesPorNoticia[idNoticia] = {
        curtidas: 0,

        visualizacoes: 0,
      };
    }

    window.interacoesPorNoticia[idNoticia].visualizacoes = dados.visualizacoes;

    const novoTotal = dados.visualizacoes;

    /*
      Atualizar todos os elementos
      da notícia na página.
    */

    document
      .querySelectorAll(`[data-noticia-id="${idNoticia}"]`)
      .forEach((elemento) => {
        const valor = elemento.querySelector(
          ".metrica:not(.metrica--curtida) .metrica__valor",
        );

        if (valor) {
          valor.textContent = novoTotal;
        }
      });

    console.log(
      `Visualização registrada: ${idNoticia} — total local: ${novoTotal}`,
    );
  }

  /* =========================================================
   DESTAQUE — NOTÍCIA MAIS RECENTE
========================================================= */

  function mostrarDestaque() {
    if (!destaqueCard || noticias.length === 0) {
      return;
    }

    const parametros = new URLSearchParams(window.location.search);

    const idSelecionado = parametros.get("id");

    const noticiaDestaque =
      noticias.find((noticia) => noticia.id === idSelecionado) || noticias[0];

    const id = escaparHTML(noticiaDestaque.id);

    const interacoes = obterInteracoes(noticiaDestaque);

    const categoria = escaparHTML(noticiaDestaque.categoria);

    const titulo = escaparHTML(noticiaDestaque.titulo);

    const resumo = formatarResumo(noticiaDestaque.resumo);

    const imagem = escaparHTML(converterImagemDrive(noticiaDestaque.imagem));

    const linkBase = noticiaDestaque.link || "noticias.html";

    const separador = linkBase.includes("?") ? "&" : "?";

    const link = escaparHTML(
      `${linkBase}${separador}id=${encodeURIComponent(noticiaDestaque.id)}`,
    );

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


      <div class="noticia-resumo">
        ${resumo}
      </div>


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
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 3);

    listaNoticiasHome.innerHTML = "";

    noticiasRecentes.forEach((noticia) => {
      listaNoticiasHome.appendChild(criarCard(noticia, false));
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

    return resultado.sort((a, b) => new Date(b.data) - new Date(a.data));
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

      noticias.sort((a, b) => new Date(b.data) - new Date(a.data));

      console.log("Notícias ativas:", noticias);

      /* =====================================================
         RENDERIZAR TUDO
      ===================================================== */

      mostrarDestaque();

      mostrarNoticias();

      mostrarNoticiasHome();

      ativarCurtidas();

      /*
        Registrar visualização somente
        quando houver ?id=...
      */

      await registrarVisualizacaoAtual();
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

    ativarCurtidas();
  });

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  carregarNoticias();
});
