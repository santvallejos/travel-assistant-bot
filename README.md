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

## installation 💻

1.Clone this repository and move to the main folder:

```bash
git clone https://github.com/santvallejos/travel-assistant-bot.git
cd travel-assistant-bot
```

2.Install packages

```bash
npm install
```

3.Defining environment variables

    PORT=####
    OPENWEATHERMAP_API_KEY=##############

4.Define the artificial intelligence model you are going to use(define it in the graph) <br>
In my case I used llama3.2:1b for simpler processes and llama3.2 for more complex ones, in order to optimize costs and performance. I used Ollama but it can be easily adapted to other models, such as OpenIA, Anthropic, etc.

    export const model1b = new ChatOllama({
        model: "llama3.2:1b",
        temperature: 0
    });
    
    export const model3b = new ChatOllama({
        model: "llama3.2",
        temperature: 0
    });

5.Execute the project

```bash
npm run dev
```

## use 💬

This app is an AI-based travel assistant that helps users plan their trips by providing personalized recommendations. It can answer queries about what to pack, the weather at the destination, and other travel essentials.
<br>
<br>

Examples of inputs and outputs:

```bash
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message": "what is the current temperature in Paris?"}'
```
<br>

```bash
{"message":"The current temperature in Paris is 3.41°C with mist."}
```
<br>

```bash
curl -X POST http://localhost:3000/api/chat -H "Conte{"message": "I want to take a trip to Paris, what do you recommend I see?"}'
```
<br>

```bash
{"message":"Paris is an amazing city, but if you're looking for a more unique experience, I'd recommend considering Rome as an aties offer a rich history, art, and culture, but they have distinct atmospheres and characteristics that might suit different pr
romantic atmosphere of Paris, you might appreciate the stunning architecture, world-class museums, and picturesque streets of Ro, Pantheon, Trevi Fountain, and many other iconic landmarks make Rome a must-visit destination for history buffs and art enthusi
you prefer a more relaxed atmosphere with plenty of opportunities to explore hidden gems and quieter areas, Rome might be the be
delicious food, wine, and gelato will satisfy your cravings, and its smaller size makes it easier to navigate.\n\nUltimately, boations that offer something for everyone. If you're unsure which one to choose, consider visiting both Paris and Rome at different times of the year or during specific events to get a better feel for each city's unique character."}
```

## characteristics 📋

✔️ Personalized responses: Uses AI to analyze the user's query and generate tailored responses.<br>
✔️ Real-time weather query: Obtains weather data from OpenWeatherMap to improve the accuracy of recommendations.<br>
✔️ Packing suggestions: Generates lists of essential items based on the temperature and conditions of the destination.<br>
✔️ Conversation management: The assistant can answer questions about different aspects of a trip.<br>
✔️ Easy integration: Exposes a REST API that can be consumed from any application.<br>

## author

[![LinkedIn Follow](https://img.icons8.com/?size=50&id=447&format=png&color=000000)](https://www.linkedin.com/in/santiago-vallejos-97a933236/)
[![Github](https://img.icons8.com/?size=50&id=62856&format=png&color=000000)](https://github.com/santvallejos)
