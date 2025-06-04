module.exports = {
  config: {
    name: "motrapide",
    version: "1.1",
    author: "Evariste",
    role: 0,
    shortDescription: "Jeu de mot rapide en groupe",
    longDescription: "Le bot donne une lettre, et le premier à répondre avec un mot qui commence par cette lettre gagne.",
    category: "games",
    guide: {
      fr: "{pn} → Lance une partie de mot rapide"
    }
  },

  onStart: async function ({ message, event, threadsData, commandName }) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lettre = alphabet[Math.floor(Math.random() * alphabet.length)];

    // Sauvegarde la lettre dans une mémoire temporaire globale
    global.motRapide = global.motRapide || {};
    global.motRapide[event.threadID] = {
      lettre: lettre,
      active: true
    };

    return message.reply(`**Jeu du Mot Rapide !**\nLa lettre est : **${lettre}**\nPremier à envoyer un mot qui commence par cette lettre gagne **100 $** !`);
  },

  onChat: async function ({ message, event, usersData, api }) {
    const threadID = event.threadID;
    const content = event.body?.trim();

    // Vérifie si une partie est active
    if (!global.motRapide || !global.motRapide[threadID] || !global.motRapide[threadID].active) return;

    const lettre = global.motRapide[threadID].lettre;
    if (!content || content[0].toUpperCase() !== lettre) return;

    // Fin de la partie
    global.motRapide[threadID].active = false;

    const gain = 100;
    const userID = event.senderID;
    const currentMoney = await usersData.get(userID, "money") || 0;
    await usersData.set(userID, currentMoney + gain, "money");

    // Récupérer le nom de l'utilisateur
    const userInfo = await api.getUserInfo(userID);
    const userName = userInfo[userID]?.name || "un utilisateur";

    return message.reply(`Bravo ${userName} ! Tu as gagné avec **"${content}"** et tu remportes ${gain} $ !`);
  }
};
