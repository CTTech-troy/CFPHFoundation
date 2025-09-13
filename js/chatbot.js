// chatbot.js

(function () {
  const toggle = document.getElementById('chatbot-toggle');
  const win = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const minimizeBtn = document.getElementById('chatbot-minimize');
  const sendBtn = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const body = document.getElementById('chatbot-body');

  if (!toggle || !win || !input || !sendBtn || !body) {
    console.error("Chatbot: missing required DOM elements.");
    return;
  }

  // 📌 Custom responses (Knowledge Base)
  const RESPONSES = {
    "hello": "Hello 👋! How can I help you today?",
    "hi": "Hi there! 😊 What would you like to know about CFPHFoundation?",
    "who are you": "We are Celebrity Food Home Pantry Foundation (CFPHFoundation), based in Lagos, Nigeria, fighting hunger and building community.",
    "what is your mission": "Our mission is to alleviate hunger and malnutrition by providing food assistance to vulnerable individuals and families. :contentReference[oaicite:0]{index=0}",
    "vision": "Our vision is to create a world where everyone has access to nutritious food and the opportunity to thrive. :contentReference[oaicite:1]{index=1}",
    "programs": "We run programs like bi-weekly food distribution (every Thursday), community outreach and support for the needy, elderly, widows, etc. :contentReference[oaicite:2]{index=2}",
    "volunteer": "You can volunteer with us! We welcome volunteers to help in food distribution, community outreach, and other support programs. :contentReference[oaicite:3]{index=3}",
    "impact": "So far, we have provided food items on over 9,000 occasions to the needy, elderly, widows, and persons with special needs; we have distributed clothes to more than 200 children. :contentReference[oaicite:4]{index=4}",
    "address": "Our address is No 20 Olusanya Street, Jesugbami, Aboru, Lagos, Nigeria. :contentReference[oaicite:5]{index=5}",
    "contact": "You can reach us by phone at +234-808-400-9711 or email at celebrityfoodpantry@gmail.com. :contentReference[oaicite:6]{index=6}",
    "donate": "Thank you for your generosity. You can donate one-time or monthly. All donations help us reach more vulnerable people. :contentReference[oaicite:7]{index=7}",
    "events": "We run regular outreach and food distribution events, especially bi-weekly food distributions on Thursdays at our office. :contentReference[oaicite:8]{index=8}"
  };

  // 📌 Fallback message if no response found
  const FALLBACK = `I’m not sure about that.  
For more information call 📞 +234-808-400-9711  
or send us a mail at 📧 celebrityfoodpantry@gmail.com`;

  function botReply(inputText) {
    const lower = inputText.toLowerCase().trim();
    for (let key in RESPONSES) {
      // check if the user input contains the key as a word (or closely matches)
      // Using indexOf so that "what are your programs?" matches "programs"
      if (lower.includes(key)) {
        return RESPONSES[key];
      }
    }
    return FALLBACK;
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

  function sendMessage() {
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

    // simulate delay
    setTimeout(() => {
      typingMsg.remove();
      const reply = botReply(text);
      appendMessage(reply, "bot");
    }, 500);
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
    setTimeout(() => input.focus(), 220);
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

  document.addEventListener("click", (e) => {
    if (
      !win.contains(e.target) &&
      !toggle.contains(e.target) &&
      win.classList.contains("open")
    ) {
      closeChat();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && win.classList.contains("open")) closeChat();
  });

  window.addEventListener("load", () => {
    // optional entrance animation
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
