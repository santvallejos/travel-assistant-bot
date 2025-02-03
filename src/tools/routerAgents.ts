import { AIMessage } from "@langchain/core/messages";
import { AgentState } from "../agents/agentState";

export function router(state: typeof AgentState.State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1] as AIMessage;
    if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
        // The previous agent is invoking a tool
        return "call_tool";
    }
    if (
        typeof lastMessage.content === "string" &&
        lastMessage.content.includes("FINAL ANSWER")
    ) {
        // Any agent decided the work is done
        return "end";
    }
    return "continue";
}