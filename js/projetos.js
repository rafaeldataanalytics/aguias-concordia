/* =========================================================
   ÁGUIAS DE CONCÓRDIA
   PROJETOS — GOOGLE SHEETS + RENDERIZAÇÃO + GOOGLE DRIVE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     GOOGLE SHEETS
  ========================================================= */

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/" +
    "2PACX-1vTmOu4NYHC7VKHJHCcnyoLmPywh4v2q31C6JP8KmV10yjL8ZLKBzmzck-DJNcUot5wzAAYKxoTsnP9C" +
    "/pub?gid=1124721691&single=true&output=csv";

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
    valor_recurso: "Valor do recurso",
    fonte_recurso: "Fonte do recurso",
  };

  /* =========================================================
     ESTADO
  ========================================================= */

  let projetos = [];

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
     FORMATAR VALOR MONETÁRIO
  ========================================================= */

  function formatarValor(valor) {
    if (valor === null || valor === undefined || String(valor).trim() === "") {
      return "";
    }

    let numero;

    const texto = String(valor).trim().replace(/R\$/gi, "").replace(/\s/g, "");

    /*
      Aceita:

      184008
      184008,00
      184.008,00
      184008.00
    */

    if (texto.includes(",") && texto.includes(".")) {
      numero = Number(texto.replace(/\./g, "").replace(",", "."));
    } else if (texto.includes(",")) {
      numero = Number(texto.replace(",", "."));
    } else {
      numero = Number(texto);
    }

    if (Number.isNaN(numero)) {
      return escaparHTML(valor);
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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
     CRIAR PROJETO
  ========================================================= */

  function criarProjeto(projeto) {
    const artigo = document.createElement("article");

    artigo.className = "projeto-detalhe";

    /* =====================================================
       INFORMAÇÕES
    ===================================================== */

    const informacoes = {
      proponente: projeto.proponente,

      modalidade: projeto.modalidade,

      periodo: projeto.periodo,

      publico: projeto.publico,

      local: projeto.local,

      valor_recurso: formatarValor(projeto.valor_recurso),

      fonte_recurso: projeto.fonte_recurso,
    };

    const informacoesHTML = Object.entries(informacoes)
      .filter(([, valor]) => {
        return String(valor || "").trim() !== "";
      })
      .map(([chave, valor]) => {
        return `
              <div>

                <strong>
                  ${nomesInformacoes[chave] || chave}
                </strong>

                <span>
                  ${escaparHTML(valor)}
                </span>

              </div>
            `;
      })
      .join("");

    /* =====================================================
       DADOS DO PROJETO
    ===================================================== */

    const titulo = escaparHTML(projeto.titulo);

    const categoria = escaparHTML(projeto.categoria);

    const situacao = escaparHTML(projeto.situacao);

    const descricao = escaparHTML(projeto.descricao);

    const imagem = escaparHTML(
      converterImagemDrive(projeto.imagem || "assets/atletas.jpg"),
    );

    const link = escaparHTML(projeto.link || "transparencia.html#projetos");

    /* =====================================================
       HTML
    ===================================================== */

    artigo.innerHTML = `

      <div class="projeto-detalhe__imagem">

        <img
          src="${imagem}"
          alt="${titulo}"
          loading="lazy"
        >

      </div>


      <div class="projeto-detalhe__conteudo">

        <span class="projeto-detalhe__categoria">
          ${categoria}
        </span>


        <h3>
          ${titulo}
        </h3>


        <p>
          ${descricao}
        </p>


        <div class="projeto-status">

          <strong>
            Situação
          </strong>

          <span class="projeto-status__valor">
            ${situacao}
          </span>

        </div>


        <div class="projeto-detalhe__informacoes">

          ${informacoesHTML}

        </div>


        <!-- DOCUMENTOS NA TRANSPARÊNCIA -->

        <div class="projeto-detalhe__acao">

          <a
            href="${link}"
            class="botao"
            aria-label="Ver documentos e prestação de contas de ${titulo}"
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

    return artigo;
  }

  /* =========================================================
     RENDERIZAR PROJETOS
  ========================================================= */

  function renderizarProjetos() {
    if (!listaProjetos) {
      return;
    }

    listaProjetos.innerHTML = "";

    if (projetos.length === 0) {
      listaProjetos.innerHTML = `
        <div class="projetos-vazio">

          <p>
            Nenhum projeto disponível no momento.
          </p>

        </div>
      `;

      return;
    }

    projetos.forEach((projeto) => {
      listaProjetos.appendChild(criarProjeto(projeto));
    });
  }

  /* =========================================================
     CARREGAR PROJETOS DO GOOGLE SHEETS
  ========================================================= */

  async function carregarProjetos() {
    try {
      console.log("Consultando Google Sheets — Projetos...");

      const resposta = await fetch(CSV_URL, {
        cache: "no-store",
      });

      if (!resposta.ok) {
        throw new Error("Erro HTTP: " + resposta.status);
      }

      const texto = await resposta.text();

      console.log("CSV de projetos recebido:", texto);

      const registros = lerCSV(texto);

      console.log("Registros de projetos encontrados:", registros);

      /* =====================================================
         TRANSFORMAR DADOS
      ===================================================== */

      projetos = registros
        .filter((projeto) => {
          return normalizar(projeto.ativo) === "sim";
        })
        .map((projeto) => {
          return {
            titulo: projeto.titulo || "",

            categoria: projeto.categoria || "",

            situacao: projeto.situacao || "",

            descricao: projeto.descricao || "",

            proponente: projeto.proponente || "",

            modalidade: projeto.modalidade || "",

            periodo: projeto.periodo || "",

            publico: projeto.publico || "",

            local: projeto.local || "",

            imagem: projeto.imagem || "assets/atletas.jpg",

            link: projeto.link || "transparencia.html#projetos",

            valor_recurso:
              projeto["valor recurso"] ||
              projeto["valor recurso r$"] ||
              projeto["valor_recurso"] ||
              "",

            fonte_recurso:
              projeto["fonte de recurso"] || projeto["fonte_recurso"] || "",
          };
        })
        .filter((projeto) => {
          return projeto.titulo;
        });

      console.log("Projetos ativos:", projetos);

      renderizarProjetos();
    } catch (erro) {
      console.error("Erro ao carregar projetos:", erro);

      mostrarErro();
    }
  }

  /* =========================================================
     ERRO
  ========================================================= */

  function mostrarErro() {
    if (!listaProjetos) {
      return;
    }

    listaProjetos.innerHTML = `
      <div class="projetos-vazio">

        <p>
          Não foi possível carregar os projetos.
        </p>

      </div>
    `;
  }

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  carregarProjetos();
});
