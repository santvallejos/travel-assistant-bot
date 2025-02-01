import axios from "axios";
import dotenv from "dotenv";
import { tool } from "@langchain/core/tools";
import { WeatherService } from "../services/weatherService";
import { z } from "zod";

dotenv.config();

// -------------------------------------
// Tool para consulta de clima utilizando OpenWeatherMap
// Modificada para devolver un objeto con los datos relevantes.
// -------------------------------------
export const weatherQueryTool = tool(
    async ({ destination, date }) => {

        try {
            // Obtenemos el clima del destino utilizando la API de OpenWeatherMap
            const weatherService = new WeatherService();
            const data = await weatherService.getWeather(destination);

            // Extraemos la información relevante:
            const temperature = data.main.temp;
            const weatherDescription = data.weather[0].description;
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;


            // Retornamos un objeto con la información
            return { temperature, weatherDescription, humidity, windSpeed };
        } catch (error: any) {
            console.error("Error getting weather data:", error);
            // En caso de error se retorna un objeto por defecto, o se podría lanzar un error
            return { temperature: 20, weatherDescription: "Weather data not available", humidity: 0, windSpeed: 0 };
        }

    },
    {
        name: "weather_query",
        description:
            "Query the current weather for a given destination using the OpenWeatherMap API.",
        schema: z.object({
            destination: z.string().describe("The city or location for the weather query"),
            date: z.string().optional().describe("The date for which you want to query the weather (in this example, it is ignored, the current weather is obtained)"),
        }),


    }
);

// -------------------------------------
// Tool combinada: Sugerencias para empacar influenciadas por el clima
// -------------------------------------
export const packingSuggestionsTool = tool(
    async ({ destination, duration }) => {
        // Sugerencias básicas que se deben llevar en cualquier viaje:
        const baseSuggestions = [
            "personal items",
            "charger",
            "passport",
            "inner clothes",
            "important objects for the trip",
        ];


        // Consultamos el clima del destino
        const weatherInfo = await weatherQueryTool.call({ destination, date: new Date().toISOString() });

        // Sugerencias adicionales según la temperatura:
        let weatherBasedSuggestions: string[] = [];
        if (weatherInfo.temperature > 25) {
            weatherBasedSuggestions.push("light and comfortable clothes", "hat", "sunscreen");
        } else if (weatherInfo.temperature < 10) {
            weatherBasedSuggestions.push("warm clothes", "coat", "gloves", "scarf");
        } else {
            weatherBasedSuggestions.push("clothes for temperate weather");
        }


        // Si la duración del viaje es larga, se pueden agregar elementos extras:
        if (duration > 7) {
            baseSuggestions.push("basic medicines", "laundry items");
        }


        // Combinamos las sugerencias
        const allSuggestions = [...baseSuggestions, ...weatherBasedSuggestions];

        // Armamos la respuesta con información del clima para mayor contexto
        return `For a trip to ${destination} of ${duration} days, considering that the current weather is "${weatherInfo.weatherDescription}" with a temperature of ${weatherInfo.temperature}°C, we suggest you to bring: ${allSuggestions.join(", ")}.`;

    },
    {
        name: "enhanced_packing_suggestions",
        description:
            "Generates a list of packing suggestions based on the destination, the duration of the trip, and the current weather conditions.",
        schema: z.object({
            destination: z.string().describe("The destination of the trip, for example, 'Madrid'"),
            duration: z.number().describe("The duration of the trip in days"),
        }),
    }
);