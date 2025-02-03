import { HumanMessage } from "@langchain/core/messages";
import type { Runnable, RunnableConfig } from "@langchain/core/runnables";
import { AgentState } from "../agents/agentState";

export async function runAgentNode(props: {
    state: typeof AgentState.State;
    agent: Runnable;
    name: string;
    config?: RunnableConfig;
}){
    const { state, agent, name, config } = props;
    let result = await agent.invoke(state, config);
    // We convert the agent output into a format that is suitable
    // to append to the global state
    if (!result?.tool_calls || result.tool_calls.length === 0) {
        // If the agent is NOT calling a tool, we want it to
        // look like a human message.
        result = new HumanMessage({ ...result, name: name });
    }
    return {
        messages: [result],
        // Since we have a strict workflow, we can
        // track the sender so we know who to pass to next.
        sender: name,
    };
}