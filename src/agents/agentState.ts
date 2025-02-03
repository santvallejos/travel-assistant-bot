import { Annotation } from "@langchain/langgraph"
import { BaseMessage } from "@langchain/core/messages"

export const AgentState = Annotation.Root({
        messages: Annotation<BaseMessage[]>({
            reducer: (x, y) => x.concat(y),
    }),
        sender: Annotation<string>({
            reducer: (x, y) => y ?? x ?? "user",
            default: () => "user",
    }),
})