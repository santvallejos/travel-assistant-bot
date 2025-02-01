import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { Runnable } from "@langchain/core/runnables";
import { ChatOllama } from "@langchain/ollama";

//Agente experto que ayuda a planificar un viaje y colabora con otros asistentes.
export async function createAgent({
  llm,
  tools,
  systemMessage,
}: {
  llm: ChatOllama;
  tools: StructuredTool[];
  systemMessage: string;
}): Promise<Runnable> {
  const toolNames = tools.map((tool) => tool.name).join(", ");


  let prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an artificial intelligence assistant that assists users in planning a trip and also collaborates with other assistants." +
      " Use the provided tools to progress towards answering the question." +
      " If you are unable to fully answer, that's OK, another assistant with different tools " +
      " will help where you left off. Execute what you can to make progress." +
      " If you or any of the other assistants have the final answer or deliverable," +
      " prefix your response with FINAL ANSWER so the team knows to stop." +
      " You have access to the following tools: {tool_names}.\n{system_message}",
    ],
    new MessagesPlaceholder("messages"),
  ]);
  prompt = await prompt.partial({
    system_message: systemMessage,
    tool_names: toolNames,
  });

  return prompt.pipe(llm.bind({ tools: tools }));
}