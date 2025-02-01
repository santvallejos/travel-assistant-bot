import { createAgent } from "./expertAgent";
import { destinationRecommendationTool } from "../tools/destinatationTool";
import { ChatOllama } from "@langchain/ollama";

export async function createDestinationAgent(model: ChatOllama) {
    const destinationAgent = createAgent({
        llm: model,
        tools: [destinationRecommendationTool],
        systemMessage: "You are an expert in destination recommendations.",
    });
    return await destinationAgent;
}