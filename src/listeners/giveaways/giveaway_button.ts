import {Listener} from "../../types/discord/Event";
import {client, saveState, state} from "../../index";
import {getOrCreateProfile} from "../../repositories/profile";
import {MessageFlags} from "discord.js";

export default new Listener({
    type: "interactionCreate",
    async handle(interaction): Promise<any> {

        if (!interaction.isButton()) return

        const id = interaction.customId;

        if (!id.startsWith("giveaway_")) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral});

        // Divide o ID em partes
        const [, giveawayID] = id.split("_");

        const giveaway = state.giveaways.find((g: {id: string}) => g.id === giveawayID);

        const guild = client.getMainGuild();

        if (!guild) return

        await guild.members.fetch();

        if (!giveaway) {
            await interaction.editReply({content: "Erro ao encontrar o giveaway!"});
            return;
        }


        const user = interaction.user;

        if (user.bot) return;

        const member = guild.members.cache.get(user.id)
        || await guild.members.fetch(user.id).catch(() => null);

        if (!member) return;

        getOrCreateProfile(user.id).then(async profile => {

            if (!profile) return await interaction.editReply("Perfil não encontrado.");

            if (giveaway.entries.includes(profile.id)) {
                return await interaction.editReply("❌Você já está participando desse sorteio!");
            }

            let entries = profile.giveawayEntries;

            if (member.roles.cache.hasAny("1235570566778327152", "1328930300364849203", "1424094092304056492")) {
                entries *= 2
            }

            for (let i = 0; i < entries; i++) {
                giveaway.entries.push(user.id)
            }

            await saveState()

            await interaction.editReply("Você entrou no sorteio com " + entries + " entradas!");

        });



    }

})