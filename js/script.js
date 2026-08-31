/* =========================================================
   MENU MOBILE
========================================================= */

const botaoMenu = document.getElementById("botao-menu");
const menuPrincipal = document.getElementById("menu-principal");

if (botaoMenu && menuPrincipal) {
  botaoMenu.addEventListener("click", () => {
    const menuAberto = menuPrincipal.classList.toggle("aberto");

    botaoMenu.setAttribute("aria-expanded", String(menuAberto));

    botaoMenu.setAttribute(
      "aria-label",
      menuAberto ? "Fechar menu principal" : "Abrir menu principal",
    );
  });

  /* =========================================================
   CARROSSEL — EMPRESAS PARCEIRAS
========================================================= */

  const listaParceiros = document.querySelector(".parceiros__lista");

  const indicadores = document.querySelectorAll(".indicador");

  const primeiroLogo = document.querySelector(".parceiro-logo");

  let slideAtual = 0;

  /* =========================================================
   MOSTRAR SLIDE
========================================================= */

  function mostrarSlide(numero) {
    if (!listaParceiros || !primeiroLogo || indicadores.length === 0) {
      return;
    }

    slideAtual = numero;

    const larguraLogo = primeiroLogo.offsetWidth;

    const estilos = getComputedStyle(listaParceiros);

    const gap = parseFloat(estilos.gap) || 0;

    const deslocamento = slideAtual * (larguraLogo + gap);

    listaParceiros.style.transform = `translateX(-${deslocamento}px)`;

    indicadores.forEach((indicador, indice) => {
      indicador.classList.toggle("ativo", indice === slideAtual);
    });
  }

  /* =========================================================
   CLIQUE NOS INDICADORES
========================================================= */

  indicadores.forEach((indicador) => {
    indicador.addEventListener("click", () => {
      const slide = Number(indicador.dataset.slide);

      mostrarSlide(slide);
    });
  });

  /* =========================================================
   MOVIMENTO AUTOMÁTICO
========================================================= */

  if (indicadores.length > 1) {
    setInterval(() => {
      slideAtual++;

      if (slideAtual >= indicadores.length) {
        slideAtual = 0;
      }

      mostrarSlide(slideAtual);
    }, 5000);
  }
}
