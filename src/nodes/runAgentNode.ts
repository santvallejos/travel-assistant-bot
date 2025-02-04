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
    if (!result?.tool_calls || result.tool_calls.length === 0) {
        result = new HumanMessage({ ...result, name: name });
    }
    return {
        messages: [result],
        sender: name,
    };
}