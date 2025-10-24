import {ButtonHandler} from "../../types/discord/Components";
import {ActionRowBuilder, ButtonInteraction, MessageFlags, UserSelectMenuBuilder} from "discord.js";

export default class AddMemberButton implements ButtonHandler{

    id = "add_member_button";
    run(interaction: ButtonInteraction): any {

        interaction.reply({
            components: [
                new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(
                    new UserSelectMenuBuilder()
                        .setCustomId("add_member")
                        .setPlaceholder("Selecione os membros para adicionar ao ticket")
                        .setRequired(true)
                        .setMaxValues(5)
                        .setMinValues(1)
                )
            ],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        })

    }


}