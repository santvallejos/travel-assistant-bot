import { OpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";

//La tool procesara la respuesta con el modelo de llm
const model = new ChatOllama({
    model: "llama3.2",
    temperature: 1
});

// Tool para recomendar un destino basado en las preferencias del usuario.
export const destinationRecommendationTool = tool(
    async ({ preferences }: { preferences: string }) => {
        const prompt = `You are an expert in tourism and travel.
                        The user's query is: "${preferences}".
                        If the user mentions a specific destination (for example, "I want to travel to Paris, what can you tell me about that destination?")
                        and asks for information about that destination, provide complete details about the destination: information about its climate, culture, geography, history,
                        tourist attractions, and any other relevant information. Do not make recommendations for different destinations.
                        Otherwise, if the user only describes general travel preferences without mentioning a specific destination, analyze the query and
                        recommend the tourist destination that you consider ideal, explaining in detail your reasoning (climate, culture, geography, etc.).`

        const llmResponse = await model.invoke(prompt);

        return llmResponse;

        // En este ejemplo, simplemente devolvemos el texto completo generado por el LLM.
        return {
            destination: "Información extraída de la respuesta",
            reason: "Información extraída de la respuesta",       
            message: llmResponse,
        };
    },

    {
        name: "destination_recommendation",
        description:
            "Analyzes the user's query to provide detailed information about a specific destination if one is mentioned, or recommends an ideal destination based on general travel preferences.",

        schema: z.object({
            preferences: z
                .string()
                .describe(
                    "User query, which can be either a description of general preferences or a question about a specific destination, for example: 'I want to travel to Paris, what can you tell me about that destination?' or 'I prefer beaches with sunny weather'."
                ),
        }),
    }
);
