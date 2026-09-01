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

/* ==========================================
   HERO SLIDESHOW
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero-slide");
  const anterior = document.querySelector(".hero-anterior");
  const proximo = document.querySelector(".hero-proximo");
  const indicadores = document.querySelector(".hero-indicadores");
  const hero = document.querySelector(".hero");

  if (!slides.length || !anterior || !proximo || !indicadores || !hero) {
    return;
  }

  let slideAtual = 0;
  let intervalo;

  /* Criar indicadores */

  slides.forEach((slide, index) => {
    const indicador = document.createElement("button");

    indicador.type = "button";
    indicador.className = "hero-indicador";

    indicador.setAttribute("aria-label", `Mostrar imagem ${index + 1}`);

    indicador.addEventListener("click", () => {
      mostrarSlide(index);
      reiniciarIntervalo();
    });

    indicadores.appendChild(indicador);
  });

  const botoesIndicadores = document.querySelectorAll(".hero-indicador");

  /* Mostrar slide */

  function mostrarSlide(index) {
    slides.forEach((slide) => {
      slide.classList.remove("ativo");
    });

    botoesIndicadores.forEach((botao) => {
      botao.classList.remove("ativo");
    });

    const slideAtualElemento = slides[index];

    slideAtualElemento.classList.add("ativo");
    botoesIndicadores[index].classList.add("ativo");

    /* =====================================================
     ATUALIZA O FUNDO DESFOCADO
     USANDO A MESMA FOTO DO SLIDE ATUAL
  ===================================================== */

    const imagemAtual = slideAtualElemento.getAttribute("src");

    if (imagemAtual) {
      const areaImagem = document.querySelector(".hero-imagem");

      if (areaImagem) {
        areaImagem.style.backgroundImage = `url("${imagemAtual}")`;
      }
    }
    slideAtual = index;
  }

  /* Próximo */

  function proximoSlide() {
    const novoIndice = (slideAtual + 1) % slides.length;

    mostrarSlide(novoIndice);
  }

  /* Anterior */

  function slideAnterior() {
    const novoIndice = (slideAtual - 1 + slides.length) % slides.length;

    mostrarSlide(novoIndice);
  }

  /* Botões */

  proximo.addEventListener("click", () => {
    proximoSlide();
    reiniciarIntervalo();
  });

  anterior.addEventListener("click", () => {
    slideAnterior();
    reiniciarIntervalo();
  });

  /* Automático */

  function iniciarIntervalo() {
    intervalo = setInterval(() => {
      proximoSlide();
    }, 6000);
  }

  function reiniciarIntervalo() {
    clearInterval(intervalo);

    iniciarIntervalo();
  }

  /* Pausar quando o mouse estiver sobre o Hero */

  hero.addEventListener("mouseenter", () => {
    clearInterval(intervalo);
  });

  hero.addEventListener("mouseleave", () => {
    iniciarIntervalo();
  });

  /* Estado inicial */

  mostrarSlide(0);

  iniciarIntervalo();
});
