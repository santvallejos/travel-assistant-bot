## Travel Assistant Bot✈️🤖

Technical test for Sherpa.wtf about a travel assistant bot, it can help you choose a destination, indicate the weather of cities or places you are interested in traveling and provide you with tips for your luggage depending on the weather as recurring objects

## Table of Contents
- [Project architecture](#architecture)
- [Installation](#installation)
- [Use](#use)
- [Characteristics](#characteristics)
- [Author](#author)

## architecture

    travel-assistant-bot
    │──  src
    │   │── agents
    │   │   │── agentState
    │   │   │── destinationAgent
    │   │   │── expertAgent
    │   │   │── managerAgent
    │   │   └── weatherAgent
    │   │── controller
    │   │   └── chatController
    │   │── graph
    │   │   └── graph
    │   │── nodes
    │   │   │── destinationNode
    │   │   │── managerNode
    │   │   │── runAgentNode
    │   │   └── weatherNode
    │   │── router
    │   │   │── routerAgents
    │   │   └── routerManager
    │   │── services
    │   │   └── weatherService
    │   │── tools
    │   │   │── destinationTool
    │   │   └── weatherTool
    │   └── index
    │
    │── .env
    │── .gitignore
    │── package-lock.json
    │── package.json
    │── tsconfig.json
    └── README.md

## installation

1.Clone this repository and move to the main folder:

```bash
git clone https://github.com/santvallejos/CalendarOfEvents-Frontend.git
cd CalendarOfEvents-Frontend
```

2.Install packages

```bash
npm install
```

3.Defining environment variables

    PORT=####
    OPENWEATHERMAP_API_KEY=##############

4.Define the artificial intelligence model you are going to use(define it in the graph)
In my case I used llama3.2 locally with Ollama but it can be easily adapted to other models, such as OpenIA, Anthropic, etc.

    const model = new ChatOllama({
        model: "llama3.2",
        temperature: 0
    });

5.Execute the project

```bash
npm run dev
```

6.Make a query

```bash
curl -X POST http://localhost:3000/api/bot -H "Content-Type: application/json" -d '{"message": ""Hi, I want to go on a trip. I like places with beaches. I need you to recommend a destination to travel to.""}'
```

## use

This app is an AI-based travel assistant that helps users plan their trips by providing personalized recommendations. It can answer queries about what to pack, the weather at the destination, and other travel essentials.

## characteristics

✔️ Personalized responses: Uses AI to analyze the user's query and generate tailored responses.
✔️ Real-time weather query: Obtains weather data from OpenWeatherMap to improve the accuracy of recommendations.
✔️ Packing suggestions: Generates lists of essential items based on the temperature and conditions of the destination.
✔️ Conversation management: The assistant can answer questions about different aspects of a trip.
✔️ Easy integration: Exposes a REST API that can be consumed from any application.

## author

[![LinkedIn Follow](https://img.icons8.com/?size=50&id=447&format=png&color=000000)](https://www.linkedin.com/in/santiago-vallejos-97a933236/)
[![Github](https://img.icons8.com/?size=50&id=62856&format=png&color=000000)](https://github.com/santvallejos)