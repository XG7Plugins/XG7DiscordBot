import {BotClient} from "./types/BotClient";
import config from "./data/config.json";
import {DatabasePool} from "./types/Database";
import fileS from "fs";
import path from "path";

export * from "colors";

const client = new BotClient()
client.init();

const database = new DatabasePool()

const STATE_PATH = path.resolve(process.cwd(), "data", "state.json");

let state = JSON.parse(fileS.readFileSync(STATE_PATH, "utf-8"));

export function saveState() {
    try {
        fileS.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
        console.error("Erro ao salvar state.json:", err);
    }
}


export { client, config, database, state };

client.on("clientReady", () => {
    database.init()
    console.log("Bot is ready!".green)
})