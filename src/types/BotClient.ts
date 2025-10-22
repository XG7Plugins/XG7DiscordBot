import {
    ApplicationCommandDataResolvable,
    BitFieldResolvable,
    Client, ClientEvents,
    Collection,
    GatewayIntentsString,
    IntentsBitField,
    Partials, REST,
    Routes
} from "discord.js";
import {client, config} from "..";
import 'dotenv/config';
import {Command} from "./discord/Command";
import fileS from "fs";
import path from "path";
import {Listener} from "./discord/Event";
import {ComponentHandler} from "./discord/Components";
import * as console from "node:console";
import {clearInterval} from "node:timers";

export * from "colors";

export class BotClient extends Client {

    public commands: Collection<string, Command> = new Collection();
    public componentHandlers: Collection<string, ComponentHandler<any>> = new Collection();

    public maintenance: boolean = false;

    statusTask: NodeJS.Timeout | null = null;

    constructor() {
        super({
            intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<GatewayIntentsString, any>,
            partials: [
                Partials.Channel, Partials.Message, Partials.Reaction, Partials.GuildMember, Partials.User,
                Partials.GuildScheduledEvent, Partials.ThreadMember, Partials.GuildScheduledEvent
            ]
        });
    }

    public init() {
        this.registerComponentsHandlers();
        this.registerEvents();
        this.registerCommands();
        this.once("clientReady", () => this.initStatusChange())
        this.login(process.env.BOT_TOKEN).then(() => console.log("Bot logado com sucesso!".rainbow));

    }

    private registerCommands() {

        const guildCommands: Array<ApplicationCommandDataResolvable> = [];
        const globalCommands: Array<ApplicationCommandDataResolvable> = [];

        fileS.readdirSync(path.join(__dirname, "..",  "commands")).forEach((cmdPath) => {

            fileS.readdirSync(path.join(__dirname, "..", "commands", cmdPath))
                .filter(file => file.endsWith(".js") || file.endsWith(".ts"))
                .forEach(async (cmdFile) => {

                    const command: Command = (await import (`../commands/${cmdPath}/${cmdFile}`))?.default

                    this.commands.set(command.declaration.data.name, command);

                    if (command.declaration.componentHandlers) {
                        this.componentHandlers.set(command.declaration.componentHandlers[0].id, command.declaration.componentHandlers[0]);
                    }

                    (command.declaration.isGlobal ? globalCommands : guildCommands).push(command.declaration.data);
                })
        })

        this.once("clientReady", async () => {
            const rest = new REST().setToken(process.env.BOT_TOKEN ?? "");

            try {

                await rest.put(Routes.applicationGuildCommands(config.bot_id, config.main_guild), {body: guildCommands});
                await rest.put(Routes.applicationCommands(config.bot_id), {body: globalCommands});

                console.log(`Foram recarregados ${globalCommands.length + guildCommands.length} comandos (/).`.blue);

            } catch (error) {
                console.error(error);
            }
        })
    }

    private registerEvents() {
        fileS.readdirSync(path.join(__dirname, "..",  "listeners")).forEach((listenerPath) => {
            fileS.readdirSync(path.join(__dirname, "..",  "listeners", listenerPath))
                .filter(file => file.endsWith(".js") || file.endsWith(".ts"))
                .forEach(async (listenerFile) => {

                const listener: Listener<keyof ClientEvents> = (await import (`../listeners/${listenerPath}/${listenerFile}`))?.default;

                try {
                    listener.options.once ? this.once(listener.options.type, listener.options.handle) : this.on(listener.options.type, listener.options.handle);
                } catch (err) {
                    console.log(err)
                }

            })
        })

        console.log("Eventos registrados com sucesso!".blue)
    }

    private registerComponentsHandlers() {
        fileS.readdirSync(path.join(__dirname, "..", "components", "handlers"))
            .filter(file => file.endsWith(".js") || file.endsWith(".ts"))
            .forEach(async (handlersFile) => {

                const handlers: ComponentHandler<any> = (await import (`../components/handlers/${handlersFile}`))?.default;

                try {
                    this.componentHandlers.set(handlers.id, handlers);
                } catch (err) {
                    console.log(err)
                }
            })

        console.log("Foram registrados " + this.componentHandlers.size + " manipuladores de componentes".blue)
    }

    initStatusChange() {
        if (this.maintenance) {
            if (this.statusTask) clearInterval(this.statusTask);
            client.user?.setPresence({
                status: "idle",
                activities: [{ name: "🛠️ EM MANUTENÇÃO", type: 4 }]
            })
            return
        }

        let index = 0;

        this.statusTask = setInterval(() => {

            if (index >= config.changing_status.length) {
                index = 0;
            }

            let status = config.changing_status[index]

            client.user?.setPresence({
                status: status.status as "online" | "idle" | "dnd" | "invisible",
                activities: [{ name: status.name, type: status.type }]
            })

            index++;

        }, 60 * 1000)
    }

    getMainGuild() {
        return this.guilds.cache.get(config.main_guild);
    }

    onToggleMaintenance() {

        this.initStatusChange()

        //TODO
    }


}