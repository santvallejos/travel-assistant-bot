import Express from "express";
import dotenv from "dotenv";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { START, StateGraph, MessagesAnnotation, MemorySaver, Annotation, END } from "@langchain/langgraph";
import type { Runnable, RunnableConfig } from "@langchain/core/runnables";
import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { createDestinationAgent } from "./agents/destinationAgent";
import { createWeatherAgent } from "./agents/weatherAgent";
import { weatherQueryTool } from "./tools/weatherTool";
import { packingSuggestionsTool } from "./tools/weatherTool";
import { destinationRecommendationTool } from "./tools/destinatationTool";
import { AgentState } from "./agents/agentState";
import { runAgentNode } from "./nodes/runAgentNode";
import { ChatOllama } from "@langchain/ollama";

var morgan = require('morgan');

dotenv.config();
const app = Express();
app.use(Express.json());
app.use(morgan('dev'));

const model = new ChatOllama({
    model: "llama3.2",
    temperature: 1
});

//agente de destino
const destinationAgent = createDestinationAgent(model);
async function destinationNode(state: typeof AgentState.State, config?: RunnableConfig) {
    return runAgentNode({
        state: state,
        agent: await destinationAgent,
        name: "destinationAgent",
        config: config
    });
}

//agente de clima y sugerencias de packing
const weatherAgent = createWeatherAgent(model);
async function weatherNode(state: typeof AgentState.State, config?: RunnableConfig){
    return runAgentNode({
        state: state,
        agent: await weatherAgent,
        name: "weatherAgent",
        config: config
    });
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
    .addNode("destinationAgent", destinationNode)
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

app.post("/api/bot", async (req, res) => {
    try {
        const userInput = req.body.message;
        const initialState: typeof AgentState.State = {
            messages: [],
            sender: "user"
        };
        initialState.messages.push(new HumanMessage({ content: userInput, name: "user" }));
        const finalState = await graph.invoke(initialState);
        const ultimoMensaje = finalState.messages[finalState.messages.length - 1];
        res.json({ message: ultimoMensaje.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});