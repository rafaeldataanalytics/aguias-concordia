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
}

/* =========================================================
   CARROSSEL — EMPRESAS PARCEIRAS
========================================================= */

const listaParceiros = document.querySelector(".parceiros__lista");
const indicadoresParceiros = document.querySelectorAll(".indicador");
const primeiroLogo = document.querySelector(".parceiro-logo");

let slideParceiroAtual = 0;

function mostrarSlideParceiro(numero) {
  if (!listaParceiros || !primeiroLogo || indicadoresParceiros.length === 0) {
    return;
  }

  slideParceiroAtual = numero;

  const larguraLogo = primeiroLogo.offsetWidth;

  const estilos = getComputedStyle(listaParceiros);

  const gap = parseFloat(estilos.gap) || 0;

  const deslocamento = slideParceiroAtual * (larguraLogo + gap);

  listaParceiros.style.transform = `translateX(-${deslocamento}px)`;

  indicadoresParceiros.forEach((indicador, indice) => {
    indicador.classList.toggle("ativo", indice === slideParceiroAtual);
  });
}

indicadoresParceiros.forEach((indicador) => {
  indicador.addEventListener("click", () => {
    const slide = Number(indicador.dataset.slide);

    mostrarSlideParceiro(slide);
  });
});

if (indicadoresParceiros.length > 1) {
  setInterval(() => {
    slideParceiroAtual++;

    if (slideParceiroAtual >= indicadoresParceiros.length) {
      slideParceiroAtual = 0;
    }

    mostrarSlideParceiro(slideParceiroAtual);
  }, 5000);
}

/* =========================================================
   HERO SLIDESHOW
========================================================= */

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

    indicador.setAttribute("aria-pressed", index === 0 ? "true" : "false");

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

      botao.setAttribute("aria-pressed", "false");
    });

    const slideAtualElemento = slides[index];

    slideAtualElemento.classList.add("ativo");

    botoesIndicadores[index].classList.add("ativo");

    botoesIndicadores[index].setAttribute("aria-pressed", "true");

    /* Atualiza o fundo */

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

  /* Botão próximo */

  proximo.addEventListener("click", () => {
    proximoSlide();

    reiniciarIntervalo();
  });

  /* Botão anterior */

  anterior.addEventListener("click", () => {
    slideAnterior();

    reiniciarIntervalo();
  });

  /* Movimento automático */

  function iniciarIntervalo() {
    intervalo = setInterval(() => {
      proximoSlide();
    }, 6000);
  }

  function reiniciarIntervalo() {
    clearInterval(intervalo);

    iniciarIntervalo();
  }

  /* Pausar ao passar o mouse */

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

/* =========================================================
   ACESSIBILIDADE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const botaoDiminuir = document.getElementById("diminuir-fonte");

  const botaoAumentar = document.getElementById("aumentar-fonte");

  const botaoContraste = document.getElementById("alto-contraste");

  const botaoLinks = document.getElementById("destacar-links");

  const botaoAbrir = document.getElementById("abrir-acessibilidade");

  const painel = document.getElementById("painel-acessibilidade");

  const botaoRestaurar = document.getElementById("restaurar-acessibilidade");

  const botaoAnimacoes = document.getElementById("reduzir-animacoes");

  const botaoEspacamento = document.getElementById("aumentar-espacamento");

  const botaoCursor = document.getElementById("aumentar-cursor");

  const botaoCoresInvertidas = document.getElementById("cores-invertidas");

  /* =======================================================
     ESTADO
  ======================================================= */

  const preferenciasSalvas = JSON.parse(
    localStorage.getItem("acessibilidadeAguias") || "{}",
  );

  let tamanhoFonte = preferenciasSalvas.tamanhoFonte || 100;

  let contrasteAtivo = preferenciasSalvas.contraste || false;

  let linksDestacados = preferenciasSalvas.links || false;

  let animacoesReduzidas = preferenciasSalvas.animacoes || false;

  let espacamentoAtivo = preferenciasSalvas.espacamento || false;

  let cursorMaior = preferenciasSalvas.cursor || false;

  let coresInvertidas = preferenciasSalvas.invertidas || false;

  /* =======================================================
     SALVAR PREFERÊNCIAS
  ======================================================= */

  function salvarPreferencias() {
    localStorage.setItem(
      "acessibilidadeAguias",
      JSON.stringify({
        tamanhoFonte,
        contraste: contrasteAtivo,
        links: linksDestacados,
        animacoes: animacoesReduzidas,
        espacamento: espacamentoAtivo,
        cursor: cursorMaior,
        invertidas: coresInvertidas,
      }),
    );
  }

  /* =======================================================
     APLICAR PREFERÊNCIAS
  ======================================================= */

  function aplicarPreferencias() {
    document.body.classList.toggle("alto-contraste-ativo", contrasteAtivo);

    document.body.classList.toggle("links-destacados", linksDestacados);

    document.body.classList.toggle("reduzir-animacoes", animacoesReduzidas);

    document.body.classList.toggle("espacamento-aumentado", espacamentoAtivo);

    document.body.classList.toggle("cursor-maior", cursorMaior);

    document.body.classList.toggle("cores-invertidas", coresInvertidas);

    document.documentElement.style.setProperty(
      "--escala-fonte",
      tamanhoFonte / 100,
    );

    if (botaoContraste) {
      botaoContraste.setAttribute("aria-pressed", String(contrasteAtivo));
    }

    if (botaoLinks) {
      botaoLinks.setAttribute("aria-pressed", String(linksDestacados));
    }

    if (botaoAnimacoes) {
      botaoAnimacoes.setAttribute("aria-pressed", String(animacoesReduzidas));
    }

    if (botaoEspacamento) {
      botaoEspacamento.setAttribute("aria-pressed", String(espacamentoAtivo));
    }

    if (botaoCursor) {
      botaoCursor.setAttribute("aria-pressed", String(cursorMaior));
    }

    if (botaoCoresInvertidas) {
      botaoCoresInvertidas.setAttribute(
        "aria-pressed",
        String(coresInvertidas),
      );
    }
  }

  /* =======================================================
     AUMENTAR FONTE
  ======================================================= */

  if (botaoAumentar) {
    botaoAumentar.addEventListener("click", () => {
      if (tamanhoFonte < 140) {
        tamanhoFonte += 10;

        aplicarPreferencias();

        salvarPreferencias();
      }
    });
  }

  /* =======================================================
     DIMINUIR FONTE
  ======================================================= */

  if (botaoDiminuir) {
    botaoDiminuir.addEventListener("click", () => {
      if (tamanhoFonte > 80) {
        tamanhoFonte -= 10;

        aplicarPreferencias();

        salvarPreferencias();
      }
    });
  }

  /* =======================================================
     ALTO CONTRASTE
  ======================================================= */

  if (botaoContraste) {
    botaoContraste.addEventListener("click", () => {
      contrasteAtivo = !contrasteAtivo;

      aplicarPreferencias();

      salvarPreferencias();
    });
  }

  /* =======================================================
     DESTACAR LINKS
  ======================================================= */

  if (botaoLinks) {
    botaoLinks.addEventListener("click", () => {
      linksDestacados = !linksDestacados;

      aplicarPreferencias();

      salvarPreferencias();
    });
  }

  /* =======================================================
     REDUZIR ANIMAÇÕES
  ======================================================= */

  if (botaoAnimacoes) {
    botaoAnimacoes.addEventListener("click", () => {
      animacoesReduzidas = !animacoesReduzidas;

      aplicarPreferencias();

      salvarPreferencias();
    });
  }

  /* =======================================================
     AUMENTAR ESPAÇAMENTO
  ======================================================= */

  if (botaoEspacamento) {
    botaoEspacamento.addEventListener("click", () => {
      espacamentoAtivo = !espacamentoAtivo;

      aplicarPreferencias();

      salvarPreferencias();
    });
  }

  /* =======================================================
     CURSOR MAIOR
  ======================================================= */

  if (botaoCursor) {
    botaoCursor.addEventListener("click", () => {
      cursorMaior = !cursorMaior;

      aplicarPreferencias();

      salvarPreferencias();
    });
  }

  /* =======================================================
   CORES INVERTIDAS
======================================================= */

  if (botaoCoresInvertidas) {
    botaoCoresInvertidas.addEventListener("click", () => {
      coresInvertidas = !coresInvertidas;

      aplicarPreferencias();

      salvarPreferencias();
    });
  }

  /* =======================================================
     ABRIR / FECHAR PAINEL
  ======================================================= */

  if (botaoAbrir && painel) {
    botaoAbrir.addEventListener("click", () => {
      const painelAberto = !painel.hasAttribute("hidden");

      if (painelAberto) {
        painel.setAttribute("hidden", "");

        botaoAbrir.setAttribute("aria-expanded", "false");
      } else {
        painel.removeAttribute("hidden");

        botaoAbrir.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* =======================================================
     RESTAURAR PADRÃO
  ======================================================= */

  if (botaoRestaurar) {
    botaoRestaurar.addEventListener("click", () => {
      tamanhoFonte = 100;

      contrasteAtivo = false;

      linksDestacados = false;

      animacoesReduzidas = false;

      espacamentoAtivo = false;

      cursorMaior = false;

      coresInvertidas = false;

      aplicarPreferencias();

      salvarPreferencias();
    });
  }

  /* =======================================================
     APLICAR AO CARREGAR A PÁGINA
  ======================================================= */

  aplicarPreferencias();
});
