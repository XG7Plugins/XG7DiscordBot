import {AnySelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction} from "discord.js";


export interface ComponentHandler<Interaction> {
    id: string;
    run(interaction: Interaction): void;
}

export type ButtonHandler = ComponentHandler<ButtonInteraction>;
export type SelectMenuHandler = ComponentHandler<AnySelectMenuInteraction>;
export type ModalSubmitHandler = ComponentHandler<ModalSubmitInteraction>;

