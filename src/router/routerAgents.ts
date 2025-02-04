import { AIMessage } from "@langchain/core/messages";
import { AgentState } from "../agents/agentState";

export function routerAgent(state: typeof AgentState.State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // Si se detecta que se hicieron llamadas a herramientas, se direcciona al nodo de herramientas
    if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
        return "call_tool";
    }
    // Si el mensaje ya es final, se termina el flujo
    if (typeof lastMessage.content === "string" && lastMessage.content.includes("FINAL ANSWER")) {
        return "end";
    }

    // En lugar de retornar "continue" y redirigir al otro agente, se redirige al manager para reevaluar la situación
    return "managerAgent";
}