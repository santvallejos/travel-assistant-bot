import { createAgent } from "./expertAgent";
import { weatherQueryTool, packingSuggestionsTool } from "../tools/weatherTool";
import { ChatOllama } from "@langchain/ollama";

export async function createWeatherAgent(model: ChatOllama) {
    const weatherAgent = createAgent({
        llm: model,
        tools: [weatherQueryTool, packingSuggestionsTool],
        systemMessage: "You are an expert in weather and packing suggestions.",
    });
    return await weatherAgent;
}