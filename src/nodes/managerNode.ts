import { HumanMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { AgentState } from "../agents/agentState";
import { createManagerAgent } from "../agents/managerAgent";
import { model } from "../graph/graph";

export async function managerNode(state: typeof AgentState.State, config?: RunnableConfig) {
    const managerAgent = await createManagerAgent({
        llm: model,
        systemMessage: "Ask relevant questions and coordinate responses from destination and climate stakeholders, using clear and concise language.", // O puedes pasar algún mensaje adicional si lo deseas
    });

    let result = await managerAgent.invoke(state, config);

    // Si no se devolvió una respuesta formateada, la encapsulamos en un HumanMessage
    if (!result?.tool_calls || result.tool_calls.length === 0) {
        result = new HumanMessage({ ...result, name: "managerAgent" });
    }

    return {
        messages: [result],
        sender: "managerAgent",
    };
}