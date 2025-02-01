import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Tool para recomendar un destino basado en las preferencias del usuario.
export const destinationRecommendationTool = tool(
    async ({ preferences }: { preferences: string }) => {
        // Convertimos la consulta a minúsculas para facilitar la comparación.
        const queryLower = preferences.toLowerCase();
        let destinationRecommendation = "";
        let reason = "";


        // Lógica heurística simple: se analizan palabras clave para sugerir un destino.
        if (
            queryLower.includes("beach") ||
            queryLower.includes("sun") ||
            queryLower.includes("ocean")
        ) {
            destinationRecommendation = "Cancún, México";
            reason =
                "Preferences related to beaches and sunny weather were detected";

        } else if (
            queryLower.includes("mountain") ||
            queryLower.includes("cold") ||
            queryLower.includes("snow")
            ) {
            destinationRecommendation = "Bariloche, Argentina";
            reason =
                "Preferences for mountain environments or cold climates were detected";

        } else if (
            queryLower.includes("history") ||
            queryLower.includes("culture") ||
            queryLower.includes("art")
        ) {
            destinationRecommendation = "Roma, Italia";
            reason = "Interests in history, culture and art were detected";

        } else if (
            queryLower.includes("modern") ||
            queryLower.includes("urban") ||
            queryLower.includes("business")
        ) {
            destinationRecommendation = "Nueva York, Estados Unidos";
            reason = "Preferences for urban and modern destinations were detected";
        } else {
            // Caso por defecto: se podría utilizar otro criterio o dejar que el agente elija

            destinationRecommendation = "París, Francia";
            reason =
                "No specific preferences were identified, so a well-known international destination is recommended";

        }

        // Retornamos el destino recomendado junto con una breve explicación
        return {
            destination: destinationRecommendation,
            reason,
            message: `Based on your preferences, the recommendation is ${destinationRecommendation} because ${reason}.`,
        };

    },
    {
        name: "destination_recommendation",
        description:
            "Evaluates a description of preferences and desired features to recommend the most appropriate tourist destination.",

        schema: z.object({
            preferences: z
                .string()
                .describe(
                    "Description of preferences and desired features for the destination, for example: 'I prefer beaches with good weather and a relaxed atmosphere'"
                ),
        }),
    }
);
