import {Achievement} from "./Profile";

export enum AchievementID {
    // Texto
    PrimeiraMensagem = 1,
    Conversante = 2,
    RedacaoEnem = 3,
    TCC = 4,
    Dicionario = 5,

    // Call
    EntreEmCall = 6,
    PegandoALabia = 7,
    Palestrante = 8,
    FilaDoSUS = 9,
    Dormi = 10,
    AquiEMinhaCasa = 11,

    // Desafio
    Desocupado = 12,
    JaTocouNaGrama = 13,
    MaosDoFlash = 14,
    Mestre = 15
}

// Array de conquistas
export const achievements: Achievement[] = [
    // Texto
    { id: AchievementID.PrimeiraMensagem, name: "Primeira mensagem", xp: 25, description: "Envie sua primeira mensagem no servidor" },
    { id: AchievementID.Conversante, name: "Conversante (100)", xp: 1000, description: "Envie 100 mensagens no servidor" },
    { id: AchievementID.RedacaoEnem, name: "Redação do Enem (1000)", xp: 5000, description: "Envie 1000 mensagens no servidor" },
    { id: AchievementID.TCC, name: "TCC (10000)", xp: 10000, description: "Envie 10.000 mensagens no servidor" },
    { id: AchievementID.Dicionario, name: "Dicionário (100000)", xp: 500000, description: "Envie 100.000 mensagens no servidor" },

    // Call
    { id: AchievementID.EntreEmCall, name: "Entre em call", xp: 25, description: "Entre em qualquer call no servidor" },
    { id: AchievementID.PegandoALabia, name: "Pegando a lábia (10m)", xp: 1000, description: "Fique 10 minutos em call no total" },
    { id: AchievementID.Palestrante, name: "Palestrante (2h)", xp: 5000, description: "Fique 2 horas em call no total" },
    { id: AchievementID.FilaDoSUS, name: "Fila do SUS (6h)", xp: 10000, description: "Fique 6 horas em call no total" },
    { id: AchievementID.Dormi, name: "Eu dormi? (24h)", xp: 100000, description: "Fique 24 horas em call no total" },
    { id: AchievementID.AquiEMinhaCasa, name: "Aqui é minha casa! (1sem)", xp: 100000, description: "Fique 1 semana em call no total" },

    // Desafio
    { id: AchievementID.Desocupado, name: "Desocupado", xp: 100000, description: "Fique 24 horas seguidas em call" },
    { id: AchievementID.JaTocouNaGrama, name: "Já tocou na grama?", xp: 500000, description: "Fique 48 horas seguidas em call" },
    { id: AchievementID.MaosDoFlash, name: "Mãos do flash", xp: 10000, description: "Ganhe 100 vezes seguidas no jogo do dígito" },
    { id: AchievementID.Mestre, name: "Mestre", xp: 0, description: "Alcance o nível máximo" }
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
