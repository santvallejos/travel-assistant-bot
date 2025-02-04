import { AIMessage } from "@langchain/core/messages";
import { AgentState } from "../agents/agentState";
import { model } from "../graph/graph";

// Función asíncrona que utiliza el LLM para determinar la intención
async function detectUserIntentionUsingLLM(message: string): Promise<"destination" | "weather" | "ambiguous"> {
    const prompt = `
                    Analyze the following user query: "${message}".
                    Determine whether the primary intent is "destination"(destination recommendation) or "weather" (weather query or luggage recommendation).
                    If you can't determine clearly, respond with "ambiguous".
                    Respond with only one of these words: destination, weather, ambiguous.
                    `.trim();

    // Se invoca el modelo con el prompt creado
    const response = await model.invoke(prompt);

    // Se procesa la respuesta: se espera que el LLM devuelva exactamente una de las palabras requeridas
    const classification = typeof response.content === 'string' ? response.content.trim().toLowerCase() : 'ambiguous';

    if (["destination", "weather", "ambiguous"].includes(classification)) {
        return classification as "destination" | "weather" | "ambiguous";
    }

    // En caso de que la respuesta no sea la esperada, se devuelve "ambiguous"
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