import { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { addGroupRoute } from '@/services/firestore/routeDbService';
import { convertLocationsToRouteJson } from '@/services/googlePlacesService';
import { extractFirstJson, removeFirstJson } from '@/utils/extractJson';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  showGoToRoutes?: boolean;
};

interface AIPlaceNameResponse {
  action: 'create_route';
  locations: {
    locationName: string;
  }[];
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();

  const systemPrompt: ChatMessage = {
    role: 'system',
    content: `
You are Tara, a fun and friendly AI travel assistant. 
You help users with anything related to traveling: destinations, planning, weather, places to visit, safety, packing, budgeting, transportation, and tips.
You do NOT answer questions unrelated to travel. If the user asks something off-topic, do not answer it and kindly remind them that you're only here for travel help.
Make your responses short and concise, with a helpful tone, upbeat, and cheerful like a well-traveled friend! 🌍✈️
When the user wants to create a travel route, respond ONLY with this JSON structure (place names only):
{
  "action": "create_route",
  "locations": [
    { "locationName": "Manila" },
    { "locationName": "San Fernando, Pampanga" },
    { "locationName": "Baguio City" }
  ]
}
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
          'HTTP-Referer': 'https://tarag.app/' // Required by OpenRouter
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

      if (content.includes('create_route')) {
        try {
          const jsonString = extractFirstJson(content);
          if (!jsonString) throw new Error('No JSON found in AI response');
          const parsed: AIPlaceNameResponse = JSON.parse(jsonString);

          if (session?.user) {
            const finalRoute = await convertLocationsToRouteJson(parsed.locations, session.user.id);
            await addGroupRoute(finalRoute);
            showGoToRoutes = true;
          }

          // Remove the JSON part from the reply if needed
          content = removeFirstJson(content).trim();
          if (!content) {
            content = 'Route created successfully! 🚗';
          }
        } catch (err) {
          console.error('Route processing error:', err);
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Sorry, I couldn’t process the route properly.',
            },
          ]);
          setLoading(false);
          return;
        }
      }

      const aiReply: ChatMessage = {
        role: 'assistant',
        content,
        ...(showGoToRoutes ? { showGoToRoutes: true } : {}),
      };
      setMessages((prev) => [...prev, aiReply]);
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
