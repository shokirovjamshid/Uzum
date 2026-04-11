// High-load hybrid consumers client for Uzum-like marketplace
// - Customers can only send image URLs
// - Sellers can send text and images
// - Tracks online status and read receipts

(function () {
  function createChatClient({ roomId, wsBaseUrl, token, userType }) {
    const socketUrl = `${wsBaseUrl.replace(/\/$/, "")}/ws/chat/${roomId}/?token=${encodeURIComponent(
      token
    )}`;

    const socket = new WebSocket(socketUrl);

    const listeners = {
      message: [],
      read_receipt: [],
      status: [],
      open: [],
      close: [],
      error: [],
    };

    function notify(type, payload) {
      (listeners[type] || []).forEach((fn) => fn(payload));
    }

    socket.onopen = function () {
      notify("open");
      // Initial presence ping
      socket.send(JSON.stringify({ action: "ping" }));
    };

    socket.onclose = function (event) {
      notify("close", event);
    };

    socket.onerror = function (event) {
      notify("error", event);
    };

    socket.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          notify("message", data);
        } else if (data.type === "read_receipt") {
          notify("read_receipt", data);
        } else if (data.type === "status") {
          notify("status", data);
        }
      } catch (e) {
        // ignore malformed payloads
      }
    };

    function sendMessage({ text, imageUrl }) {
      text = (text || "").trim();
      imageUrl = (imageUrl || "").trim();

      if (userType === "user" && text) {
        // Customers are not allowed to send text messages
        console.warn("Customers can only send image messages");
        return;
      }

      if (!text && !imageUrl) {
        return;
      }

      socket.send(
        JSON.stringify({
          action: "send_message",
          text: text,
          image_url: imageUrl,
        })
      );
    }

    function markRead() {
      socket.send(JSON.stringify({ action: "mark_read" }));
    }

    function on(type, handler) {
      if (!listeners[type]) {
        listeners[type] = [];
      }
      listeners[type].push(handler);
      return function unsubscribe() {
        listeners[type] = listeners[type].filter((fn) => fn !== handler);
      };
    }

    return {
      socket,
      sendMessage,
      markRead,
      on,
    };
  }

  window.UzumChatClient = { createChatClient };
})();

