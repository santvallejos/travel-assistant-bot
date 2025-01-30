import Express from "express";
import dotenv  from "dotenv";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { START, StateGraph, MessagesAnnotation, MemorySaver, Annotation } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

var morgan = require('morgan');

dotenv.config();
const app = Express();
app.use(Express.json());
app.use(morgan('dev'));

const chat = new ChatOllama({
    model: "llama3.2:1b",
    temperature: 0
});

app.post("/api/bot", async (req, res) => {
    const { message } = req.body;
    const response = await chat.invoke([new HumanMessage(message)]);
    res.json(response.content);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});