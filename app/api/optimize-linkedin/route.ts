import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { postContent } = await req.json();

    if (!postContent || typeof postContent !== "string") {
      return NextResponse.json(
        { error: "Le contenu du post est requis." },
        { status: 400 }
      );
    }

    const systemPrompt = `Tu es un expert en copywriting LinkedIn et un créateur de contenu viral.
Ton objectif est de transformer le brouillon ou l'idée de post fourni par l'utilisateur en un post LinkedIn premium, ultra-engageant, et optimisé pour l'algorithme (accroche forte, temps d'arrêt, engagement).

Tu dois structurer ta réponse UNIQUEMENT au format JSON avec les clés exactes suivantes :
{
  "hook": "Une accroche très percutante et intrigante (les 2-3 premières lignes avant le 'voir plus').",
  "body": "Le corps du post réécrit : storytelling, structure aérée, phrases courtes, emojis pertinents.",
  "callToAction": "Une question ou incitation à l'action forte pour conclure le post et générer des commentaires.",
  "hashtags": ["#MotCle1", "#MotCle2", "#MotCle3"]
}

Respecte le ton : authentique, professionnel mais conversationnel.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Voici mon brouillon de post à optimiser :\n\n${postContent}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    
    if (!content) {
        throw new Error("No response from Groq.");
    }

    const parsedResponse = JSON.parse(content);

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error("Erreur API Optimisation:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'optimisation du post LinkedIn." },
      { status: 500 }
    );
  }
}
