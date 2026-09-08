import { useState, useCallback, useEffect } from "react";
import { aiApi } from "../services/aiApi";

export function useAIChat(initialConversationId = null) {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load existing messages if conversationId exists
  useEffect(() => {
    if (!conversationId) return;
    let isMounted = true;
    aiApi.getMessages(conversationId)
      .then((data) => {
        if (isMounted && data.messages) {
          setMessages(data.messages);
        }
      })
      .catch((err) => console.warn("Failed to load conversation history:", err));
    return () => { isMounted = false; };
  }, [conversationId]);

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.chat(text, conversationId);
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        agent: response.agent,
        sources: response.sources || [],
        tool_results: response.tool_results || [],
        recommendations: response.recommendations || [],
        confidence: response.confidence,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
      return response;
    } catch (err) {
      const errorText = err.message || "Failed to communicate with AI engine.";
      setError(errorText);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Error: ${errorText}. Please verify that Ollama or backend AI service is running.`,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    conversationId,
    loading,
    error,
    sendMessage,
    clearChat
  };
}
