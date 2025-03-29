export interface Quote {
  text: string;
  emoji: string;
}

export const inspirationalQuotes: Quote[] = [
  { text: "El único mal entrenamiento es el que no hiciste", emoji: "💪" },
  { text: "Un pequeño progreso cada día suma grandes resultados", emoji: "📈" },
  { text: "No cuentes los días, haz que los días cuenten", emoji: "🗓️" },
  { text: "La disciplina es el puente entre metas y logros", emoji: "🌉" },
  { text: "Eres más fuerte de lo que piensas", emoji: "🦸" },
  { text: "El dolor que sientes hoy es la fuerza que sentirás mañana", emoji: "⚡" },
  { text: "Entrena como un campeón para convertirte en uno", emoji: "🏆" },
  { text: "Cree en ti mismo y serás imparable", emoji: "🚀" },
  { text: "La consistencia supera al talento cuando el talento no es consistente", emoji: "⏱️" },
  { text: "Transforma tus 'debería' en 'debo' y tus sueños en planes", emoji: "✅" },
  { text: "Tu cuerpo puede soportar casi cualquier cosa. Es tu mente la que debes convencer", emoji: "🧠" },
  { text: "La fuerza no viene de la capacidad física, viene de la voluntad indomable", emoji: "🔥" },
  { text: "Lo que no te reta, no te cambia", emoji: "🌪️" },
  { text: "Sudor, sonrisa, repetir", emoji: "😅" },
  { text: "No busques el momento perfecto, solo busca el momento y hazlo perfecto", emoji: "⌛" },
  { text: "Cuando sientas que vas a rendirte, piensa en por qué empezaste", emoji: "🌱" },
  { text: "El éxito no es dado. Es ganado en el gym y en la vida", emoji: "🎯" },
  { text: "El mejor proyecto en el que puedes trabajar eres tú", emoji: "👤" },
  { text: "No te compares con otros. Compárate con la persona que fuiste ayer", emoji: "🪞" },
  { text: "No dejes que tu mente te detenga de hacer lo que tu corazón desea", emoji: "❤️" },
  { text: "Si no te retas a ti mismo, nunca sabrás de lo que eres capaz", emoji: "🏋️" },
  { text: "Cambiar toma tiempo. No te rindas", emoji: "⏳" },
  { text: "El único límite eres tú", emoji: "🚧" },
  { text: "Haz hoy lo que otros no quieren, haz mañana lo que otros no pueden", emoji: "🌄" },
  { text: "El compromiso es hacer lo que dijiste que harías, mucho después de que la emoción con la que lo dijiste haya pasado", emoji: "🤝" },
  { text: "Para cambiar tu cuerpo tienes que amar tu cuerpo", emoji: "❣️" },
  { text: "La motivación es lo que te pone en marcha. El hábito es lo que te mantiene", emoji: "🔄" },
  { text: "Más fuerte que ayer, más débil que mañana", emoji: "📆" },
  { text: "Tu única competencia eres tú mismo", emoji: "🥇" },
  { text: "La disciplina es elegir entre lo que quieres ahora y lo que quieres más", emoji: "⚖️" }
];

export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
  return inspirationalQuotes[randomIndex];
} 