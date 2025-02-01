import Express from "express";
import dotenv  from "dotenv";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { START, StateGraph, MessagesAnnotation, MemorySaver, Annotation, END } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

var morgan = require('morgan');

dotenv.config();
const app = Express();
app.use(Express.json());
app.use(morgan('dev'));

const model = new ChatOllama({
    model: "llama3.2:1b",
    temperature: 0
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});