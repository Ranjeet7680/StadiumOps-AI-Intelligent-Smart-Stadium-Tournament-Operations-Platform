import { useEffect, useRef, useState } from "react";

export function useWebSocket(onMessageReceived: (event: any) => void) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const wsProto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = isLocal ? "ws://localhost:8000/ws" : `${wsProto}//${window.location.host}/ws`;
    
    function connect() {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        console.log("WebSocket connected.");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageReceived(data);
        } catch (e) {
          // Plain text message handling
          onMessageReceived({ type: "raw", data: event.data });
        }
      };

      socket.onclose = () => {
        setConnected(false);
        console.log("WebSocket closed. Attempting reconnect...");
        // Reconnect after 3s
        setTimeout(connect, 3000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket.close();
      };
    }

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [onMessageReceived]);

  const sendMessage = (msg: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(msg);
    }
  };

  return { connected, sendMessage };
}
