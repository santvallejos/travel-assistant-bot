import { RunnableConfig } from "@langchain/core/runnables";
import { weatherAgent} from "../agents/weatherAgent";
import { AgentState } from "../agents/agentState";
import { runAgentNode } from "./runAgentNode";

export async function weatherNode(state: typeof AgentState.State, config?: RunnableConfig) {
    return runAgentNode({
        state: state,
        agent: await weatherAgent,
        name: "weatherAgent",
        config: config
    });
}