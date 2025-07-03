import { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { addGroupRoute } from '@/services/firestore/routeDbService';
import { extractFirstJson, removeFirstJson } from '../utils/extractJson';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  showGoToRoutes?: boolean; // <-- add this
};

interface Location {
  latitude: number;
  longitude: number;
  locationName: string;
}

interface AIResponse {
  action: 'create_route';
  status: 'active' | 'pending';
  locations: Location[];
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();

  // Tara's personality and topic restriction
  const systemPrompt: ChatMessage = {
    role: 'system',
    content: `
You are Tara, a fun and friendly AI travel assistant. 
You help users with anything related to traveling: destinations, planning, weather, places to visit, safety, packing, budgeting, transportation, and tips.
You do NOT answer questions unrelated to travel. If the user asks something off-topic, do not answer it and kindly remind them that you're only here for travel help.
Make your responses short and concise, with a helpful tone, upbeat, and cheerful like a well-traveled friend! 🌍✈️
If the user wants to create a travel route, respond ONLY with this JSON structure:
{"action":"create_route","status":"active","locations":[{"latitude":14.5995,"longitude":120.9842,"locationName":"Manila"},{"latitude":16.4023,"longitude":120.596,"locationName":"Baguio"}]}
`.trim(),
  };

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
          'Authorization': 'Bearer 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',
          'HTTP-Referer': 'https://tarag.app/' // required by OpenRouter
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages: [systemPrompt, ...updatedMessages],
        }),
      });

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        throw new Error('Tara didn’t respond. Please try again.');
      }

      let content = data.choices[0].message.content.trim();
      let showGoToRoutes = false;

      // Check if it's a route command and try parsing it
      if (content.includes('create_route')) {
        try {
          const jsonString = extractFirstJson(content);
          if (!jsonString) throw new Error('No JSON found in AI response');
          const parsed: AIResponse = JSON.parse(jsonString);

          if (session?.user) {
            await addGroupRoute({
              createdOn: new Date(),
              status: parsed.status,
              userID: session.user.id,
              location: parsed.locations,
            });
            showGoToRoutes = true;
          } else {
            console.warn('No session user found');
          }

          // Remove the JSON from the AI's reply before displaying
          content = removeFirstJson(content).trim();

          // If nothing left after removing JSON, show a default message
          if (!content) {
            content = "Route created! 🚗";
          }
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Sorry, I could not process the route request.',
            },
          ]);
          setLoading(false);
          return;
        }
      }

      // Add the AI reply (with JSON removed if present) to the chat
      if (content) {
        const aiReply: ChatMessage = {
          role: 'assistant',
          content,
          ...(showGoToRoutes ? { showGoToRoutes: true } : {}),
        };
        setMessages((prev) => [...prev, aiReply]);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
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