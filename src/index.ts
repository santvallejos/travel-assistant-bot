import Express from "express";
import dotenv from "dotenv";
import { HumanMessage } from "@langchain/core/messages";
import { conversationState, graph } from "./graph/graph";

var morgan = require('morgan');

dotenv.config();
const app = Express();
app.use(Express.json());
app.use(morgan('dev'));

//Controllador de metodo POST
app.post("/api/bot", async (req, res) => {
    try {
        const userInput = req.body.message;

        conversationState.messages.push(new HumanMessage({ content: userInput, name: "user" }));

        const updatedConversationState = await graph.invoke(conversationState);

        const ultimoMensaje = updatedConversationState.messages[updatedConversationState.messages.length - 1];

        let responseText = typeof ultimoMensaje.content === "string" ? ultimoMensaje.content : "";
        if (responseText.startsWith("FINAL ANSWER")) {
            responseText = responseText.replace(/^FINAL ANSWER\s*/, "");
        }
        res.json({ message: responseText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/history", (req, res) => {
    res.json({ history: conversationState.messages });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});