export const SOUNDS = {
  click: "/sounds/click.wav",
  correct: "/sounds/correct.wav",
  wrong: "/sounds/wrong.wav",
  next: "/sounds/next.wav",
  complete: "/sounds/complete.wav",
  answerSelected: "/sounds/answer-selected.mp3",
  background: "/sounds/background.mp3",
};

const audioCache = {};

Object.entries(SOUNDS).forEach(([name, src]) => {
  const audio = new Audio(src);
  audio.preload = "auto";
  audioCache[name] = audio;
});

export function playSound(name, volume = 1) {
  const audio = audioCache[name];

  if (!audio) return;

  audio.currentTime = 0;
  audio.volume = volume;

  audio.play().catch(() => {});
}
