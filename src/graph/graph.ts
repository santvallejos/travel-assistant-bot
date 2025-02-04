import { StateGraph, END, START } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { AgentState } from "../agents/agentState";
import { destinationNode } from "../nodes/destinationNode";
import { managerNode } from "../nodes/managerNode";
import { weatherNode } from "../nodes/weatherNode";
import { destinationRecommendationTool } from "../tools/destinatationTool";
import { routerAgent } from "../router/routerAgents";
import { routerManager } from "../router/routerManager";
import { weatherQueryTool, packingSuggestionsTool } from "../tools/weatherTool";

//Inicializar el estado de la conversación
export let conversationState: typeof AgentState.State = {
    messages: [],
    sender: "user",
};

export const model = new ChatOllama({
    model: "llama3.2:1b",
    temperature: 0
});

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
    call_tool: "call_tool",
    end: END
});

workflow.addConditionalEdges("weatherAgent", routerAgent, {
    continue: "destinationAgent",
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