import { AIMessage } from "@langchain/core/messages";
import { AgentState } from "../agents/agentState";
import { model1b, model3b } from "../graph/graph";

async function detectUserIntentionUsingLLM(message: string): Promise<"destination" | "weather" | "ambiguous"> {
    const prompt = `
Analyze the following user query: "${message}".
Determine whether the primary intent is:
- "destination": when the user asks for travel recommendations, places to visit, or general destination suggestions.
- "weather": when the user asks for current weather information or packing recommendations (queries containing words like "weather", "temperature", "pack", "luggage", "suitcase", "packing", etc.).
If you cannot determine clearly, respond with "ambiguous".
Respond with only one of these words: destination, weather, ambiguous.
    `.trim();

    const response = await model3b.invoke(prompt);
    const classification = typeof response.content === 'string'
        ? response.content.trim().toLowerCase()
        : 'ambiguous';

    if (["destination", "weather", "ambiguous"].includes(classification)) {
        return classification as "destination" | "weather" | "ambiguous";
    }
    return "ambiguous";
}



export async function routerManager(state: typeof AgentState.State) {
    // Se obtiene el último mensaje del estado de la conversación
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

    if (typeof lastMessage.content === "string") {
        // Si el mensaje ya comienza con "FINAL ANSWER", se termina la conversación
        if (lastMessage.content.startsWith("FINAL ANSWER")) {
            return "end";
        }

        // Utilizar el modelo de IA para detectar la intención del usuario
        const intention = await detectUserIntentionUsingLLM(lastMessage.content);

        if (intention === "destination") {
            return "destinationAgent";
        }
        if (intention === "weather") {
            return "weatherAgent";
        }
    }

    // Si no se pudo determinar la intención, se retorna al manager para pedir clarificaciones
    return "managerAgent";
}