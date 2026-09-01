// ===============================
// DADOS DOS PARCEIROS
// ===============================

const parceiros = [
  {
    nome: "Lojas Havan",
    imagem: "assets/parceiros_havan.jpeg",
    tipo: "Patrocinador",
  },
  {
    nome: "Coopercarga",
    imagem: "assets/parceiros_coopercarga.png",
    tipo: "Patrocinador",
  },
  {
    nome: "Dicave Volvo",
    imagem: "assets/parceiros_dicave.jpg",
    tipo: "Patrocinador",
  },
  {
    nome: "Gelnex",
    imagem: "assets/parceiros_gelnex.jpg",
    tipo: "Patrocinador",
  },
  {
    nome: "Coperdia",
    imagem: "assets/parceiros_coperdia.jpg",
    tipo: "Patrocinador",
  },
  {
    nome: "Sicoob",
    imagem: "assets/parceiros_sicoob.jpeg",
    tipo: "Patrocinador",
  },
  {
    nome: "Unimed Concórdia",
    imagem: "assets/parceiros_unimed.jpeg",
    tipo: "Patrocinador",
  },
  {
    nome: "Celesc",
    imagem: "assets/parceiros_celesc.jpg",
    tipo: "Patrocinador",
  },
];

// ===============================
// CRIAÇÃO DO CARD
// ===============================

function criarCardParceiro(parceiro) {
  return `
    <a class="parceiro-card"
       href="#"
       aria-label="${parceiro.tipo}: ${parceiro.nome}">

      <img
        src="${parceiro.imagem}"
        alt="Logo ${parceiro.nome}"
      >

    </a>
  `;
}

// ===============================
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
      .filter((parceiro) => parceiro.tipo === "Patrocinador")
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
        return `
          <div class="parceiro-logo">
            <img
              src="${parceiro.imagem}"
              alt="Empresa parceira ${parceiro.nome}"
            >
          </div>
        `;
      })
      .join("");
  }
}

// Empresas Parceiras

//if (listaParceiros) {

//  listaParceiros.innerHTML = "";

//}

// ===============================
// INICIALIZAÇÃO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  renderizarParceiros();
});
