import {Command} from "../../types/discord/Command";
import {MessageFlags, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {client, state, saveState} from "../../index";
import {InteractionContextType} from "discord-api-types/v10";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("toggle-maintenance")
            .setDescription("Liga ou desliga a manutenção do bot")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setContexts(InteractionContextType.Guild)
    }
    ,
    run: async ({ interaction }) => {

        if (!interaction.memberPermissions?.has(["Administrator"])) {
            return await interaction.reply({
                content: "Você não tem permissão para usar esse comando!",
                flags: [MessageFlags.Ephemeral],
            });
        }

        state.maintenance = !state.maintenance;

        client.onToggleMaintenance();

        saveState();

        await interaction.reply({
            content: "Manutenção " + (state.maintenance ? "ativada!" : "desativada!"),
            flags: [MessageFlags.Ephemeral]
        })


    }
});