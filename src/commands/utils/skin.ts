import {Command} from "../../types/Command";
import {ApplicationCommandOptionType, MessageFlags} from "discord.js";
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

    run({ interaction, options }) {

        const name = options.getString("name");
        const uuidOption = options.getString("uuid");


        if (!uuidOption && !name) {
            interaction.reply({
                content: "Você precisa inserir um nome ou um UUID!",
                flags: [MessageFlags.Ephemeral],
            });
        }

        if (name) {
            getProfileByName(name)
                .then(response => {

                    if (!response) {
                        interaction.reply({
                            content: "ERRO! Não foi possível buscar o UUID desse jogador. Talvez o jogador não existe!",
                            flags: [MessageFlags.Ephemeral],
                        });
                        return
                    }

                    interaction.reply({
                        components: [SkinComponent(response)],
                        flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                    });

                })
                .catch(() => {
                    interaction.reply({
                        content: "ERRO! Não foi possível buscar o UUID desse jogador. Talvez o jogador não existe!",
                        flags: [MessageFlags.Ephemeral],
                    });
                })
            return
        }

        if (!isValidMinecraftUUID(uuidOption!)) {
            interaction.reply({
                content: "ERRO! UUID inválido!",
                flags: [MessageFlags.Ephemeral],
            });
            return;
        }

        getProfileByUUID(uuidOption!.replace(/-/g, ''))
            .then(response => {

                if (!response) {
                    interaction.reply({
                        content: "ERRO! Não foi possível buscar o UUID desse jogador. Talvez o jogador não existe!",
                        flags: [MessageFlags.Ephemeral],
                    });
                    return
                }

                interaction.reply({
                    components: [SkinComponent(response)],
                    flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                });

            })
            .catch(() => {
                interaction.reply({
                    content: "ERRO! Não foi possível buscar o UUID desse jogador. Talvez o jogador não existe!",
                    flags: [MessageFlags.Ephemeral],
                });
            })
    }



})

function isValidMinecraftUUID(uuid: string): boolean {
    const cleanUUID = uuid.replace(/-/g, '');

    const uuidRegex = /^[0-9a-f]{32}$/i;

    return uuidRegex.test(cleanUUID);
}

async function getProfileByUUID(uuid: string): Promise<{ name: string, id: string } | null> {
    try {
        const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);

        if (!response.ok) {
            throw new Error(`Erro ao buscar UUID: ${response.statusText}`);
        }

        const data = await response.json();

        // @ts-ignore
        return { name: data.name, id: data.id };
    } catch (error) {
        console.error("Erro ao buscar UUID:", error);
        return null;
    }
}

async function getProfileByName(username: string): Promise<{ name: string, id: string } | null> {
    try {
        const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);

        if (!response.ok) {
            throw new Error(`Erro ao buscar UUID: ${response.statusText}`);
        }

        return await response.json() as { name: string, id: string };
    } catch (error) {
        console.error("Erro ao buscar UUID:", error);
        return null;
    }
}