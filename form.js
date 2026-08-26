document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const botao = form.querySelector("button");
    botao.disabled = true;
    botao.innerText = "Enviando...";

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      const resultado = await response.text();

      if (response.ok) {
        form.reset();
        form.classList.add("sucesso");
        mostrarMensagem("Mensagem enviada com sucesso ✅", "sucesso");
      } else {
        mostrarMensagem(resultado || "Erro ao enviar mensagem ❌", "erro");
      }
    } catch (error) {
      mostrarMensagem("Falha de conexão. Tente novamente.", "erro");
    } finally {
      botao.disabled = false;
      botao.innerText = "Enviar Mensagem";

      setTimeout(() => {
        form.classList.remove("sucesso");
      }, 1500);
    }
  });
});

/* ==========================
   FEEDBACK VISUAL
========================== */
function mostrarMensagem(texto, tipo) {
  let msg = document.querySelector(".msg-form");

  if (!msg) {
    msg = document.createElement("div");
    msg.className = "msg-form";
    document.getElementById("form").appendChild(msg);
  }

  msg.innerText = texto;
  msg.classList.remove("erro", "sucesso");
  msg.classList.add(tipo);

  setTimeout(() => {
    msg.remove();
  }, 4000);
}
