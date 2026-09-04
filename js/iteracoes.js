/* =========================================================
   ÁGUIAS DE CONCÓRDIA
   INTERAÇÕES — GOOGLE SHEETS
   LEITURA DE CURTIDAS E VISUALIZAÇÕES
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     GOOGLE SHEETS — INTERAÇÕES
  ========================================================= */

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/" +
    "2PACX-1vTmOu4NYHC7VKHJHCcnyoLmPywh4v2q31C6JP8KmV10yjL8ZLKBzmzck-DJNcUot5wzAAYKxoTsnP9C" +
    "/pub?gid=1520147203&single=true&output=csv";

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

    /* Última linha */

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
     CARREGAR INTERAÇÕES
  ========================================================= */

  async function carregarInteracoes() {
    try {
      console.log("Consultando Google Sheets — Interações...");

      const resposta = await fetch(CSV_URL, {
        cache: "no-store",
      });

      if (!resposta.ok) {
        throw new Error("Erro HTTP: " + resposta.status);
      }

      const texto = await resposta.text();

      console.log("CSV de interações recebido:", texto);

      const registros = lerCSV(texto);

      console.log("Interações encontradas:", registros);

      const interacoes = registros.map((registro) => {
        return {
          idNoticia: registro.id_noticia || "",

          curtidas: Number(registro.curtidas) || 0,

          visualizacoes: Number(registro.visualizacoes) || 0,
        };
      });

      console.log("Interações processadas:", interacoes);

      window.interacoesPorNoticia = {};

      interacoes.forEach((interacao) => {
        window.interacoesPorNoticia[interacao.idNoticia] = {
          curtidas: interacao.curtidas,
          visualizacoes: interacao.visualizacoes,
        };
      });

      document.dispatchEvent(new CustomEvent("interacoesCarregadas"));
    } catch (erro) {
      console.error("Erro ao carregar interações:", erro);
    }
  }

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  carregarInteracoes();
});
