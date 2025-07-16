const el = {
  id: document.getElementById("idInstanceInput"),
  token: document.getElementById("apiTokenInput"),
  msgChatId: document.getElementById("msgChatIdInput"),
  fileChatId: document.getElementById("fileChatIdInput"),
  message: document.getElementById("messageInput"),
  fileUrl: document.getElementById("fileUrlInput"),
  output: document.getElementById("output"),
  copyBtn: document.getElementById("copyBtn"),
  getSettingsBtn: document.getElementById("getSettingsBtn"),
  getStateBtn: document.getElementById("getStateBtn"),
  sendMsgBtn: document.getElementById("sendMsgBtn"),
  sendFileBtn: document.getElementById("sendFileBtn")
};

function normalizeChatId(chatId) {
  return /^\d+$/.test(chatId) ? `${chatId}@c.us` : chatId;
}

async function fetchAndShow(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    el.output.innerHTML = syntaxHighlight(data);
  } catch (err) {
    el.output.textContent = `Error: ${err.message}`;
  }
}

function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|\/\/.*)/g,
    match => {
      let cls = 'number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'key' : 'string';
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      } else if (/^\/\//.test(match)) {
        cls = 'comment';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function getSettings(id, token) {
  const url = `https://api.green-api.com/waInstance${id}/getSettings/${token}`;
  return fetchAndShow(url);
}

function getStateInstance(id, token) {
  const url = `https://api.green-api.com/waInstance${id}/getStateInstance/${token}`;
  return fetchAndShow(url);
}

function sendMessage(id, token, chatId, message) {
  const url = `https://api.green-api.com/waInstance${id}/sendMessage/${token}`;
  return fetchAndShow(url, {
    method: "POST",
    body: JSON.stringify({
      chatId: normalizeChatId(chatId),
      message
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function sendFileByUrl(id, token, chatId, fileUrl) {
  const filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
  const url = `https://api.green-api.com/waInstance${id}/sendFileByUrl/${token}`;
  return fetchAndShow(url, {
    method: "POST",
    body: JSON.stringify({
      chatId: normalizeChatId(chatId),
      urlFile: fileUrl,
      fileName: filename
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

el.getSettingsBtn.addEventListener("click", () => {
  const id = el.id.value.trim();
  const token = el.token.value.trim();
  getSettings(id, token);
});

el.getStateBtn.addEventListener("click", () => {
  const id = el.id.value.trim();
  const token = el.token.value.trim();
  getStateInstance(id, token);
});

el.sendMsgBtn.addEventListener("click", () => {
  const id = el.id.value.trim();
  const token = el.token.value.trim();
  const chatId = el.msgChatId.value.trim();
  const message = el.message.value.trim();
  sendMessage(id, token, chatId, message);
});

el.sendFileBtn.addEventListener("click", () => {
  const id = el.id.value.trim();
  const token = el.token.value.trim();
  const chatId = el.fileChatId.value.trim();
  const fileUrl = el.fileUrl.value.trim();
  sendFileByUrl(id, token, chatId, fileUrl);
});

if (el.copyBtn) {
  el.copyBtn.addEventListener("click", () => {
    const text = el.output.textContent;
    navigator.clipboard.writeText(text).then(() => {
      el.copyBtn.textContent = "Copied!";
      setTimeout(() => {
        el.copyBtn.textContent = "Copy";
      }, 2000);
    });
  });
}
