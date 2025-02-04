import { StateGraph, END, START } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { AgentState } from "../agents/agentState";
import { destinationRecommendationTool } from "../tools/destinatationTool";
import { routerAgent } from "../router/routerAgents";
import { routerManager } from "../router/routerManager";
import { weatherQueryTool, packingSuggestionsTool } from "../tools/weatherTool";
import { RunnableConfig } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";
import { createManagerAgent } from "../agents/managerAgent";
import { createWeatherAgent } from "../agents/weatherAgent";
import { createDestinationAgent } from "../agents/destinationAgent";
import { runAgentNode } from "../nodes/runAgentNode";

//Inicializar el estado de la conversación
export let conversationState: typeof AgentState.State = {
    messages: [],
    sender: "user",
};

export const model = new ChatOllama({
    model: "llama3.2",
    temperature: 0
});

const weatherAgent = createWeatherAgent(model);
const destinationAgent = createDestinationAgent(model);

//Declracion de agentes que son nodos
async function managerNode(state: typeof AgentState.State, config?: RunnableConfig) {
    const managerAgent = await createManagerAgent({
        llm: model,
        systemMessage: "Ask pertinent questions and coordinate the responses of the parties interested in the destination and the weather, using clear and concise language, you only have to write what is necessary, do not extend the message too much.",
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

async function weatherNode(state: typeof AgentState.State, config?: RunnableConfig) {
    return runAgentNode({
        state: state,
        agent: await weatherAgent,
        name: "weatherAgent",
        config: config
    });
}

async function destinationNode(state: typeof AgentState.State, config?: RunnableConfig) {
    return runAgentNode({
        state: state,
        agent: await destinationAgent,
        name: "destinationAgent",
        config: config
    });
}

//Creacion de nodo de herramientas
const tools = [destinationRecommendationTool, weatherQueryTool, packingSuggestionsTool];
const toolsNode = new ToolNode<typeof AgentState.State>(tools);

//Creacion del grafo
const workflow = new StateGraph(AgentState)
    .addNode("managerAgent", managerNode)
    .addNode("destinationAgent", destinationNode)
    .addNode("weatherAgent", weatherNode)
    .addNode("call_tool", toolsNode);

//Condicionales del grafo (Aristas)
workflow.addConditionalEdges("managerAgent", routerManager, {
    destinationAgent: "destinationAgent",
    weatherAgent: "weatherAgent",
    managerAgent: "managerAgent",
    end: END,
});

workflow.addConditionalEdges("destinationAgent", routerAgent, {
    continue: "weatherAgent",
    managerAgent: "managerAgent",
    call_tool: "call_tool",
    end: END
});

workflow.addConditionalEdges("weatherAgent", routerAgent, {
    continue: "destinationAgent",
    managerAgent: "managerAgent",
    call_tool: "call_tool",
    end: END
});

workflow.addConditionalEdges("call_tool",
    (x) => x.sender,
    {
        destinationAgent: "destinationAgent",
        weatherAgent: "weatherAgent"
    });

//Inicio del grafo y compilacion
workflow.addEdge(START, "managerAgent");
export const graph = workflow.compile();