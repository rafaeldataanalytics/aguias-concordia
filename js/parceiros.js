// ===============================
// CONFIGURAÇÃO GOOGLE SHEETS
// ===============================

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/" +
  "2PACX-1vTmOu4NYHC7VKHJHCcnyoLmPywh4v2q31C6JP8KmV10yjL8ZLKBzmzck-DJNcUot5wzAAYKxoTsnP9C" +
  "/pub?gid=384899737&single=true&output=csv";

// ===============================
// VARIÁVEL DOS PARCEIROS
// ===============================

let parceiros = [];

// ===============================
// NORMALIZAÇÃO
// ===============================

function normalizar(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ===============================
// CONVERTER LINK DO GOOGLE DRIVE
// ===============================

function converterImagemDrive(url) {
  if (!url) return "";

  const match = url.match(/\/d\/([^/]+)/);

  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
  }

  return url;
}

// ===============================
// ESCAPAR HTML
// ===============================

function escaparHTML(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===============================
// LEITURA DO CSV
// ===============================

function lerCSV(texto) {
  const linhas = texto.split(/\r?\n/).filter((linha) => linha.trim() !== "");

  if (linhas.length === 0) {
    return [];
  }

  function separarLinha(linha) {
    const resultado = [];
    let campo = "";
    let dentroAspas = false;

    for (let i = 0; i < linha.length; i++) {
      const caractere = linha[i];

      if (caractere === '"') {
        if (dentroAspas && linha[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          dentroAspas = !dentroAspas;
        }
      } else if (caractere === "," && !dentroAspas) {
        resultado.push(campo.trim());
        campo = "";
      } else {
        campo += caractere;
      }
    }

    resultado.push(campo.trim());

    return resultado;
  }

  const cabecalhos = separarLinha(linhas[0]).map(normalizar);

  return linhas.slice(1).map((linha) => {
    const valores = separarLinha(linha);
    const objeto = {};

    cabecalhos.forEach((cabecalho, indice) => {
      objeto[cabecalho] = valores[indice] || "";
    });

    return objeto;
  });
}

// ===============================
// CRIAÇÃO DO CARD
// ===============================

function criarCardParceiro(parceiro) {
  const nome = escaparHTML(parceiro.nome);
  const imagem = escaparHTML(converterImagemDrive(parceiro.imagem));
  const tipo = escaparHTML(parceiro.tipo);

  const link = parceiro.link ? escaparHTML(parceiro.link) : "#";

  return `
    <a
      class="parceiro-card"
      href="${link}"
      ${link === "#" ? 'onclick="return false;"' : ""}
      aria-label="${tipo}: ${nome}"
    >
      <img
        src="${imagem}"
        alt="Logo ${nome}"
      >
    </a>
  `;
}

// ===============================
// CARROSSEL — HOME
// ===============================

function inicializarCarrosselParceiros() {
  const lista = document.getElementById("lista-parceiros-home");

  if (!lista) {
    return;
  }

  const logos = lista.querySelectorAll(".parceiro-logo");

  if (logos.length === 0) {
    return;
  }

  // Como a lista foi duplicada,
  // metade representa a sequência original.
  const quantidadeOriginal = logos.length / 2;

  let slideAtual = 0;
  let intervaloCarrossel;

  function moverCarrossel() {
    const primeiroLogo = lista.querySelector(".parceiro-logo");

    if (!primeiroLogo) {
      return;
    }

    const estilos = getComputedStyle(lista);
    const gap = parseFloat(estilos.gap) || 0;

    const larguraLogo = primeiroLogo.getBoundingClientRect().width;

    const deslocamento = slideAtual * (larguraLogo + gap);

    lista.style.transform = `translateX(-${deslocamento}px)`;
  }

  function proximoSlide() {
    slideAtual++;

    // Chegou ao final da primeira sequência.
    // Como a sequência foi duplicada, voltamos
    // para o início sem perder os logos.
    if (slideAtual >= quantidadeOriginal) {
      lista.style.transition = "none";

      slideAtual = 0;

      moverCarrossel();

      // Força o navegador a aplicar o reset
      // antes de reativar a transição.
      lista.offsetWidth;

      lista.style.transition = "transform 0.6s ease";

      return;
    }

    lista.style.transition = "transform 0.6s ease";

    moverCarrossel();
  }

  function iniciarCarrossel() {
    clearInterval(intervaloCarrossel);

    intervaloCarrossel = setInterval(() => {
      proximoSlide();
    }, 500);
  }

  // Posição inicial
  lista.style.transition = "none";
  slideAtual = 0;
  moverCarrossel();

  // Inicia somente depois que os logos
  // já foram criados pelo Google Sheets.
  iniciarCarrossel();

  // Recalcula a posição quando a tela muda
  window.addEventListener("resize", () => {
    lista.style.transition = "none";
    moverCarrossel();

    requestAnimationFrame(() => {
      lista.style.transition = "transform 0.6s ease";
    });
  });
}

// ===============================
// RENDERIZAÇÃO
// ===============================

function renderizarParceiros() {
  const listaPatrocinadores = document.getElementById("lista-patrocinadores");

  const listaParceiros = document.getElementById("lista-parceiros");

  const listaParceirosHome = document.getElementById("lista-parceiros-home");

  // ===============================
  // PATROCINADORES
  // ===============================

  if (listaPatrocinadores) {
    listaPatrocinadores.innerHTML = parceiros
      .filter((parceiro) => normalizar(parceiro.tipo) === "patrocinador")
      .map(criarCardParceiro)
      .join("");
  }

  // ===============================
  // EMPRESAS PARCEIRAS
  // ===============================

  if (listaParceiros) {
    listaParceiros.innerHTML = parceiros.map(criarCardParceiro).join("");
  }

  // ===============================
  // HOME — CARROSSEL
  // ===============================

  if (listaParceirosHome) {
    const htmlParceiros = parceiros
      .map((parceiro) => {
        const nome = escaparHTML(parceiro.nome);

        const imagem = escaparHTML(converterImagemDrive(parceiro.imagem));

        return `
          <div class="parceiro-logo">
            <img
              src="${imagem}"
              alt="Empresa parceira ${nome}"
            >
          </div>
        `;
      })
      .join("");

    // Duplica a sequência para permitir
    // o movimento contínuo do carrossel.
    listaParceirosHome.innerHTML = htmlParceiros + htmlParceiros;

    // IMPORTANTE:
    // O carrossel só é iniciado depois
    // que os logos foram criados.
    inicializarCarrosselParceiros();
  }
}

// ===============================
// CARREGAR PARCEIROS
// ===============================

async function carregarParceiros() {
  try {
    const resposta = await fetch(CSV_URL + "&cache=" + Date.now());

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const textoCSV = await resposta.text();

    const dados = lerCSV(textoCSV);

    // ===============================
    // FILTRAR ATIVOS
    // ===============================

    parceiros = dados
      .filter((parceiro) => normalizar(parceiro.ativo) === "sim")
      .map((parceiro) => ({
        nome: parceiro.nome || "",
        imagem: parceiro.imagem || "",
        tipo: parceiro.tipo || "Parceiro",
        link: parceiro.link || "",
      }));

    // ===============================
    // RENDERIZAR
    // ===============================

    renderizarParceiros();
  } catch (erro) {
    console.error("Erro ao carregar parceiros:", erro);
  }
}

// ===============================
// INICIALIZAÇÃO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  carregarParceiros();
});
