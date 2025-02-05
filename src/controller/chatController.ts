import Express from "express";
import { HumanMessage } from "@langchain/core/messages";
import { conversationState, graph } from "../graph/graph";

export const chatController = async (req: Express.Request, res: Express.Response) => {
    try {
        const userInput = req.body.message;
    
        // Crea un nuevo estado para cada consulta
        const conversationState = {
            messages: [new HumanMessage({ content: userInput, name: "user" })],
            sender: "user",
        };
    
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
}