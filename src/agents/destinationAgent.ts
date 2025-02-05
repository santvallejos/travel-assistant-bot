import { createAgent } from "./expertAgent";
import { destinationRecommendationTool } from "../tools/destinatationTool";
import { ChatOllama } from "@langchain/ollama";
import { model1b } from "../graph/graph";

export async function createDestinationAgent(model: ChatOllama) {
    const recommendationTool = destinationRecommendationTool;
    const destinationAgent = createAgent({
        llm: model1b,
        tools: [recommendationTool],
        systemMessage: "You are an expert in destination recommendations.",
    });
    return destinationAgent;
}