import { Command } from "../../types/discord/Command";
import {MessageFlags, SlashCommandBuilder} from "discord.js";
import SkinComponent from "../../components/template/skin";
import {MinecraftUser} from "../../types/internet/MinecraftUser";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("skin")
            .setDescription("Veja a skin de um player")
            .addStringOption(option =>
                option
                    .setName("name")
                    .setDescription("Nome do Player")
                    .setRequired(false)
            )
            .addStringOption(option =>
                option
                    .setName("uuid")
                    .setDescription("UUID do player")
                    .setRequired(false)
            );
    },

    async run({ interaction, options }) {

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const name = options.getString("name");
        const uuidOption = options.getString("uuid");

        if (!uuidOption && !name) {
            return await interaction.editReply({content: "❌ Você precisa inserir um nome **ou** um UUID!"});
        }

        try {
            let response: MinecraftUser | null = null;

            if (name) {
                response = await getProfileByName(name);
            } else {
                if (!isValidMinecraftUUID(uuidOption!)) {
                    return await interaction.reply({
                        content: "❌ UUID inválido!",
                        flags: [MessageFlags.Ephemeral],
                    });
                }
                response = await getProfileByUUID(uuidOption!.replace(/-/g, ""));
            }

            if (!response) {
                return await interaction.editReply({content: "⚠️ Não foi possível buscar o jogador. Verifique se ele existe!"});
            }

            await interaction.followUp({
                components: [SkinComponent(response)],
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            });
        } catch (err) {
            console.error("Erro ao executar comando /skin:", err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.editReply({content: "❌ Ocorreu um erro inesperado ao buscar o jogador."});
            }
        }
    },
});

function isValidMinecraftUUID(uuid: string): boolean {
    const cleanUUID = uuid.replace(/-/g, '');
    return /^[0-9a-f]{32}$/i.test(cleanUUID);
}

async function getProfileByUUID(uuid: string): Promise<MinecraftUser | null> {
    try {
        const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data as MinecraftUser;
    } catch {
        return null;
    }
}

async function getProfileByName(username: string): Promise<MinecraftUser | null> {
    try {
        const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        if (!response.ok) return null;
        return await response.json() as MinecraftUser;
    } catch {
        return null;
    }
}
