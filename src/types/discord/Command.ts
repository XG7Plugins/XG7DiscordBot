import {BotClient} from "../BotClient";
import {
    CommandInteraction,
    CommandInteractionOptionResolver, SlashCommandBuilder
} from "discord.js";
import {SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder} from "@discordjs/builders";

interface CommandDeclaration {
    build(): SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
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