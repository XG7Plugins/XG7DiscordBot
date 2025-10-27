import { Listener } from "../../types/discord/Event";
import {addXP, getOrCreateProfile, updateProfile} from "../../repositories/profile";
import {client, config} from "../../index";
import {awardAchievementToProfile} from "../../repositories/profile_achievements";
import {AchievementID, getAchievement} from "../../types/database/models/Achievements";
import {Profile} from "../../types/database/models/Profile";
import {GuildMember} from "discord.js";

const activeTimes: Map<string, number> = new Map();


export default new Listener({
    type: "voiceStateUpdate",
    async handle(oldState, newState) {

        const userId = newState.id;

        const guild = client.getMainGuild();

        const afkChannelId = config.channels.afk_channel;

        const profile = await getOrCreateProfile(userId)

        if (!profile) return;

        const oldChannel = oldState.channel;
        const newChannel = newState.channel;

        if (oldChannel && oldChannel.guild.id !== guild?.id) return;
        if (newChannel && newChannel.guild.id !== guild?.id) return;

        const member = newState.member;

        if (!member) return;
        if (member.user.bot) return;

        const award = async (aID: AchievementID) => {
            const achievement = getAchievement(aID);
            if (achievement)
                await awardAchievementToProfile(member, profile, achievement);
        };


        await award(AchievementID.EntreEmCall)

        if ((!oldChannel || oldChannel.id === afkChannelId) && newChannel?.id !== afkChannelId) activeTimes.set(userId, Date.now());

        if (oldChannel && (!newChannel || newChannel?.id === afkChannelId)) {

            await saveTime(member, profile, true);
        }

    }
});


export async function saveTime(member: GuildMember, profile: Profile, deleteFromMap?: boolean) {

    const award = async (aID: AchievementID) => {
        const achievement = getAchievement(aID);
        if (achievement)
            await awardAchievementToProfile(member, profile, achievement);
    };

    const start = activeTimes.get(profile.id);

    if (!start) return;

    const time = Math.floor(Date.now() - start);

    profile.voiceTime += time;


    const minutes = time / 60000;

    await addXP(member, profile, minutes * 10)

    await updateProfile(profile.id, profile)

    const MIN_10 = 10 * 60 * 1000;       // 10 minutos
    const HOUR_2 = 2 * 60 * 60 * 1000;   // 2 horas
    const HOUR_6 = 6 * 60 * 60 * 1000;   // 6 horas
    const HOUR_24 = 24 * 60 * 60 * 1000; // 24 horas
    const WEEK_1 = 7 * 24 * 60 * 60 * 1000; // 1 semana
    const HOUR_24_CONT = 24 * 60 * 60 * 1000; // tempo contínuo
    const HOUR_48_CONT = 48 * 60 * 60 * 1000;

    if (profile.voiceTime >= MIN_10) await award(AchievementID.PegandoALabia);
    if (profile.voiceTime >= HOUR_2) await award(AchievementID.Palestrante);
    if (profile.voiceTime >= HOUR_6) await award(AchievementID.FilaDoSUS);
    if (profile.voiceTime >= HOUR_24) await award(AchievementID.Dormi);
    if (profile.voiceTime >= WEEK_1) await award(AchievementID.AquiEMinhaCasa);

    if (time >= HOUR_24_CONT) await award(AchievementID.Desocupado);
    if (time >= HOUR_48_CONT) await award(AchievementID.JaTocouNaGrama);

    if (deleteFromMap) activeTimes.delete(profile.id);
    else activeTimes.set(profile.id, Date.now())
}