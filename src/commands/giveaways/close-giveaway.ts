import {Command} from "../../types/discord/Command";
import {MessageFlags, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder} from "@discordjs/builders";
import {client} from "../../index";

export default new Command({
    build(): SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder {
        return new SlashCommandBuilder()
            .setName("fechar-sorteio")
            .setDescription("Comando de sorteios")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option =>
                option.setName("id")
                    .setDescription("Identificador do sorteio")
                    .setRequired(true)
            )
            .addBooleanOption(option =>
                option
                    .setName("premiar")
                    .setDescription("Premiar os vencedores")
                    .setRequired(true)
            )
    }, async run({interaction, options}): Promise<any> {

        if (!interaction.memberPermissions?.has("Administrator")) {
            return await interaction.editReply({content: "Você não tem permissão para usar esse comando!"});
        }

        const id = options.getString("id", true)
        const reward = options.getBoolean("premiar", true)

        client.finishGiveaway(id, reward).then(async () => {
            await interaction.reply(
                {
                    content: "Sorteio encerrado com sucesso!",
                    flags: MessageFlags.Ephemeral
                }
            )
        })

    }

})