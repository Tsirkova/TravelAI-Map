// ✅ lib/recommendation.ts
import { Place } from '@/app/MapPage';

export async function fetchAIRecommendations(
  userPlaces: Place[],
  userLocation: [number, number]
): Promise<{ nearby: Place[]; similar: Place[] }> {
  const prompt = buildPrompt(userPlaces, userLocation);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000', // укажи свой домен
      'X-Title': 'TravelAI Map'
    },
    body: JSON.stringify({
      model: 'mistral:7b-instruct', // можно: gpt-3.5-turbo, mistral, claude и др.
      messages: [
        {
          role: 'system',
          content: 'Ты — AI-гид. Возвращай JSON без объяснений.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8
    })
  });

  const json = await response.json();

  try {
    const parsed = JSON.parse(json.choices[0].message.content);
    return {
      nearby: parsed.nearby || [],
      similar: parsed.similar || []
    };
  } catch (e) {
    console.error('Ошибка парсинга AI ответа:', json);
    return { nearby: [], similar: [] };
  }
}

function buildPrompt(places: Place[], location: [number, number]): string {
  const visited = places.map(p =>
    `- ${p.name} (город: ${p.city || 'неизвестно'}, описание: ${p.description || '—'})`
  ).join('\n');

  return `
Пользователь посетил следующие места:
${visited}

Он сейчас находится в координатах: ${location[0].toFixed(4)}, ${location[1].toFixed(4)}

Предложи:
1. 3 интересных места рядом (в этом городе или в радиусе 50 км) — как массив "nearby"
2. 3 места по интересам, похожих на уже посещённые — как массив "similar"

Формат ответа:

{
  "nearby": [
    { "name": "...", "city": "...", "coordinates": { "latitude": ..., "longitude": ... }, "description": "..." },
    ...
  ],
  "similar": [
    { "name": "...", "city": "...", "coordinates": { "latitude": ..., "longitude": ... }, "description": "..." }
  ]
}

Только JSON. Без пояснений.
`;
}
