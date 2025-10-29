import {ModalSubmitHandler} from "../../types/discord/Components";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ModalSubmitInteraction,
    TextChannel
} from "discord.js";
import {saveState, state} from "../../index";

export default class CreateGiveaway implements ModalSubmitHandler {

    id = "giveaways-modal"

    async run(interaction: ModalSubmitInteraction): Promise<any> {
        const title = interaction.fields.getTextInputValue("title");
        const description = interaction.fields.getTextInputValue("description");
        const timeStr = interaction.fields.getTextInputValue("time");
        const winnersStr = interaction.fields.getTextInputValue("winners");

        const winners = parseInt(winnersStr, 10);
        if (isNaN(winners) || winners <= 0) {
            return interaction.reply({
                content: "❌ O número de vencedores deve ser um número inteiro positivo!",
                ephemeral: true
            });
        }
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/;
        const match = timeStr.match(dateRegex);

        if (!match) {
            return interaction.reply({
                content: "❌ A data deve estar no formato **DD/MM/AAAA HH:MM**. Exemplo: `28/10/2025 20:30`",
                ephemeral: true
            });
        }

        const [ , day, month, year, hour, minute ] = match.map(Number);

        const targetDate = new Date(year, month - 1, day, hour, minute);

        if (isNaN(targetDate.getTime())) {
            return interaction.reply({
                content: "❌ A data informada é inválida!",
                ephemeral: true
            });
        }

        if (targetDate.getTime() <= Date.now()) {
            return interaction.reply({
                content: "❌ A data precisa estar no futuro!",
                ephemeral: true
            });
        }

        await interaction.guild?.channels.fetch("channelID")
            .then(channel => channel as TextChannel)
            .then(async channel => {
                if (!channel) return await interaction.reply("Canal não encontrado!");

                const day = String(targetDate.getDate()).padStart(2, "0");
                const month = String(targetDate.getMonth() + 1).padStart(2, "0"); // mês começa do 0
                const year = targetDate.getFullYear();

                const hours = String(targetDate.getHours()).padStart(2, "0");
                const minutes = String(targetDate.getMinutes()).padStart(2, "0");

                const formatted = `${day}/${month}/${year} ${hours}:${minutes}`;

                const message = await channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(title)
                            .setDescription(description)
                            .setColor("#00FFFF")
                            .setThumbnail("https://imgs.search.brave.com/t-1ucU_rF-Fxb_XoKpsAMgW7_q59d2TZFWRw0qpkPig/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWcu/aWNvbnM4LmNvbS8_/c2l6ZT0xMjAwJmlk/PUQ1cnpBUjRkRTZ4/RSZmb3JtYXQ9anBn")
                            .setFooter({ text: `Término: ${formatted}` })
                    ],
                    content: "<@&1432574364716499038>"
                });

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setEmoji("🎟️")
                        .setLabel("Entrar")
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(`giveaway_${message.id}`)
                );

                await message.edit({ components: [row] });

                const giveaway = {
                    id: message.id,
                    title: title,
                    description: description,
                    end: targetDate.getTime(),
                    winners: winners,
                    entries: []
                }

                state.giveaways.push(giveaway);

                await saveState()

                await interaction.reply("Sorteio criado com sucesso!")

            });

    }

}