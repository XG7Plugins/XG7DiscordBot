import {Listener} from "../../types/discord/Event";
import {getOrCreateProfile} from "../../repositories/profile";
import {client} from "../../index";

export default new Listener({
    type: "guildMemberAdd",
    handle: async (member) => {

        const mainGuild = client.getMainGuild();

        if (!mainGuild) return;

        if (member.guild.id !== mainGuild.id) return;

        await getOrCreateProfile(member.id)
    }
})