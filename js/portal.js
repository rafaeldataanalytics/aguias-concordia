document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     GOOGLE SHEETS
  ========================================= */

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/" +
    "2PACX-1vTmOu4NYHC7VKHJHCcnyoLmPywh4v2q31C6JP8KmV10yjL8ZLKBzmzck-DJNcUot5wzAAYKxoTsnP9C" +
    "/pub?gid=0&single=true&output=csv";

  const CSV_URL_PROJETOS =
    "https://docs.google.com/spreadsheets/d/e/" +
    "2PACX-1vTmOu4NYHC7VKHJHCcnyoLmPywh4v2q31C6JP8KmV10yjL8ZLKBzmzck-DJNcUot5wzAAYKxoTsnP9C" +
    "/pub?gid=1124721691&single=true&output=csv";

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

  const projetosStatus = document.getElementById("projetos-status");
  const botoesStatusProjeto = document.querySelectorAll(
    ".projetos-status__botao",
  );

  /* =========================================
     ESTADO INICIAL
  ========================================= */

  let categoriaAtual = null;

  let documentosCarregados = [];

  let statusProjetoAtual = null;

  /* =========================================
   ATUALIZAR FILTRO DE ANO
   SOMENTE ANOS DA CATEGORIA ATUAL
========================================= */

  function atualizarFiltroAnos(documentos) {
    if (!seletorAno) {
      return;
    }

    const anos = [
      ...new Set(
        documentos
          .filter((documento) => {
            const mesmaCategoria =
              normalizar(documento.categoria) === normalizar(categoriaAtual);

            return mesmaCategoria && documentoAtivo(documento);
          })
          .map((documento) => String(documento.ano || "").trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => Number(b) - Number(a));

    const anoAnterior = seletorAno.value;

    seletorAno.innerHTML = "";

    if (anos.length === 0) {
      const opcao = document.createElement("option");

      opcao.value = "";

      opcao.textContent = "Nenhum ano disponível";

      seletorAno.appendChild(opcao);

      return;
    }

    anos.forEach((ano) => {
      const opcao = document.createElement("option");

      opcao.value = ano;

      opcao.textContent = ano;

      seletorAno.appendChild(opcao);
    });

    if (anos.includes(anoAnterior)) {
      seletorAno.value = anoAnterior;
    } else {
      seletorAno.value = anos[0];
    }
  }
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

  /* =========================================================
     STATUS DO PROJETO VINDO DA PÁGINA PROJETOS
  ========================================================= */

  const parametrosURL = new URLSearchParams(window.location.search);

  const statusURL = parametrosURL.get("status") || "";

  const statusProjetoURL = {
    "em-execucao": "Em execução",
    finalizados: "Finalizado",
    "captando-recursos": "Captando recursos",
  };

  const statusInicialURL = statusProjetoURL[statusURL] || null;

  /* =========================================
     ESCAPAR HTML
  ========================================= */

  function escaparHTML(texto) {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
    if (projetosStatus) {
      projetosStatus.hidden = true;
    }

    if (tituloCategoria) {
      tituloCategoria.textContent = "Documentos disponíveis";
    }

    if (anoDocumentos) {
      anoDocumentos.textContent = "";
    }

    if (seletorAno) {
      seletorAno.innerHTML = `
    <option value="" selected disabled>
      Selecione uma categoria
    </option>
  `;
    }

    if (statusDocumentos) {
      statusDocumentos.className = "documentos-aviso";

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

    const nome = escaparHTML(documento.documento || "Documento");

    const descricao = escaparHTML(
      documento.descricao || documento["descrição"] || "",
    );

    const mes = escaparHTML(documento.mes || documento["mês"] || "");

    const ano = escaparHTML(documento.ano || "");

    const link = String(documento.link || "#").trim();

    /*
     * Descrição é opcional.
     * Se estiver preenchida, aparece abaixo do nome.
     */

    const descricaoHTML = descricao
      ? `
          <span class="documento-descricao">
            ${descricao}
          </span>
        `
      : "";

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

          ${descricaoHTML}

          <small>
            ${mes}${mes && ano ? " — " : ""}${ano}
          </small>

        </div>

      </div>

      <a
        class="botao-documento"
        href="${escaparHTML(link)}"
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
     Parser compatível com campos entre aspas
  ========================================= */

  function lerCSV(texto) {
    const linhas = [];

    let linhaAtual = [];

    let campoAtual = "";

    let dentroDeAspas = false;

    for (let i = 0; i < texto.length; i++) {
      const caractere = texto[i];

      const proximo = texto[i + 1];

      /* Aspas */

      if (caractere === '"') {
        if (dentroDeAspas && proximo === '"') {
          campoAtual += '"';

          i++;

          continue;
        }

        dentroDeAspas = !dentroDeAspas;

        continue;
      }

      /* Vírgula */

      if (caractere === "," && !dentroDeAspas) {
        linhaAtual.push(campoAtual);

        campoAtual = "";

        continue;
      }

      /* Quebra de linha */

      if ((caractere === "\n" || caractere === "\r") && !dentroDeAspas) {
        if (caractere === "\r" && proximo === "\n") {
          i++;
        }

        linhaAtual.push(campoAtual);

        linhas.push(linhaAtual);

        linhaAtual = [];

        campoAtual = "";

        continue;
      }

      campoAtual += caractere;
    }

    /*
     * Último campo / última linha
     */

    if (campoAtual !== "" || linhaAtual.length > 0) {
      linhaAtual.push(campoAtual);

      linhas.push(linhaAtual);
    }

    if (linhas.length < 2) {
      return [];
    }

    /* =========================================
       CABEÇALHOS
    ========================================= */

    const cabecalhos = linhas[0].map((coluna) => normalizar(coluna));

    /* =========================================
       REGISTROS
    ========================================= */

    return linhas
      .slice(1)
      .filter((valores) => valores.some((valor) => String(valor).trim() !== ""))
      .map((valores) => {
        const registro = {};

        cabecalhos.forEach((cabecalho, indice) => {
          registro[cabecalho] = String(valores[indice] || "").trim();
        });

        return registro;
      });
  }

  /* =========================================
     VERIFICAR DOCUMENTO ATIVO
  ========================================= */

  function documentoAtivo(documento) {
    /*
     * Se a coluna Ativo estiver vazia,
     * consideramos o documento ativo.
     *
     * Isso evita quebrar os registros
     * antigos durante a implantação.
     */

    const ativo = normalizar(documento.ativo || "");

    if (!ativo) {
      return true;
    }

    return (
      ativo === "sim" || ativo === "s" || ativo === "true" || ativo === "1"
    );
  }

  /* =========================================
     RENDERIZAR
  ========================================= */

  function renderizar(documentos) {
    if (!categoriaAtual) {
      mostrarEstadoInicial();
      return;
    }

    /* =========================================
     PROJETOS
     ========================================= */

    if (categoriaAtual === "Projetos") {
      if (!statusProjetoAtual) {
        if (tituloCategoria) {
          tituloCategoria.textContent = "Projetos";
        }

        if (anoDocumentos) {
          anoDocumentos.textContent = "";
        }

        mostrarDocumentos([]);

        return;
      }
      const projetosFiltrados = documentos.filter((documento) => {
        const ativo = documentoAtivo(documento);

        const mesmaSituacao =
          normalizar(documento.situacao) === normalizar(statusProjetoAtual);

        return ativo && mesmaSituacao;
      });

      if (tituloCategoria) {
        tituloCategoria.textContent = "Projetos";
      }

      if (anoDocumentos) {
        anoDocumentos.textContent = "";
      }

      mostrarDocumentos(projetosFiltrados);

      return;
    }

    /* =========================================
     DEMAIS CATEGORIAS
     ========================================= */

    atualizarFiltroAnos(documentos);

    const anoSelecionado = seletorAno ? seletorAno.value : "";

    const documentosFiltrados = documentos.filter((documento) => {
      const categoria = normalizar(documento.categoria);

      const mesmaCategoria = categoria === normalizar(categoriaAtual);

      const mesmoAno =
        String(documento.ano || "").trim() === String(anoSelecionado).trim();

      const ativo = documentoAtivo(documento);

      return mesmaCategoria && mesmoAno && ativo;
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

      const urlCSV = categoriaAtual === "Projetos" ? CSV_URL_PROJETOS : CSV_URL;

      const resposta = await fetch(urlCSV, {
        cache: "no-store",
      });

      if (!resposta.ok) {
        throw new Error("Erro HTTP: " + resposta.status);
      }

      const texto = await resposta.text();

      console.log("CSV recebido:", texto);

      const documentos = lerCSV(texto);

      documentosCarregados = documentos;

      console.log("Documentos encontrados:", documentos);

      renderizar(documentosCarregados);

      mostrarSucesso();
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

      if (projetosStatus) {
        projetosStatus.hidden = categoriaAtual !== "Projetos";
      }

      /* =================================
             REMOVER SELEÇÃO ANTERIOR
          ================================= */

      document.querySelectorAll(".transparencia-item").forEach((categoria) => {
        categoria.classList.remove("selecionado");

        categoria.setAttribute("aria-current", "false");
      });

      /* =================================
             MARCAR CATEGORIA ESCOLHIDA
          ================================= */

      item.classList.add("selecionado");

      item.setAttribute("aria-current", "true");

      /* =================================
             CARREGAR DOCUMENTOS
          ================================= */

      carregarPlanilha();

      /* =================================
             IR PARA DOCUMENTOS
          ================================= */

      if (grupoDocumentos) {
        grupoDocumentos.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  /* =========================================
     SUB-ABAS — PROJETOS
  ========================================= */

  botoesStatusProjeto.forEach((botao) => {
    botao.addEventListener("click", () => {
      statusProjetoAtual = botao.dataset.status;

      botoesStatusProjeto.forEach((item) => {
        item.classList.remove("ativo");
      });

      botao.classList.add("ativo");

      renderizar(documentosCarregados);
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

      renderizar(documentosCarregados);
    });
  }

  /* =========================================
     INICIAR
  ========================================= */

  mostrarEstadoInicial();

  /* =========================================
     ABRIR PROJETOS AUTOMATICAMENTE
     QUANDO VIER DA PÁGINA PROJETOS
  ========================================= */
  if (window.location.hash === "#projetos") {
    const itemProjetos = document.querySelector(
      '.transparencia-item[href="#projetos"]',
    );

    if (itemProjetos) {
      categoriaAtual = "Projetos";

      if (statusInicialURL) {
        statusProjetoAtual = statusInicialURL;
      }

      projetosStatus.hidden = false;

      botoesStatusProjeto.forEach((botao) => {
        botao.classList.toggle(
          "ativo",
          botao.dataset.status === statusProjetoAtual,
        );
      });

      itemProjetos.classList.add("selecionado");
      itemProjetos.setAttribute("aria-current", "true");

      carregarPlanilha();
    }
  }
});
