import { AIMessage } from "@langchain/core/messages";
import { AgentState } from "../agents/agentState";

export function routerManager(state: typeof AgentState.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    if (typeof lastMessage.content === "string") {
        if (lastMessage.content.startsWith("FINAL ANSWER")) {
            return "end";
        }
        if (lastMessage.content.toLowerCase().includes("destination")) {
            return "destinationAgent";
        }
        if (lastMessage.content.toLowerCase().includes("weather")) {
            return "weatherAgent";
        }
    }
    // Por defecto, se vuelve a pasar el control al manager para que sintetice o realice más preguntas.
    return "managerAgent";
}