// simple client-side chatbot UI with Hugging Face AI responses
(function () {
  const toggle = document.getElementById('chatbot-toggle');
  const win = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const minimizeBtn = document.getElementById('chatbot-minimize');
  const sendBtn = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const body = document.getElementById('chatbot-body');

  if (!toggle || !win) return;

  // 🏢 CFPh Foundation Info (Knowledge Base)
  const COMPANY_INFO = `
  We are Celebrity Food Pantry Foundation (CFPh Foundation), a non-profit organisation in Lagos, Nigeria.
  Our mission is fighting hunger and building community by providing food to those in need.
  Address: No 20 Olusanya Street, Jesugbami, Aboru, Lagos, Nigeria.
  Contact: Phone +234-808-400-9711 | Email celebrityfoodpantry@gmail.com
  We accept donations, welcome volunteers, and host community events.
  Our motto is "Bringing hope to the table, where generosity meets community."
  `;

  // 🔑 Hugging Face API setup
  const HF_API_KEY = "YOUR_HF_API_KEY"; // replace with your Hugging Face token
  const MODEL = "google/flan-t5-small"; // small free model

  async function botReply(inputText) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${MODEL}`,
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: `Company Info: ${COMPANY_INFO}\nUser Question: ${inputText}\nAnswer:`,
            parameters: { max_new_tokens: 200 },
          }),
        }
      );

      const result = await response.json();

      // Hugging Face text output differs by model
      let reply =
        result[0]?.generated_text ||
        result.generated_text ||
        result[0]?.summary_text;

      if (!reply || reply.length < 10) {
        reply = `I’m not fully sure about that. 
Please reach out directly:
📞 +234-808-400-9711  
📧 celebrityfoodpantry@gmail.com`;
      }

      return reply.trim();
    } catch (err) {
      console.error("Bot error:", err);
      return "Oops, something went wrong. Please try again.";
    }
  }

  function appendMessage(text, who = "bot") {
    const msg = document.createElement("div");
    msg.className = `msg ${who}`;
    const bubble = document.createElement("div");
    bubble.className = `bubble ${who}`;
    bubble.textContent = text;
    msg.appendChild(bubble);
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, "user");
    input.value = "";

    // Typing indicator
    const typingMsg = document.createElement("div");
    typingMsg.className = `msg bot`;
    const bubble = document.createElement("div");
    bubble.className = `bubble bot`;
    bubble.textContent = "…";
    typingMsg.appendChild(bubble);
    body.appendChild(typingMsg);
    body.scrollTop = body.scrollHeight;

    // Get AI reply
    const reply = await botReply(text);

    // Remove typing
    typingMsg.remove();

    // Show response
    appendMessage(reply, "bot");
  }

  // keyboard submit
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);
  toggle.addEventListener("click", toggleChat);
  closeBtn && closeBtn.addEventListener("click", closeChat);
  minimizeBtn && minimizeBtn.addEventListener("click", closeChat);

  function openChat() {
    win.classList.add("open");
    win.setAttribute("aria-hidden", "false");
    setTimeout(() => input && input.focus(), 220);
  }
  function closeChat() {
    win.classList.remove("open");
    win.setAttribute("aria-hidden", "true");
    toggle.focus();
  }
  function toggleChat() {
    if (win.classList.contains("open")) closeChat();
    else openChat();
  }

  // close on outside click
  document.addEventListener("click", (e) => {
    if (
      !win.contains(e.target) &&
      !toggle.contains(e.target) &&
      win.classList.contains("open")
    ) {
      closeChat();
    }
  });

  // escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && win.classList.contains("open")) closeChat();
  });

  // entrance animation
  window.addEventListener("load", () => {
    toggle.style.transform = "translateY(12px) scale(.98)";
    toggle.style.opacity = "0";
    toggle.style.transition =
      "transform .6s cubic-bezier(.2,.9,.2,1), opacity .5s";
    requestAnimationFrame(() => {
      toggle.style.transform = "";
      toggle.style.opacity = "1";
    });
  });
})();
