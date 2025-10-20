import { Command } from "../../types/Command";
import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import SkinComponent from "../../components/template/skin";

export default new Command({
    data: {
        name: "skin",
        description: "Veja a skin de um player",
        options: [
            {
                name: "name",
                description: "Nome do Player",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "uuid",
                description: "UUID do player",
                type: ApplicationCommandOptionType.String,
                required: false,
            }
        ]
    },
    isGlobal: true,

    async run({ interaction, options }) {
        const name = options.getString("name");
        const uuidOption = options.getString("uuid");

        if (!uuidOption && !name) {
            return interaction.reply({
                content: "❌ Você precisa inserir um nome **ou** um UUID!",
                flags: [MessageFlags.Ephemeral],
            });
        }

        try {
            let response: { name: string; id: string } | null = null;

            if (name) {
                response = await getProfileByName(name);
            } else {
                if (!isValidMinecraftUUID(uuidOption!)) {
                    return interaction.reply({
                        content: "❌ UUID inválido!",
                        flags: [MessageFlags.Ephemeral],
                    });
                }
                response = await getProfileByUUID(uuidOption!.replace(/-/g, ""));
            }

            if (!response) {
                return interaction.reply({
                    content: "⚠️ Não foi possível buscar o jogador. Verifique se ele existe!",
                    flags: [MessageFlags.Ephemeral],
                });
            }

            await interaction.reply({
                components: [SkinComponent(response)],
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            });
        } catch (err) {
            console.error("Erro ao executar comando /skin:", err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ Ocorreu um erro inesperado ao buscar o jogador.",
                    flags: [MessageFlags.Ephemeral],
                });
            }
        }
    },
});

function isValidMinecraftUUID(uuid: string): boolean {
    const cleanUUID = uuid.replace(/-/g, '');
    return /^[0-9a-f]{32}$/i.test(cleanUUID);
}

async function getProfileByUUID(uuid: string): Promise<{ name: string, id: string } | null> {
    try {
        const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        if (!response.ok) return null;
        const data = await response.json();
        // @ts-ignore
        return { name: data.name, id: data.id };
    } catch {
        return null;
    }
}

async function getProfileByName(username: string): Promise<{ name: string, id: string } | null> {
    try {
        const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        if (!response.ok) return null;
        return await response.json() as { name: string, id: string };
    } catch {
        return null;
    }
}
