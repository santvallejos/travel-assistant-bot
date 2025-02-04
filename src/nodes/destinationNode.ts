import { RunnableConfig } from "@langchain/core/runnables";
import { destinationAgent } from "../agents/destinationAgent";
import { AgentState } from "../agents/agentState";
import { runAgentNode } from "./runAgentNode";

export async function destinationNode(state: typeof AgentState.State, config?: RunnableConfig) {
    return runAgentNode({
        state: state,
        agent: await destinationAgent,
        name: "destinationAgent",
        config: config
    });
}