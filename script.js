var form = document.getElementById("contact-form");
if (form) {
  var status = document.getElementById("form-status");
  var submit = form.querySelector('[type="submit"]');

  var say = function (msg, ok) {
    if (status) {
      status.textContent = msg;
      status.className = "form__status " + (ok ? "is-ok" : "is-error");
    }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Дані вашого Telegram бота
    var botToken = "8638937449:AAHmgub0uMU0Tpo-PA0zNWBbtV-5crL_UVg";
    var chatId = "5816355651"; // Ваш Chat ID

    var data = new FormData(form);
    
    // Формування тексту повідомлення
    var text = "📩 Нова заявка з сайту D&H Web Studio!\n\n" +
      "👤 Ім'я: " + (data.get("name") || "Не вказано") + "\n" +
      "📧 Email: " + (data.get("email") || "Не вказано") + "\n" +
      "📞 Телефон: " + (data.get("phone") || "Не вказано") + "\n\n" +
      "💬 Повідомлення:\n" + (data.get("message") || "Без тексту");

    submit.disabled = true;

    // Відправка запиту в Telegram API
    fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    })
    .then(function (res) {
      if (!res.ok) {
        return res.json().then(function(err) { 
          console.error("Деталі помилки Telegram API:", err);
          throw new Error("Failed"); 
        });
      }
      form.reset();
      say("Vielen Dank! Wir melden uns in Kürze persönlich bei Ihnen.", true);
    })
    .catch(function () {
      say("Das Senden hat leider nicht geklappt. Bitte versuchen Sie es erneut.", false);
    })
    .then(function () { 
      submit.disabled = false; 
    });
  });
}
