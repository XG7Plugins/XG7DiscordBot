import {client} from "../index";
import {EmbedBuilder, GuildMember, TextChannel} from "discord.js";
import {createCanvas} from "canvas"
import * as fs from "node:fs";
import {addXP, getOrCreateProfile} from "../repositories/profile";
import {awardAchievementToProfile} from "../repositories/profile_achievements";
import {AchievementID, getAchievement} from "./database/models/Achievements";

type State = "starting" | "sending" | "waiting" | "cooldown"| "finished"

const channelID = "1432827347710644425"

export class DigitGame {

    gameState: {
        task: NodeJS.Timeout | undefined,
        state: State,
        step: number,
        word: string,
        scores: [{id: string, score: number}]
    } | undefined

    async startGame() {

        if (this.gameState) return

        const guild = client.getMainGuild();

        if (!guild) return

        const channel = guild.channels.cache.get(channelID) as TextChannel

        if (!channel) return

        this.gameState = {
            task: undefined,
            state: "starting",
            step: 0,
            word: "",
            scores: [{id: "", score: 0}]
        }

        const embed = new EmbedBuilder()
            .setTitle(`Jogo do dígito!`)
            .setColor("Aqua")
            .setThumbnail("https://imgs.search.brave.com/G6g-Q6ZGRzefJ5htRS226atNocq07PtUckJa6NVtoWE/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZs/YXRpY29uLmNvbS8x/MjgvNTgzMi81ODMy/NzczLnBuZw")
            .setDescription("Jogo do dígito iniciando! Fique atento à próxima palavra a ser enviada! O Objetivo é digitar a palavra certa o mais rápido possível!")
            .setFooter({ text: "Começando em 5 segundos..." });

        await channel.send({
            embeds: [embed]
        })

        setTimeout(() => {
            this.gameState!.task = setTimeout(() => {
                this.processGame(channel);
            }, 10_000);
        }, 5000);
    }

    private async processGame(channel: TextChannel) {

        if (!this.gameState) return

        if (this.gameState.state === "finished") {
            this.finishGame(false)
            return
        }

        if (this.gameState.step > 50) {
            this.gameState!.state = "finished";
            this.processGame(channel);
            return
        }

        if (this.gameState.state === "cooldown") {

            const scores = this.gameState.scores
                .filter(s => s.id) // ignora vazio
                .sort((a, b) => b.score - a.score)
                .map((s, i) => `**${i + 1}.** <@${s.id}> — **${s.score} pontos**`)
                .join("\n") || "Nenhum ponto ainda!";

            const scoreEmbed = new EmbedBuilder()
                .setTitle("🏆 Placar Atual")
                .setColor("Gold")
                .setDescription(scores)
                .setFooter({ text: "Próxima palavra em 3 segundos..." });

            await channel.send({ embeds: [scoreEmbed] })

            this.gameState!.task = setTimeout(() => {
                this.gameState!.state = "sending";
                this.processGame(channel);
                }, 3000);
            return
        }

        if (this.gameState.state === "waiting") {
            this.gameState!.state = "cooldown";
            await channel.send("Ninguém digitou a palavra correta! A palavra era: **" + this.gameState.word + "**");
            clearTimeout(this.gameState.task!);
            await this.processGame(channel);
            return
        }

        const resp = await fetch(`https://api.dicionario-aberto.net/random`);
        const data = await resp.json() as { word: string };

        const randomWord = data.word;

        this.gameState.word = randomWord;

        await gerarImagemComPalavra(mascararPalavra(randomWord));

        const embed = new EmbedBuilder()
            .setTitle(`Digite a palavra! (${this.gameState.step + 1}/50)`)
            .setColor("Aqua")
            .setDescription("Digite a palavra correta para ganhar pontos!")
            .setImage("attachment://palavra.png")
            .setFooter({ text: "Vocês tem 10 segundos para digitar a palavra!" });

        await channel.send({
            embeds: [embed],
            files: [
                {
                    attachment: "./src/assets/generated/palavra.png",
                    name: "palavra.png"
                }
            ]
        })

        this.gameState.step++;

        this.gameState!.state = "waiting";

        this.gameState!.task = setTimeout(() => {
            this.processGame(channel);
        }, 10000);

    }

    async guess(word: string, user: GuildMember) {

        const guild = client.getMainGuild();

        if (!guild) return

        const channel = guild.channels.cache.get(channelID) as TextChannel

        if (!channel) return

        if (!this.gameState) return

        if (this.gameState.state !== "waiting") return

        let player = this.gameState.scores.find(s => s.id === user.id);

        if (!player) {
            player = { id: user.id, score: 0 };
            this.gameState.scores.push(player);
        }

        if (word.toLowerCase().includes(this.gameState.word.toLowerCase())) {
            player.score += 1;

            await channel.send(`<@${user.id}> Digitou a palavra correta!`)

            this.gameState.state = "cooldown";

            clearTimeout(this.gameState.task!);

            this.gameState!.task = setTimeout(() => {
                this.processGame(channel);
            }, 5000);

            return

        }


    }

    async finishGame(forced: boolean = false) {


        if (!this.gameState) return;

        if (this.gameState.state !== "finished" && !forced) return;

        const guild = client.getMainGuild();
        if (!guild) return;

        const channel = guild.channels.cache.get(channelID) as TextChannel
        if (!channel) return

        const sortedScores = this.gameState.scores
            .filter(s => s.id)
            .sort((a, b) => b.score - a.score);

        if (sortedScores.length <= 1) {
            await channel.send("😕 Só uma pessoa participou, então ninguém ganhou XP desta vez.");
        } else {
            const xpRewards = [200, 100, 50];
            for (let i = 0; i < Math.min(3, sortedScores.length); i++) {
                const player = sortedScores[i];
                const xp = xpRewards[i];
                const member = guild.members.cache.get(player.id);
                if (member) {

                    getOrCreateProfile(member.id).then(async profile => {
                        if (!profile) return;

                        await addXP(member, profile, xp)

                        if (i === 0) {
                            profile.digitGameVictories++;

                            await awardAchievementToProfile(member, profile, getAchievement(AchievementID.PrimeiraVitoria))

                            if (profile.digitGameVictories == 10) {
                                await awardAchievementToProfile(member, profile, getAchievement(AchievementID.MaosRapidas))
                            }
                            if (profile.digitGameVictories == 100) {
                                await awardAchievementToProfile(member, profile, getAchievement(AchievementID.EALuz))
                            }
                        }
                    })
                }
            }
        }

        const scoresText =
            sortedScores
                .map((s, i) => `**${i + 1}.** <@${s.id}> — **${s.score} pontos**`)
                .join("\n") || "Nenhum ponto!";

        const scoreEmbed = new EmbedBuilder()
            .setTitle("🏁 Placar Final")
            .setColor("Gold")
            .setDescription(scoresText)
            .setFooter({ text: "Fim do jogo!" });

        await channel.send({ embeds: [scoreEmbed] });

        clearTimeout(this.gameState.task);
        this.gameState = undefined;
    }

}

function mascararPalavra(palavra: string) {
    let qtd: number;

    if (palavra.length <= 5) qtd = Math.floor(Math.random());
    else if (palavra.length <= 8) qtd = Math.floor(Math.random() * 2);
    else qtd = Math.floor(Math.random() * 3);

    const indices: number[] = [];

    while (indices.length < qtd) {
        const i = Math.floor(Math.random() * palavra.length);
        if (!indices.includes(i)) indices.push(i);
    }

    const resultado = palavra.split("");
    for (const i of indices) {
        resultado[i] = "?";
    }

    return resultado.join("");
}

function gerarImagemComPalavra(palavra: string) {
    const width = 400;
    const height = 200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // fundo
    ctx.fillStyle = "#00aaff";
    ctx.fillRect(0, 0, width, height);

    // texto
    ctx.font = `bold ${palavra.length > 16 ? 32 : 40}px Sans`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(palavra, width / 2, height / 2);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync("./src/assets/generated/palavra.png", buffer);
    return buffer;
}