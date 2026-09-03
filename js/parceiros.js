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
        loading="lazy"
      >

    </a>
  `;
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
  // HOME — 4 PARCEIROS
  // ===============================

  if (listaParceirosHome) {
    listaParceirosHome.innerHTML = parceiros
      .slice(0, 4)
      .map((parceiro) => {
        const nome = escaparHTML(parceiro.nome);
        const imagem = escaparHTML(parceiro.imagem);

        return `
          <div class="parceiro-logo">

            <img
              src="${imagem}"
              alt="Empresa parceira ${nome}"
              loading="lazy"
            >

          </div>
        `;
      })
      .join("");
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
