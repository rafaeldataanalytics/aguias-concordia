document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     GOOGLE SHEETS
  ========================================= */

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/" +
    "2PACX-1vTmOu4NYHC7VKHJHCcnyoLmPywh4v2q31C6JP8KmV10yjL8ZLKBzmzck-DJNcUot5wzAAYKxoTsnP9C" +
    "/pub?gid=0&single=true&output=csv";

  /* =========================================
     ELEMENTOS
  ========================================= */

  const lista = document.getElementById("lista-documentos");

  const tituloCategoria = document.getElementById(
    "titulo-categoria-documentos",
  );

  const anoDocumentos = document.getElementById("ano-documentos");

  const seletorAno = document.getElementById("ano-transparencia");

  const statusDocumentos = document.getElementById("status-documentos");

  const grupoDocumentos = document.getElementById("grupo-documentos");

  /* =========================================
     ESTADO INICIAL
  ========================================= */

  let categoriaAtual = null;

  /* =========================================
     CATEGORIAS
  ========================================= */

  const categorias = {
    estatuto: "Estatuto",

    atas: "Atas",

    "conselho-fiscal": "Conselho Fiscal",

    editais: "Editais",

    "resultados-editais": "Resultados dos Editais",

    "balanco-patrimonial": "Balanço Patrimonial",

    calendario: "Calendário",

    dre: "DRE",

    "notas-fiscais": "Notas Fiscais",

    "relatorios-gestao": "Relatórios de Gestão",

    "relatorios-financeiros": "Relatórios Financeiros",

    projetos: "Projetos",

    "calendario-atividades": "Calendário de Atividades",

    voluntarios: "Voluntários",
  };

  /* =========================================
     NORMALIZAR TEXTO
  ========================================= */

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  /* =========================================
     STATUS — CARREGANDO
  ========================================= */
  function mostrarCarregando() {
    if (!statusDocumentos) {
      return;
    }

    statusDocumentos.className = "documentos-aviso status-carregando";

    statusDocumentos.innerHTML = `

    <i
      class="fa-solid fa-basketball status-bola status-bola--carregando"
      aria-hidden="true">
    </i>

    <p>
      Carregando documentos...
    </p>

  `;
  }

  /* =========================================
     STATUS — SUCESSO
  ========================================= */

  function mostrarSucesso() {
    if (!statusDocumentos) {
      return;
    }

    statusDocumentos.className = "documentos-aviso status-sucesso";

    statusDocumentos.innerHTML = `

    <i
      class="fa-solid fa-basketball status-bola status-bola--sucesso"
      aria-hidden="true">
    </i>

    <p>
      Documentos atualizados com sucesso.
    </p>

  `;
  }

  /* =========================================
     STATUS — NÃO ENCONTRADO
  ========================================= */

  function mostrarNaoEncontrado() {
    if (!lista) {
      return;
    }

    lista.innerHTML = `

    <div class="documentos-vazio">

      <i
        class="fa-solid fa-basketball status-bola status-bola--vazio"
        aria-hidden="true">
      </i>

      <p>
        Nenhum documento encontrado
        para esta categoria e ano.
      </p>

    </div>

  `;
  }

  /* =========================================
     STATUS — ERRO
  ========================================= */

  function mostrarErro() {
    if (statusDocumentos) {
      statusDocumentos.className = "documentos-aviso status-erro";

      statusDocumentos.innerHTML = `

      <i
        class="fa-solid fa-basketball status-bola status-bola--erro"
        aria-hidden="true">
      </i>

      <p>
        Não foi possível carregar
        os documentos.
      </p>

    `;
    }

    if (lista) {
      lista.innerHTML = "";
    }
  }
  /* =========================================
     ESTADO INICIAL — SEM CATEGORIA
  ========================================= */

  function mostrarEstadoInicial() {
    if (tituloCategoria) {
      tituloCategoria.textContent = "Documentos disponíveis";
    }

    if (anoDocumentos) {
      anoDocumentos.textContent = "";
    }

    if (statusDocumentos) {
      statusDocumentos.innerHTML = `

        <i
          class="fa-solid fa-circle-info"
          aria-hidden="true">
        </i>

        <p>
          Selecione uma categoria acima
          para consultar os documentos.
        </p>

      `;
    }

    if (lista) {
      lista.innerHTML = "";
    }
  }

  /* =========================================
     CRIAR DOCUMENTO
  ========================================= */

  function criarDocumento(documento) {
    const linha = document.createElement("div");

    linha.className = "documento-linha";

    const nome = documento.documento || "Documento";

    const mes = documento.mes || documento["mês"] || "";

    const ano = documento.ano || "";

    const link = documento.link || "#";

    linha.innerHTML = `

      <div class="documento-linha__info">

        <i
          class="fa-solid fa-file-pdf"
          aria-hidden="true">
        </i>

        <div>

          <strong>
            ${nome}
          </strong>

          <small>
            ${mes}${mes && ano ? " — " : ""}${ano}
          </small>

        </div>

      </div>


      <a
        class="botao-documento"
        href="${link}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir ${nome}">

        <i
          class="fa-solid fa-arrow-up-right-from-square"
          aria-hidden="true">
        </i>

        Abrir documento

      </a>

    `;

    return linha;
  }

  /* =========================================
     MOSTRAR DOCUMENTOS
  ========================================= */

  function mostrarDocumentos(documentos) {
    if (!lista) {
      return;
    }

    lista.innerHTML = "";

    if (documentos.length === 0) {
      mostrarNaoEncontrado();

      return;
    }

    documentos.forEach((documento) => {
      lista.appendChild(criarDocumento(documento));
    });
  }

  /* =========================================
     LER CSV
  ========================================= */

  function lerCSV(texto) {
    const linhas = texto.trim().split(/\r?\n/);

    if (linhas.length < 2) {
      return [];
    }

    const cabecalhos = linhas[0].split(",").map((coluna) => normalizar(coluna));

    return linhas.slice(1).map((linha) => {
      const valores = linha.split(",");

      const registro = {};

      cabecalhos.forEach((cabecalho, indice) => {
        registro[cabecalho] = (valores[indice] || "").trim();
      });

      return registro;
    });
  }

  /* =========================================
     RENDERIZAR
  ========================================= */

  function renderizar(documentos) {
    if (!categoriaAtual) {
      mostrarEstadoInicial();

      return;
    }

    const anoSelecionado = seletorAno ? seletorAno.value : "2026";

    const documentosFiltrados = documentos.filter((documento) => {
      const categoria = normalizar(documento.categoria);

      const mesmaCategoria = categoria === normalizar(categoriaAtual);

      const mesmoAno =
        String(documento.ano || "").trim() === String(anoSelecionado).trim();

      return mesmaCategoria && mesmoAno;
    });

    if (tituloCategoria) {
      tituloCategoria.textContent = categoriaAtual;
    }

    if (anoDocumentos) {
      anoDocumentos.textContent = anoSelecionado;
    }

    mostrarDocumentos(documentosFiltrados);
  }

  /* =========================================
     CARREGAR GOOGLE SHEETS
  ========================================= */

  async function carregarPlanilha() {
    if (!categoriaAtual) {
      mostrarEstadoInicial();

      return;
    }

    mostrarCarregando();

    try {
      console.log("Consultando Google Sheets...");

      const resposta = await fetch(CSV_URL, {
        cache: "no-store",
      });

      if (!resposta.ok) {
        throw new Error("Erro HTTP: " + resposta.status);
      }

      const texto = await resposta.text();

      console.log("CSV recebido:", texto);

      const documentos = lerCSV(texto);

      console.log("Documentos encontrados:", documentos);

      mostrarSucesso();

      renderizar(documentos);
    } catch (erro) {
      console.error("Erro ao carregar Google Sheets:", erro);

      mostrarErro();
    }
  }

  /* =========================================
     SELECIONAR CATEGORIA
  ========================================= */

  document.querySelectorAll(".transparencia-item").forEach((item) => {
    item.addEventListener("click", (evento) => {
      evento.preventDefault();

      const href = item.getAttribute("href");

      const id = href ? href.replace("#", "") : "";

      categoriaAtual = categorias[id] || null;

      /* Remover seleção anterior */

      document.querySelectorAll(".transparencia-item").forEach((categoria) => {
        categoria.classList.remove("selecionado");

        categoria.setAttribute("aria-current", "false");
      });

      /* Marcar categoria escolhida */

      item.classList.add("selecionado");

      item.setAttribute("aria-current", "true");

      /* Carregar documentos */

      carregarPlanilha();

      /* Ir para documentos */

      if (grupoDocumentos) {
        grupoDocumentos.scrollIntoView({
          behavior: "smooth",

          block: "start",
        });
      }
    });
  });

  /* =========================================
     FILTRO DE ANO
  ========================================= */

  if (seletorAno) {
    seletorAno.addEventListener("change", () => {
      if (!categoriaAtual) {
        return;
      }

      carregarPlanilha();
    });
  }

  /* =========================================
     INICIAR
  ========================================= */

  mostrarEstadoInicial();
});
