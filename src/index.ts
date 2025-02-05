import Express from "express";
import dotenv from "dotenv";
import { conversationState} from "./graph/graph";
import { chatController } from "./controller/chatController";

var morgan = require('morgan');

dotenv.config();
const app = Express();
app.use(Express.json());
app.use(morgan('dev'));

//Controllador de metodo POST
app.post("/api/chat", chatController);

app.get("/history", (req, res) => {
    res.json({ history: conversationState.messages });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});