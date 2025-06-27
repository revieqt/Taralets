import { useState, useEffect } from 'react';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tara's personality and topic restriction
  const systemPrompt: ChatMessage = {
    role: 'system',
    content: `
You are Tara, a fun and friendly AI travel assistant. 
You help users with anything related to traveling: destinations, planning, weather, places to visit, safety, packing, budgeting, transportation, and tips.
You do NOT answer questions unrelated to travel. If the user asks something off-topic, do not answer it and kindly remind them that you're only here for travel help.
Keep your answers short and concise, with a helpful tone, upbeat, and cheerful like a well-traveled friend!
    `.trim(),
  };

  // Send Tara's intro message on first mount or after reset
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            "Hi! I'm Tara, your friendly travel assistant. Ask me anything about travel—destinations, tips, weather, and more. Where are you off to next? 🌏✈️",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: text.trim(),
    };

    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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', // 🔐 Replace with secure key
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct', // ✅ Use any supported model
          messages: [systemPrompt, ...updatedMessages],
        }),
      });

      const data = await response.json(); 

      if (!data.choices || !data.choices[0]) {
        throw new Error('Tara didn’t respond. Please try again.');
      }

      const aiReply: ChatMessage = {
        role: 'assistant',
        content: data.choices[0].message.content.trim(),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      console.error('Tara chat error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hi! I'm Tara, your friendly travel assistant. Ask me anything about travel—destinations, tips, weather, and more. Where are you off to next? 🌏✈️",
      },
    ]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    resetChat,
  };
}