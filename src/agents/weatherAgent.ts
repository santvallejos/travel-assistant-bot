import { createAgent } from "./expertAgent";
import { weatherQueryTool, packingSuggestionsTool } from "../tools/weatherTool";
import { ChatOllama } from "@langchain/ollama";
import { model3b } from "../graph/graph";

export async function createWeatherAgent(model: ChatOllama) {
  const weatherAgent = createAgent({
    llm: model3b,
    tools: [weatherQueryTool, packingSuggestionsTool],
    systemMessage: `
You are a travel expert specializing in weather forecasting and packing recommendations.
When asked about the current weather, you MUST:
1. Extract the destination from the query.
2. Call the 'weather_query' tool to fetch real-time weather data.
3. Respond using ONLY the data from the API in the format: "The current temperature in [City] is [temperature]°C with [weather description]."

When asked about packing recommendations, you MUST:
1. Extract the destination and trip duration from the query.
2. Call the 'enhanced_packing_suggestions' tool to generate a packing list based on the current weather.
3. Respond with the packing suggestions, ensuring the answer is concise.
                    `,
  });
  return await weatherAgent;
}