import {BotClient} from "./types/BotClient";
import config from "./data/config.json";
import {DatabasePool} from "./types/Database";

export * from "colors";

const client = new BotClient()
client.init();

const database = new DatabasePool()
database.init()

export { client, config, database };

client.on("clientReady", () => console.log("Bot is ready!".green))