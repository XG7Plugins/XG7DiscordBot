import {Command} from "../../types/discord/Command";
import {ApplicationCommandOptionType, MessageFlags, User} from "discord.js";
import {client, database} from "../../index";
import WarningsRepository from "../../repositories/warnings";
import * as console from "node:console";
import WarningComponent from "../../components/template/warning_display";

export default new Command({
    data: {
        name: "warn",
        description: "Manipula uma infração de alguem",
        defaultMemberPermissions: ["Administrator"],
        dmPermission: false,
        options: [
            {
                name: "add",
                description: "Adiciona um aviso a um usuário",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "Usuário a ser avisado",
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: "reason",
                        description: "Motivo do aviso",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: "perdoar",
                description: "Remove um aviso de um usuário",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "id",
                        description: "ID do aviso a remover",
                        type: ApplicationCommandOptionType.Integer,
                        required: true
                    }
                ]
            },
            {
                name: "ver",
                description: "Ve os avisos de um usuário",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "Usuário a ser visto",
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                ]
            }
        ]
    },
    run: async ({ interaction, options }) => {

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]})

        const sub = options.getSubcommand();

        if (!interaction.memberPermissions?.has("ModerateMembers")) {
            return await interaction.editReply({content: "Você não tem permissão para usar esse comando!"});
        }

        const warningRepo = database.repositories.get("warnings");

        if (sub === "add") {
            const user = options.getUser("user");

            if (!user) {
                return await interaction.editReply({content: "Usuário inexistente!"})
            }

            const member = await client.getMainGuild()?.members.fetch(user.id).catch(() => null);
            if (!member) return interaction.editReply("Usuário não está no servidor.");

            if (member.permissions.has("Administrator")) {
                return interaction.editReply({ content: "Você não pode avisar um administrador!" });
            }

            const reason = options.getString("reason") ?? "Sem motivo informado";
            return addWarning(warningRepo as WarningsRepository, user, reason, interaction)
        }

        if (sub === "perdoar") {
            const id = options.getInteger("id");

            if (!id) return await interaction.editReply({content: "ID inexistente!"})

            removeWarning(warningRepo as WarningsRepository, id, interaction)
        }
        if (sub === "ver") {
            const user = options.getUser("user");

            if (!user) {
                return await interaction.editReply({content: "Usuário inexistente!"})
            }

            seeWarnings(warningRepo as WarningsRepository, user.id, interaction)
        }

    }
});


function addWarning(repo: WarningsRepository, user: User, reason: string, interaction: any) {

    const warningModel = { id: undefined, user_id: user.id, reason: reason }

    repo.insert(warningModel).then(async () => {
        await user.send({
            components: [WarningComponent(warningModel)],
            flags: MessageFlags.IsComponentsV2
        })
        return await interaction.editReply({content: `Usuário punido com sucesso! Motivo: **${warningModel.reason}**`});
    }).catch(async err => {
        console.log(err);
        return await interaction.editReply({content: `Um erro ocorreu ao adicionar o aviso!`})
    });
}

function removeWarning(repo: WarningsRepository, id: number, interaction: any) {

    repo.delete(id).then(async () => {
        return await interaction.editReply({content: `Aviso ${id} removido com sucesso!`,});
    })
        .catch(async err => {
            console.log(err);
            return await interaction.editReply({content: `Um erro ocorreu ao remover o aviso!`})
        });
}

function seeWarnings(repo: WarningsRepository, userId: string, interaction: any) {
    repo.selectAllFrom(userId).then(async (warnings) => {

        if (warnings.length === 0) {
            return interaction.editReply("Esse usuário não possui avisos.");
        }

        let sb = "Avisos de " + interaction.guild?.members.cache.get(userId)?.user.tag + ` **(${warnings.length})**:
`;
        warnings.forEach(warning => {
            sb += `\`ID: ${warning.id} Motivo: ${warning.reason}\`\n`
        });
        return await interaction.editReply({content: sb});

    }).catch(async err => {
        console.log(err);
        return await interaction.editReply({content: `Um erro ocorreu ao remover o aviso!`})
    });
}