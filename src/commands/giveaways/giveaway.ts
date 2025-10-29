import {Command} from "../../types/discord/Command";
import {ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder} from "@discordjs/builders";

export default new Command({
    build(): SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder {
        return new SlashCommandBuilder()
            .setName("sorteio")
            .setDescription("Comando de sorteios")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    }, async run({interaction}): Promise<any> {

        if (!interaction.memberPermissions?.has("Administrator")) {
            return await interaction.editReply({content: "Você não tem permissão para usar esse comando!"});
        }

        const modal = new ModalBuilder()
            .setCustomId("giveaways-modal")
            .setTitle("Criar Sorteio");

        const title = new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Título")
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setRequired(true)

        const description = new TextInputBuilder()
            .setCustomId("description")
            .setStyle(TextInputStyle.Paragraph)
            .setLabel("Descrição")
            .setMinLength(1)
            .setRequired(true)

        const winners = new TextInputBuilder()
            .setCustomId("winners")
            .setLabel("Quantidade de vencedores")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const now = new Date();

        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0"); // mês começa do 0
        const year = now.getFullYear();

        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        const formatted = `${day}/${month}/${year} ${hours}:${minutes}`;

        const end = new TextInputBuilder()
            .setCustomId("time")
            .setLabel("Data de término (DD/MM/AAAA HH:MM)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: " + formatted)
            .setRequired(true)

        modal.addComponents(title, description, winners, end)

        await interaction.showModal(modal)
    }

})