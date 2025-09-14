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

  // Organization identity
  "who are you": "We are Celebrity Food Home Pantry Foundation (CFPHFoundation), based in Lagos, Nigeria, fighting hunger and building community.",
  "what do you do": "We provide food assistance, run community outreach programs, and support vulnerable groups including the elderly, widows, and persons with special needs.",
  "when were you founded": "We officially began our operations in 2023 and have been consistent in our service since then.",
  
  // Mission & Vision
  "what is your mission": "Our mission is to alleviate hunger and malnutrition by providing food assistance to vulnerable individuals and families.",
  "vision": "Our vision is to create a world where everyone has access to nutritious food and the opportunity to thrive.",
  "values": "We are guided by values of compassion, service, accountability, and community support.",

  // Programs & Services
  "programs": "We run programs like bi-weekly food distribution (every Thursday), community outreach, and support for the needy, elderly, widows, and orphans.",
  "how often do you distribute food": "We distribute food bi-weekly, every Thursday, to support the community.",
  "who can benefit": "Our services are open to vulnerable individuals and families in need, including widows, the elderly, and children.",
  
  // Involvement
  "volunteer": "You can volunteer with us! We welcome volunteers to help in food distribution, community outreach, and other support programs.",
  "how to partner": "We welcome partnerships with individuals, NGOs, and businesses that share our mission of fighting hunger.",
  "donate": "Thank you for your generosity. You can donate one-time or monthly. All donations help us reach more vulnerable people.",

  // Impact & Transparency
  "impact": "So far, we have provided food items on over 9,000 occasions to the needy, elderly, widows, and persons with special needs; we have distributed clothes to more than 200 children.",
  "how do you measure impact": "We track the number of meals distributed, people reached, and communities supported, and share regular updates with donors and partners.",
  "how are donations used": "All donations go directly into food purchase, logistics for outreach, and supporting our community programs.",

  // Contact & Logistics
  "address": "Our address is No 20 Olusanya Street, Jesugbami, Aboru, Lagos, Nigeria.",
  "contact": "You can reach us by phone at +234-808-400-9711 or email at celebrityfoodpantry@gmail.com.",
  "events": "We run regular outreach and food distribution events, especially bi-weekly food distributions on Thursdays at our office.",
  "social media": "You can follow us on Facebook, Instagram, and Twitter at @CFPHFoundation for updates."
};


  // 📌 Fallback message if no response found
  const FALLBACK = `Hello! We are Celebrity Food Home Pantry Foundation (CFPHFoundation), based in Lagos, Nigeria, fighting hunger and building community.
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

    // simulate human-like typing delay based on reply length + small randomness
    const reply = botReply(text);
    const minDelay = 600;       // minimum typing time (ms)
    const perChar = 50;         // ms per character of reply
    const maxDelay = 3000;      // cap typing time (ms)
    let delay = Math.min(maxDelay, minDelay + Math.max(0, reply.length) * perChar);
    delay = Math.round(delay + (Math.random() * 300)); // small jitter to feel natural

    // animate typing dots while waiting
    let dots = 1;
    const typingInterval = setInterval(() => {
      bubble.textContent = '.'.repeat(dots);
      dots = dots >= 3 ? 1 : dots + 1;
      body.scrollTop = body.scrollHeight;
    }, 350);

    setTimeout(() => {
      clearInterval(typingInterval);
      typingMsg.remove();
      appendMessage(reply, "bot");
    }, delay);
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
