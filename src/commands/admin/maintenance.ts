import {Command} from "../../types/discord/Command";
import {MessageFlags} from "discord.js";
import {client} from "../../index";

export default new Command({
    data: {
        name: "toggle-maintenance",
        description: "Liga ou desliga a manutenção do bot",
        defaultMemberPermissions: ["Administrator"],
        dmPermission: false
    },
    run: async ({ interaction }) => {

        if (!interaction.memberPermissions?.has(["Administrator"])) {
            return await interaction.reply({
                content: "Você não tem permissão para usar esse comando!",
                flags: [MessageFlags.Ephemeral],
            });
        }

        client.maintenance = !client.maintenance

        client.onToggleMaintenance();

        await interaction.reply({
            content: "Manutenção " + (client.maintenance ? "ativada!" : "desativada!"),
            flags: [MessageFlags.Ephemeral]
        })


    }
});