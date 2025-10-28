import {Repository} from "../types/database/Repository";
import {Profile} from "../types/database/models/Profile";
import {client, database} from "../index";
import console from "node:console";
import {AttachmentBuilder, GuildMember, Snowflake} from "discord.js";
import {AchievementID, getAchievement, getAchievementByNumber} from "../types/database/models/Achievements";
import {awardAchievementToProfile} from "./profile_achievements";
import * as fs from "node:fs";
import {createCanvas, loadImage, registerFont} from "canvas";
import {writeFileSync} from "fs";

export default class ProfileRepository implements Repository<string, Profile> {
    table = "profiles";

    async createTable() {
        return await database.query(`
            CREATE TABLE IF NOT EXISTS ${this.table}
            (
                id
                VARCHAR
            (
                20
            ) PRIMARY KEY,
                bio TEXT,
                giveawayEntries BIGINT DEFAULT 0,
                xp BIGINT DEFAULT 0,
                messages BIGINT DEFAULT 0,
                voiceTime BIGINT DEFAULT 0,
                digitGameVictories BIGINT DEFAULT 0,
                profileBgPath TEXT
                )
        `, []).then(async result => {
            console.log("Tabela profiles criada com sucesso!".green);

            const guild = client.getMainGuild();
            if (!guild) return console.log("Guild principal não encontrada.");

            await guild.members.fetch();
            const members = guild.members.cache.filter(m => !m.user.bot);

            const [rows] = await database.query(`SELECT id FROM profiles`, []);
            const existingIds = new Set(rows.map((r: any) => r.id));

            const newMembers = members.filter(m => !existingIds.has(m.id));

            if (newMembers.size > 0) {

                for (const member of newMembers.values()) {
                    await this.insert({
                        id: member.id,
                        bio: "",
                        giveawayEntries: 1,
                        xp: 0,
                        messages: 0,
                        voiceTime: 0,
                        profileBgPath: `./src/assets/images/profile_bgs/${Math.floor(Math.random() * getProfileBGCount()) + 1}.jpg`,
                        digitGameVictories: 0,
                        profileAchievements: []
                    })
                }
                console.log(`Inseridos ${newMembers.size} novos perfis.`);
            } else {
                console.log("Nenhum novo perfil para inserir.");
            }
        })
            .catch(err => console.log(err));
    }
    insert(value: Profile): Promise<void> {
        return database.query(
            `INSERT INTO ${this.table} (id, bio, xp, messages, voiceTime, digitGameVictories, profileBgPath)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [value.id, value.bio, value.xp, value.messages, value.voiceTime, value.digitGameVictories, value.profileBgPath]
        );
    }

    async select(id: string): Promise<Profile | null> {
        const results = await database.query(
            `
                SELECT
                    p.id AS profile_id,
                    p.bio,
                    p.giveawayEntries,
                    p.xp,
                    p.messages,
                    p.voiceTime,
                    p.profileBgPath,
                    p.digitGameVictories,
                    pa.achievement_id,
                    pa.obtained_at
                FROM ${this.table} p
                         LEFT JOIN profile_achievements pa ON pa.profile_id = p.id
                WHERE p.id = ?
            `,
            [id]
        );

        const rows = results[0];

        if (!rows || rows.length === 0) return null;

        const profile: Profile = {
            id: rows[0].profile_id,
            bio: rows[0].bio,
            giveawayEntries: rows[0].giveawayEntries,
            xp: rows[0].xp,
            profileBgPath: rows[0].profileBgPath,
            messages: rows[0].messages,
            voiceTime: rows[0].voiceTime,
            digitGameVictories: rows[0].digitGameVictories,
            profileAchievements: []
        };

        for (const row of rows) {
            if (row.achievement_id) {
                profile.profileAchievements.push({
                    profile_id: row.profile_id,
                    achievement: getAchievementByNumber(row.achievement_id as number),
                    obtainedAt: new Date(row.obtained_at)
                });
            }
        }

        return profile;
    }

    update(value: Profile): Promise<Profile> {
        return database.query(
            `UPDATE ${this.table}
             SET bio = ?, xp = ?, giveawayEntries = ?, messages = ?, voiceTime = ?, digitGameVictories = ?, profileBgPath = ?
             WHERE id = ?`,
            [value.bio, value.xp, value.giveawayEntries, value.messages, value.voiceTime, value.digitGameVictories, value.profileBgPath, value.id]
        );
    }

    delete(id: string): Promise<void> {
        return database.query(
            `DELETE FROM ${this.table} WHERE id = ?`,
            [id]
        );
    }

    async exists(id: string): Promise<boolean> {
        try {
            const results = await database.query(
                `SELECT *
                 FROM ${this.table}
                 WHERE id = ?`,
                [id]
            );
            return results[0].length > 0;
        } catch (err) {
            return false;
        }
    }

    async getLeaderboard(type: "messages" | "xp" | "voice", limit: number = 10): Promise<{id: string, point: number}[]> {

        const translatedType = type === "voice" ? "voiceTime" : type;

        const [rows] = await database.query(
            `SELECT id, ${translatedType}
         FROM ${this.table}
         ORDER BY ${translatedType} DESC
         LIMIT ?`,
            [limit]
        );
        return rows.map((r: any) => ({ id: r.id, point: Number(r[translatedType]) }));
    }

    async getUserPosition(userId: string): Promise<{position: number, xp: number}> {
        const [rows] = await database.query(
            `SELECT id, xp
         FROM ${this.table}
         ORDER BY xp DESC`
        ,[]);

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].id === userId) {
                return {
                    position: i + 1,
                    xp: Number(rows[i].xp)
                };
            }
        }

        return {position: -1, xp: -1};
    }
}

export async function getOrCreateProfile(id: string): Promise<Profile | null> {
    const repo = database.repositories.get("profiles") as ProfileRepository;
    if (!repo) return null;

    return repo.exists(id)
        .then(async b => {
            if (b) return repo.select(id);
            const profile = {
                id: id,
                bio: "",
                giveawayEntries: 1,
                xp: 0,
                messages: 0,
                profileBgPath: `./src/assets/images/profile_bgs/${Math.floor(Math.random() * getProfileBGCount()) + 1}.jpg`,
                voiceTime: 0,
                digitGameVictories: 0,
                profileAchievements: []
            };

            await repo.insert(profile);
            return profile;
        }).catch(err => {
            console.log(err)
            return null;
        })
}

export async function updateProfile(id: string, changes: Partial<Profile>): Promise<Profile | null> {
    const repo = database.repositories.get("profiles") as ProfileRepository;
    if (!repo) return null;

    return repo.select(id)
        .then(profile => {
            if (!profile) return null;
            return repo.update({
                ...profile,
                ...changes
            });
        }).catch(err => {
            console.log(err)
            return null;
        })
}

export async function addXP(member: GuildMember, profile: Profile, xp: number): Promise<Profile | null> {
    const repo = database.repositories.get("profiles") as ProfileRepository;
    if (!repo) return null;

    let multiplier = 1;

    if (member.roles.cache.hasAny("1431396556757794837", "1424094092304056492", "1328930300364849203", "1235570566778327152")) multiplier *= 2;
    if (profile.voiceTime >= 10080) multiplier *= 2
    if (profile.messages >= 100000) multiplier *= 2


    const newXP = Math.round(profile.xp + xp * multiplier);
    const newLevel = getLevelInfo(newXP).level;

    const oldLevel = getLevelInfo(profile.xp).level;

    profile.xp = newXP;

    const levelRewards: Record<number, { giveaway?: number, role?: string }> = {
        7: { giveaway: 1, role: "1431395260558344383" },
        15: { giveaway: 1 },
        43: { giveaway: 2 },
        63: { giveaway: 3 },
        17: { role: "1431395444293894154" },
        27: { role: "1431395599638593685" },
        37: { role: "1431396556757794837" },
        47: { role: "1431396700060254269" },
        57: { role: "1431396754024169572" },
        67: { role: "1431396813285625936" },
        77: { role: "1431396853781495880" }
    };

    if (newLevel > oldLevel) {

        await generateImage(member, oldLevel, newLevel);

        member.send({
            content: "Parabéns! Você atingiu o level " + newLevel + " no XG7Plugins! (" + newLevel + "/77)",
            files: [new AttachmentBuilder("./src/assets/generated/level_up.png")]
        }).catch(() => null);

        if (newLevel == 77) {
            await awardAchievementToProfile(member, profile, getAchievement(AchievementID.Mestre))
        }

        const reward = levelRewards[newLevel];
        if (reward) {
            if (reward.giveaway) profile.giveawayEntries += reward.giveaway;

            if (reward.role) {
                const oldRoles = Object.values(levelRewards)
                    .map(r => r.role)
                    .filter(id => id && member.roles.cache.has(<Snowflake>id));

                await member.roles.remove(oldRoles as string[]).catch(() => null);

                await member.roles.add(reward.role).catch(() => null);
            }
        }
    }

    await repo.update(profile);

    return profile;
}

/**
 * Gera imagem de perfil (rank card)
 */
export async function generateImage(member: GuildMember, oldLevel: number, newLevel: number) {

    const guild = client.getMainGuild();

    if (!guild) return;

    const repo = database.repositories.get("profiles") as ProfileRepository;
    if (!repo) return;

    const bg = await loadImage("./src/assets/images/level_up.png");
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    registerFont('./src/assets/font/Bauhaus.ttf', { family: 'Bauhaus' });

    // Fundo
    ctx.drawImage(bg, 0, 0);

    // ====== FOTO DO USUÁRIO ======
    const avatar = await loadImage(member.displayAvatarURL({ extension: "png", size: 256 }));
    const avatarSize = 170;
    const avatarX = 163.45;
    const avatarY = 140.5;
    ctx.save();

    const radius = 20;
    ctx.beginPath();
    ctx.roundRect(avatarX - avatarSize/2, avatarY - avatarSize/2, avatarSize, avatarSize, radius);
    ctx.clip();

    ctx.drawImage(
        avatar,
        avatarX - avatarSize / 2 ,
        avatarY - avatarSize / 2 ,
        avatarSize,
        avatarSize
    );
    ctx.restore();

    // ====== LEVEL ======

    const levelX = 606

    ctx.textAlign = "center";
    ctx.font = "bold 48px Bauhaus";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Nível: ${oldLevel} - ${newLevel}`, levelX, 140.5);

    // ====== SALVAR ======
    const buffer = canvas.toBuffer("image/png");
    writeFileSync(`./src/assets/generated/level_up.png`, buffer);
}


export function getLevelInfo(xp: number) {
    let level: number;
    let xpForNextLevel: number;

    if (xp < 25) { level = 0; xpForNextLevel = 25; }
    else if (xp < 100) { level = 1; xpForNextLevel = 100; }
    else if (xp < 1000) { level = 2; xpForNextLevel = 1000; }
    else if (xp < 2000) { level = 3; xpForNextLevel = 2000; }
    else if (xp < 5000) { level = 4; xpForNextLevel = 5000; }
    else if (xp < 10000) { level = 5; xpForNextLevel = 10000; }
    else if (xp < 20000) { level = 6; xpForNextLevel = 20000; }
    else if (xp < 30000) { level = 7; xpForNextLevel = 30000; }
    else if (xp < 100000) { level = 8 + Math.floor((xp - 30000) / 10000); xpForNextLevel = (level === 14 ? 100000 : 30000 + (level-7+1)*10000); }
    else if (xp < 1000000) { level = 15 + Math.floor((xp - 100000) / 100000); xpForNextLevel = (15 + Math.floor((xp - 100000) / 100000) + 1) * 100000; }
    else if (xp < 2000000) { level = 33 + Math.floor((xp - 1000000) / 100000); xpForNextLevel = (33 + Math.floor((xp - 1000000) / 100000) + 1) * 100000; }
    else if (xp < 5000000) { level = 43 + Math.floor((xp - 2000000) / 200000); xpForNextLevel = (43 + Math.floor((xp - 2000000) / 200000) + 1) * 200000; }
    else if (xp < 7777777) { level = 63 + Math.floor((xp - 5000000) / 200000); xpForNextLevel = 7777777; }
    else { level = 77; xpForNextLevel = 7777777; }

    return { level, xpForNextLevel };
}

export function getProfileBGCount(): number {
    return fs.readdirSync("./src/assets/images/profile_bgs").length;
}

