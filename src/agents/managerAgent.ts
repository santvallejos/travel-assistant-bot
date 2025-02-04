import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";
import type { Runnable } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";

export async function createManagerAgent({
    llm,
    systemMessage = "",
}: {
    llm: ChatOllama,
    systemMessage?: string,
}): Promise<Runnable> {
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are an agent manager in charge of coordinating two other assistants: one specialized in destination recommendations and another in weather queries" +
            "Your task is to receive the user's query, decide (or request information) from the corresponding agents, and synthesize their answers in a final message" +
            "Make sure the message is clear, friendly and intuitive, and not too long. Whenever you have the final answer, start your message with 'FINAL ANSWER'." +
            systemMessage,
        ],
        new MessagesPlaceholder("messages"),
    ]);

    return prompt.pipe(llm.bind({}));
}