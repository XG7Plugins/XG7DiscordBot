import {Achievement} from "./Profile";

export enum AchievementID {
    // Texto
    PrimeiraMensagem = 1,
    Conversante = 2,
    RedacaoEnem = 3,
    Dicionario = 4,
    Biblioteca = 5,

    // Call
    EntreEmCall = 6,
    Interaja = 7,
    Discurso = 8,
    Palestrante = 9,
    SoMaisUma = 10,
    AquiEMinhaCasa = 11,

    //JOGO
    PrimeiraVitoria = 12,
    MaosRapidas = 13,
    EALuz = 14,

    // Desafio
    Dormiu = 15,
    Desocupado = 16,
    JaTocouNaGrama = 17,
    Mestre = 18
}

// Array de conquistas
export const achievements: Achievement[] = [
    // Texto
    { id: AchievementID.PrimeiraMensagem, name: "Primeira mensagem", xp: 25, description: "Envie sua primeira mensagem no servidor", bannerURL: "./src/assets/images/achievements/primeira_mensagem.jpg" },
    { id: AchievementID.Conversante, name: "Conversante", xp: 1000, description: "Envie 100 mensagens no servidor", bannerURL: "./src/assets/images/achievements/conversante.jpg" },
    { id: AchievementID.RedacaoEnem, name: "Redação do Enem", xp: 5000, description: "Envie 1000 mensagens no servidor", bannerURL: "./src/assets/images/achievements/redacao.jpg" },
    { id: AchievementID.Dicionario, name: "Dicionário", xp: 500000, description: "Envie 10.000 mensagens no servidor", bannerURL: "./src/assets/images/achievements/dicionario.jpg" },
    { id: AchievementID.Biblioteca, name: "Biblioteca", xp: 1000000, description: "Envie 100.000 mensagens no servidor", bannerURL: "./src/assets/images/achievements/biblioteca.jpg" },


    // Call
    { id: AchievementID.EntreEmCall, name: "Entre em call", xp: 25, description: "Entre em qualquer call no servidor", bannerURL: "./src/assets/images/achievements/call.jpg" },
    { id: AchievementID.Interaja, name: "Interaja", xp: 1000, description: "Fique 10 minutos em call no total", bannerURL: "./src/assets/images/achievements/interaja.jpg" },
    { id: AchievementID.Discurso, name: "Discurso", xp: 1000, description: "Fique 2 horas em call no total", bannerURL: "./src/assets/images/achievements/discurso.jpg" },
    { id: AchievementID.Palestrante, name: "Palestrante", xp: 5000, description: "Fique 6 horas em call no total", bannerURL: "./src/assets/images/achievements/palestrante.jpg" },
    { id: AchievementID.SoMaisUma, name: "Só mais uma partida, mãe!", xp: 10000, description: "Fique 24 horas em call no total", bannerURL: "./src/assets/images/achievements/mae.jpg" },
    { id: AchievementID.AquiEMinhaCasa, name: "Aqui é minha casa!", xp: 100000, description: "Fique 1 semana em call no total", bannerURL: "./src/assets/images/achievements/casa.jpg" },

    // JOGO
    { id: AchievementID.PrimeiraVitoria, name: "Primeira vitória", xp: 100000, description: "Ganhe uma vez no jogo do dígito", bannerURL: "./src/assets/images/achievements/vitoria.jpg" },
    { id: AchievementID.MaosRapidas, name: "Mãos rápidas", xp: 100000, description: "Ganhe 10 vezes no jogo do dígito", bannerURL: "./src/assets/images/achievements/maos.jpg" },
    { id: AchievementID.EALuz, name: "É a luz?", xp: 100000, description: "Ganhe 100 vezes no jogo do dígito", bannerURL: "./src/assets/images/achievements/ealuz.jpg" },

    // Desafio
    { id: AchievementID.Dormiu, name: "Dormiu?", xp: 100000, description: "Fique 24h simultâneas em call", bannerURL: "./src/assets/images/achievements/dormiu.jpg" },
    { id: AchievementID.Desocupado, name: "Desocupado", xp: 500000, description: "Fique 36 horas seguidas em call", bannerURL: "./src/assets/images/achievements/desocupado.png" },
    { id: AchievementID.JaTocouNaGrama, name: "Já tocou na grama?", xp: 1000000, description: "Fique 48 horas seguidas em call", bannerURL: "./src/assets/images/achievements/jatocounagrama.jpg" },
    { id: AchievementID.Mestre, name: "Mestre", xp: 0, description: "Alcance o nível máximo", bannerURL: "./src/assets/images/achievements/mestre.jpg" }
];

// Função para pegar Achievement por ID
export function getAchievement(id: AchievementID): Achievement {

    const achievement = achievements.find(achievement => achievement.id === id);

    if (!achievement) throw new Error(`Achievement ${id} not found`);

    return achievement;
}
export function getAchievementByNumber(id: number): Achievement {

    const numericId = Number(id);

    const achievement = achievements.find(a => a.id === numericId);
    if (!achievement) throw new Error(`Achievement com ID ${id} não encontrado`);
    return achievement;
}

export default achievements;
