import {BotClient} from "./BotClient";
import {
    ApplicationCommandData,
    CommandInteraction,
    CommandInteractionOptionResolver
} from "discord.js";

interface CommandDeclaration {
    data: ApplicationCommandData;
    isGlobal?: boolean;
    run(props: CommandProps): any;
}

interface CommandProps {
    client: BotClient;
    interaction: CommandInteraction;
    options: CommandInteractionOptionResolver
}

export class Command {

    declaration: CommandDeclaration;

    public constructor(declaration: CommandDeclaration) {
        this.declaration = declaration;
    }

}