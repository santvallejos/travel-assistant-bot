import { createAgent } from "./expertAgent";
import { destinationRecommendationTool } from "../tools/destinatationTool";
import { ChatOllama } from "@langchain/ollama";
import { model } from "../graph/graph";

async function createDestinationAgent(model: ChatOllama) {
    const recommendationTool = destinationRecommendationTool;
    const destinationAgent = createAgent({
        llm: model,
        tools: [recommendationTool],
        systemMessage: "You are an expert in destination recommendations.",
    });
    return destinationAgent;
}

export const destinationAgent = createDestinationAgent(model);