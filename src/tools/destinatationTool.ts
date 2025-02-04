import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";
import { model } from "../graph/graph";

export const destinationRecommendationTool = tool(
    async ({ preferences }: { preferences: string }) => {
        const prompt = `
                        You are an expert in tourism and travel.
                        The user's query is: "${preferences}".
                        
                        Use a friendly, warm and conversational tone.
                        
                        If the query mentions a specific destination (e.g., "I want to travel to Paris, what can you tell me about that destination?"), 
                        provide important details about the place: a short description, key attractions, and some interesting facts. Avoid recommending other destinations.
                        
                        Otherwise, if the query describes general travel preferences without specifying a destination,
                        analyze the query and recommend the ideal tourist destination. Explain in detail your reasoning (considering climate, culture, geography, etc.) as if it were your personal suggestion.`
                        .trim();

        const llmResponse = await model.invoke(prompt);

        return llmResponse;
    },
    {
        name: "destination_recommendation",
        description:
            "Analyzes the user's query to either provide detailed information about a specific destination if mentioned, or recommend an ideal destination based on general travel preferences.",
        schema: z.object({
            preferences: z
                .string()
                .describe(
                    "User query, which can be a description of general travel preferences or a question about a specific destination (e.g., 'I want to travel to Paris, what can you tell me about that destination?' or 'I prefer beaches with sunny weather.')"
                ),
        }),
    }
);