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

        const afkChannelsId = [
            config.channels.afk_channel,
            config.channels.lofi_channel
        ];

        const profile = await getOrCreateProfile(userId);

        if (!profile)  return;

        const oldChannel = oldState.channel;
        const newChannel = newState.channel;

        if (oldChannel && oldChannel.guild.id !== guild?.id) return;

        if (newChannel && newChannel.guild.id !== guild?.id) return;

        const member = newState.member;

        if (!member) return;

        if (member.user.bot) return;

        const award = async (aID: AchievementID) => {

            const achievement = getAchievement(aID);

            if (achievement) {
                await awardAchievementToProfile(member, undefined, profile, achievement);
            }
        };

        await award(AchievementID.EntreEmCall);

        const enterCall =
            (!oldChannel || afkChannelsId.includes(oldChannel.id)) &&
            newChannel && !afkChannelsId.includes(newChannel.id);

        if (enterCall) activeTimes.set(userId, Date.now());
        else await saveTime(member, profile, true);


    }
});


export async function saveTime(member: GuildMember, profile: Profile, deleteFromMap?: boolean) {

    const award = async (aID: AchievementID) => {
        const achievement = getAchievement(aID);

        if (achievement) {
            await awardAchievementToProfile(member, undefined, profile, achievement);
        }
    };

    const start = activeTimes.get(profile.id);

    if (!start) return;

    const now = Date.now();
    const time = Math.floor(now - start);

    profile.voiceTime += time;

    const minutes = time / 60000;

    await addXP(member, undefined, profile, minutes * 77);
    await updateProfile(profile.id, profile);

    const MIN_10 = 10 * 60 * 1000;       // 10 minutos
    const HOUR_2 = 2 * 60 * 60 * 1000;   // 2 horas
    const HOUR_6 = 6 * 60 * 60 * 1000;   // 6 horas
    const HOUR_12 = 12 * 60 * 60 * 1000;
    const HOUR_24 = 24 * 60 * 60 * 1000; // 24 horas
    const HOUR_36 = 36 * 60 * 60 * 1000;
    const HOUR_48 = 48 * 60 * 60 * 1000;
    const WEEK_1 = 7 * 24 * 60 * 60 * 1000; // 1 semana


    if (profile.voiceTime >= MIN_10) await award(AchievementID.Interaja);
    if (profile.voiceTime >= HOUR_2) await award(AchievementID.Discurso);
    if (profile.voiceTime >= HOUR_6) await award(AchievementID.Palestrante);
    if (profile.voiceTime >= HOUR_24) await award(AchievementID.SoMaisUma);
    if (profile.voiceTime >= WEEK_1) await award(AchievementID.AquiEMinhaCasa);

    if (time >= HOUR_12) await award(AchievementID.MeioDia);
    if (time >= HOUR_24) await award(AchievementID.Dormiu);
    if (time >= HOUR_36) await award(AchievementID.Desocupado);
    if (time >= HOUR_48) await award(AchievementID.JaTocouNaGrama);

    if (deleteFromMap) activeTimes.delete(profile.id);
    else activeTimes.set(profile.id, Date.now());
}