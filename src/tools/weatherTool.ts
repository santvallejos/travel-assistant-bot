import axios from "axios";
import dotenv from "dotenv";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";
import { model3b } from "../graph/graph";

dotenv.config();

export const weatherQueryTool = tool(
    async ({ destination }) => {
        const cleanedDestination = encodeURIComponent(destination.trim());
        const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cleanedDestination}&units=metric&appid=${API_KEY}`;

        try {
            const response = await axios.get(url);
            const data = response.data;
            return {
                temperature: data.main.temp,
                weather: data.weather[0].description,
                city: data.name
            };
        } catch (error) {
            console.error("Error fetching weather from API:", error);
            return { error: "Unable to retrieve weather information for the specified destination." };
        }
    },
    {
        name: "weather_query",
        description:
            "Search for the city or location in the input and return the current weather (temperature and conditions). Use this tool for real-time weather questions.",
        schema: z.object({
            destination: z.string().describe("City or place to query the weather")
        })
    }
);

export const packingSuggestionsTool = tool(
    async ({ destination, duration }) => {
        const cleanedDestination = encodeURIComponent(destination.trim());
        const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cleanedDestination}&units=metric&appid=${API_KEY}`;

        let weatherData;
        try {
            const response = await axios.get(url);
            weatherData = response.data;
        } catch (error) {
            console.error("Error fetching weather for packing suggestions:", error);
            return { error: "Unable to retrieve weather information for the provided destination." };
        }

        const temperature = weatherData.main.temp;
        const weatherDescription = weatherData.weather[0].description;

        const packingPrompt = `You are an expert in travel planning and packing recommendations.
                                Destination: ${weatherData.name}
                                Trip Duration: ${duration} days
                                Current Weather: ${temperature}°C with conditions "${weatherDescription}"
                                Generate a detailed packing list that includes:
                                - Essential personal items (e.g., chargers, passport, documents, etc.)
                                - Clothing and accessories suitable for the current weather, with explanations on what to pack and what can be omitted.`;

        const responsePacking = await model3b.invoke(packingPrompt);

        return {
            destination: weatherData.name,
            temperature,
            weather: weatherDescription,
            packing_suggestions: responsePacking.content || responsePacking
        };
    },
    {
        name: "enhanced_packing_suggestions",
        description:
            "Generates packing recommendations based on the current weather at the destination and the trip duration. Use this tool ONLY when the user asks for packing help.",
        schema: z.object({
            destination: z.string().describe("Name or description containing the travel destination"),
            duration: z.number().min(1).describe("Trip duration in days")
        })
    }
);