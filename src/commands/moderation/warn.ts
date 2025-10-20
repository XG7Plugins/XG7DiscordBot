import {Command} from "../../types/discord/Command";
import {ApplicationCommandOptionType, MessageFlags, PermissionsBitField} from "discord.js";
import {database} from "../../index";
import WarningsRepository from "../../repositories/warnings";
import {WarningModel} from "../../types/database/models/WarningModel";
import * as console from "node:console";

export default new Command({
    data: {
        name: "warn",
        description: "Manipula uma infração de alguem",
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
                name: "remove",
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
            }
        ]
    },
    run: ({ interaction, options }) => {

        const sub = options.getSubcommand();

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({
                content: "Você não tem permissão para usar esse comando!",
                flags: [MessageFlags.Ephemeral]
            });
        }

        const warningRepo = database.repositories.get("warnings");

        if (sub === "add") {
            const user = options.getUser("user");

            if (!user) {
                return interaction.reply({
                    content: "Usuário inexistente!",
                    flags: [MessageFlags.Ephemeral]
                })
            }

            const reason = options.getString("reason") ?? "Sem motivo informado";
            return addWarning(warningRepo as WarningsRepository, { id: undefined, user_id: user.id, reason: reason }, interaction)
        }

        if (sub === "remove") {
            const id = options.getInteger("id");

            if (!id) {
                return interaction.reply({
                    content: "ID inexistente!",
                    flags: [MessageFlags.Ephemeral]
                })
            }

            removeWarning(warningRepo as WarningsRepository, id, interaction)
        }

    }
});


function addWarning(repo: WarningsRepository, warningModel: WarningModel, interaction: any) {
    repo.insert(warningModel).then(() => {
        interaction.reply({
            content: `Usuário punido com sucesso! Motivo: **${warningModel.reason}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }).catch(err => {
        console.log(err);
        interaction.reply({

            content: `Um erro ocorreu ao adicionar o aviso!`,
            flags: [MessageFlags.Ephemeral]
        })
    });
}

function removeWarning(repo: WarningsRepository, id: number, interaction: any) {

    repo.delete(id).then(() => {
        interaction.reply({
            content: `Aviso ${id} removido com sucesso!`,
            flags: [MessageFlags.Ephemeral]
        });
    })
        .catch(err => {
            console.log(err);
            interaction.reply({
                content: `Um erro ocorreu ao remover o aviso!`,
                flags: [MessageFlags.Ephemeral]
            })
        });
}