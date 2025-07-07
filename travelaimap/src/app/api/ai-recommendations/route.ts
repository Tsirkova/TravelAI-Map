import { NextRequest, NextResponse } from 'next/server';
import { Place } from '@/components/MapPage';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { userPlaces, userLocation } = await req.json();

    const prompt = buildPrompt(userPlaces, userLocation);

    const aiRes = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000/',
        'X-Title': 'TravelAI Map'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
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

    const aiJson = await aiRes.json();

    if (aiJson.error) {
      console.error('OpenRouter error:', aiJson.error);
      return NextResponse.json({ nearby: [], similar: [] }, { status: 200 });
    }

    const parsed = JSON.parse(aiJson.choices[0].message.content);

    return NextResponse.json({
      nearby: parsed.nearby || [],
      similar: parsed.similar || []
    });
  } catch (error) {
    console.error('AI route error:', error);
    return NextResponse.json({ nearby: [], similar: [] }, { status: 500 });
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
