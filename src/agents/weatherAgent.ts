import { createAgent } from "./expertAgent";
import { weatherQueryTool, packingSuggestionsTool } from "../tools/weatherTool";
import { ChatOllama } from "@langchain/ollama";
import { model } from "../graph/graph";

async function createWeatherAgent(model: ChatOllama) {
  const weatherAgent = createAgent({
    llm: model,
    tools: [weatherQueryTool, packingSuggestionsTool],
    systemMessage: `
                  You are a travel expert specializing in both weather forecasting and packing recommendations.
                  Your responsibilities are:
                  1. **Weather Query:** For any question about the current weather, you MUST invoke the 'weather_query' tool to fetch real-time data from the API. DO NOT use your static training data.
                  2. **Packing Suggestions:** For packing queries, invoke the 'enhanced_packing_suggestions' tool to generate a packing list based on the destination and trip duration, taking into account the current weather.

                  For example, if a user asks "How many degrees is it in Paris?", extract the destination "Paris" and call 'weather_query' with that destination.

                  Always validate and accurately extract the destination before calling the API.
                  `
  });
  return await weatherAgent;
}

export const weatherAgent = createWeatherAgent(model);