/* script.js
   Frontend logic: renders messages, posts to backend, shows typing indicator.
   Change BACKEND_URL to:
     - 'backend.php' for PHP (when served by php -S)
     - 'http://localhost:3000/chat' for Node
     - 'http://localhost:5000/chat' for Python
*/

const BACKEND_URL = "http://localhost:3000/chat"; // <<-- change this per backend
const chatbox = document.getElementById("chatbox");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const inputForm = document.getElementById("inputForm");

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

function createMessage(text, who = "bot", smallLabel = "") {
    const placeholder = document.getElementById("placeholder");
    if (placeholder) {
        placeholder.remove();
    }

    const row = document.createElement("div");
    row.className = "msg-row";

    const bubble = document.createElement("div");
    bubble.className = `msg ${who}`;

    if (who === "user") {
        bubble.textContent = text;
        row.appendChild(bubble);
    } else {
        // bot: render markdown
        // Configure marked to break on single newlines if desired, but default is usually fine for AI
        bubble.innerHTML = marked.parse(text);

        // bot on left with optional small label
        const container = document.createElement("div");
        if (smallLabel) {
            const label = document.createElement("div");
            label.className = "label";
            label.textContent = smallLabel;
            container.appendChild(label);
        }
        container.appendChild(bubble);
        row.appendChild(container);
    }

    chatbox.appendChild(row);
    chatbox.scrollTop = chatbox.scrollHeight;
    return bubble;
}

let typingEl = null;
function showTyping() {
    typingEl = document.createElement("div");
    typingEl.className = "typing";
    typingEl.textContent = "ChatDPT is thinking...";
    const row = document.createElement("div");
    row.className = "msg-row";
    const wrapper = document.createElement("div");
    wrapper.appendChild(typingEl);
    row.appendChild(wrapper);
    chatbox.appendChild(row);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function removeTyping() {
    if (!typingEl) return;
    typingEl.remove();
    typingEl = null;
}

async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    createMessage(text, "user");
    showTyping();

    try {
        const res = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
        }
        const data = await res.json();

        let reply = "";

        // common pattern when using Chat Completions API:
        if (data?.choices?.[0]?.message?.content) {
            reply = data.choices[0].message.content;
        } else if (data?.reply) {
            reply = data.reply;
        } else {
            reply = JSON.stringify(data).slice(0, 1000); // fallback
        }

        removeTyping();
        createMessage(reply, "bot");
    } catch (err) {
        removeTyping();
        createMessage("Error: " + err.message, "bot");
        console.error(err);
    }
}
