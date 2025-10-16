import {BotClient} from "./types/BotClient";
import config from "./types/config.json";

export * from "colors";

const client = new BotClient()

client.init();

export { client, config };

client.on("clientReady", () => console.log("Bot is ready!".green))