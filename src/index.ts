import Express from "express";
import dotenv from "dotenv";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { START, StateGraph, MessagesAnnotation, MemorySaver, Annotation, END } from "@langchain/langgraph";
import type { Runnable, RunnableConfig } from "@langchain/core/runnables";
import { ChatOllama } from "@langchain/ollama";
import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { createDestinationAgent } from "./agents/destinationAgent";
import { createWeatherAgent } from "./agents/weatherAgent";
import { weatherQueryTool } from "./tools/weatherTool";
import { packingSuggestionsTool } from "./tools/weatherTool";
import { destinationRecommendationTool } from "./tools/destinatationTool";

var morgan = require('morgan');

dotenv.config();
const app = Express();
app.use(Express.json());
app.use(morgan('dev'));

//Primero definimos el estado del gráfico. Esto será simplemente una lista de mensajes, junto con una clave para rastrear el remitente más reciente.
const AgentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
    }),
    sender: Annotation<string>({
        reducer: (x, y) => y ?? x ?? "user",
        default: () => "user",
    }),
})

// Helper function to run a node for a given agent
async function runAgentNode(props: {
    state: typeof AgentState.State;
    agent: Runnable;
    name: string;
    config?: RunnableConfig;
}) {
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

const model = new ChatOllama({
    model: "llama3.2:1b",
    temperature: 0
});

//agente de destino
const destinationAgent = createDestinationAgent(model);
async function destinatationNode(
    state: typeof AgentState.State,
    config?: RunnableConfig
) {
    return runAgentNode({
        state: state,
        agent: await destinationAgent,
        name: "destinationAgent",
        config: config
    })
}
//agente de clima y sugerencias de packing
const weatherAgent = createWeatherAgent(model);
async function weatherNode(
    state: typeof AgentState.State,
    config?: RunnableConfig
) {
    return runAgentNode({
        state: state,
        agent: await weatherAgent,
        name: "weatherAgent",
        config: config
    })
}

const tools = [destinationRecommendationTool, weatherQueryTool, packingSuggestionsTool];
const toolsNode = new ToolNode<typeof AgentState.State>(tools);

// Either agent can decide to end
function router(state: typeof AgentState.State) {
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

//1.Creación del grafo
const workflow = new StateGraph(AgentState)
    // 2. agregamos los nodos; Estos harán el trabajo
    .addNode("destinationAgent", destinatationNode)
    .addNode("weatherAgent", weatherNode)
    .addNode("call_tool", toolsNode)

// 3. Define the edges. We will define both regular and conditional ones
// After a worker completes, report to supervisor

//Primera condiconal
workflow.addConditionalEdges("destinationAgent", router, {
    // Continuar la transiciones si hay otro agente
    continue: "weatherAgent",
    call_tool: "call_tool",
    end: END
});

//Segunda condicional
workflow.addConditionalEdges("weatherAgent", router, {
    continue: "destinationAgent",
    call_tool: "call_tool",
    end: END
});

//Tercera condicional
workflow.addConditionalEdges("call_tool",
    // Each agent node updates the 'sender' field
    // the tool calling node does not, meaning
    // this edge will route back to the original agent
    // who invoked the tool
    (x) => x.sender,
    {
        destinationAgent: "destinationAgent",
        weatherAgent: "weatherAgent"
    });


workflow.addEdge(START, "destinationAgent");
const graph = workflow.compile();

async function main() {
    try {
        // 1. Inicializa el estado del agente
        const initialState: typeof AgentState.State = {
            messages: [],
            sender: "user"
        };

        // 2. Agrega un mensaje inicial del usuario para iniciar el flujo
        const userInput = "What are the temperatures like now in Madrid?";
        initialState.messages.push(new HumanMessage({ content: userInput, name: "user" }));

        // 3. Invoca el grafo compilado con el estado inicial
        const finalState = await graph.invoke(initialState);

        // 4. Extrae el último mensaje (asumiendo que es el que contiene la respuesta final)
        const ultimoMensaje = finalState.messages[finalState.messages.length - 1];

        if (typeof ultimoMensaje.content === 'string' && ultimoMensaje.content.includes("FINAL ANSWER")) {
            console.log("Mensaje final:", ultimoMensaje.content);
        } else {
            console.log("El último mensaje no contiene la respuesta final.");
        }

        // 5. Muestra solo el contenido del mensaje final
        console.log("Mensaje final:");
        console.log(ultimoMensaje.content);
    } catch (error) {
        console.error(error);
    }
}

main();