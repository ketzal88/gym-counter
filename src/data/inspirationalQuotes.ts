export interface Quote {
  text: string;
  emoji: string;
}

export const inspirationalQuotes: Quote[] = [
  { text: "El poder no viene de la fuerza física, sino de la determinación", emoji: "⚡" },
  { text: "¡Entrena hasta que puedas destruir montañas!", emoji: "🌊" },
  { text: "Un Saiyajin nunca se rinde, solo se vuelve más fuerte", emoji: "🔥" },
  { text: "¡Soy Goku! ¡Y voy a superar mis límites!", emoji: "🐉" },
  { text: "La verdadera fuerza viene del corazón, no de los músculos", emoji: "❤️" },
  { text: "¡Entrena como si tu vida dependiera de ello!", emoji: "💪" },
  { text: "Cada gota de sudor te acerca más a la perfección", emoji: "💧" },
  { text: "¡No hay límites para quien se atreve a superarse!", emoji: "🚀" },
  { text: "La disciplina es la clave para alcanzar el Super Saiyajin", emoji: "🗝️" },
  { text: "¡Entrena hasta que tus enemigos teman tu poder!", emoji: "👹" },
  { text: "Un guerrero nunca abandona la batalla", emoji: "⚔️" },
  { text: "¡Más fuerte que ayer, más débil que mañana!", emoji: "📈" },
  { text: "¡El dolor de hoy es la fuerza de mañana!", emoji: "⚡" },
  { text: "¡Soy el guerrero más fuerte de la galaxia!", emoji: "🌌" },
  { text: "¡Entrena como si Freezer estuviera detrás de ti!", emoji: "👾" },
  { text: "¡La determinación de un Saiyajin no tiene límites!", emoji: "🔥" },
  { text: "¡Cada repetición te acerca más a la perfección!", emoji: "🎯" },
  { text: "¡No hay excusas en el camino del guerrero!", emoji: "🛤️" },
  { text: "¡La fuerza viene de la voluntad, no del músculo!", emoji: "🧠" },
  { text: "¡Entrena hasta que puedas volar!", emoji: "🦅" },
  { text: "¡Un verdadero guerrero nunca se rinde!", emoji: "🛡️" },
  { text: "¡La transformación comienza en la mente!", emoji: "🧘" },
  { text: "¡Soy más fuerte que mi yo de ayer!", emoji: "📅" },
  { text: "¡El poder de un Super Saiyajin no tiene límites!", emoji: "💫" },
  { text: "¡Entrena como si el mundo dependiera de ti!", emoji: "🌍" },
  { text: "¡La disciplina es el camino del guerrero!", emoji: "🥋" },
  { text: "¡No hay atajos hacia el poder supremo!", emoji: "⛰️" },
  { text: "¡Cada día es una oportunidad para superarte!", emoji: "🌅" }
];

export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
  return inspirationalQuotes[randomIndex];
} 