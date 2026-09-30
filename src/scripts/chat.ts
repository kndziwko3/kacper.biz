/**
 * FastBot example: the whole sample conversation is in the HTML and always laid out at full height. When the card
 * scrolls into view the messages light up in quick order (the rest wait at 40%), so the card is never empty or faint
 * for more than about a second.
 */
export function initChat(reduced: boolean): () => void {
  const chat = document.querySelector<HTMLElement>('[data-chat]');
  if (!chat || reduced) return () => undefined;
  const msgs = Array.from(chat.querySelectorAll<HTMLElement>('[data-msg]'));
  const replay = chat.querySelector<HTMLButtonElement>('[data-chat-replay]');
  let timers: number[] = [];
  const clear = () => { timers.forEach((t) => window.clearTimeout(t)); timers = []; };
  const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

  const play = () => {
    clear();
    chat.classList.add('is-playing');
    msgs.forEach((m) => m.classList.remove('is-shown'));
    if (replay) replay.hidden = true;
    let t = 250;
    for (const m of msgs) {
      at(t, () => m.classList.add('is-shown'));
      t += 160;
    }
    at(t, () => { chat.classList.remove('is-playing'); if (replay) replay.hidden = false; });
  };

  let played = false;
  const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting && !played) { played = true; play(); } }, { threshold: 0.5 });
  io.observe(chat);
  replay?.addEventListener('click', play);
  return () => { io.disconnect(); clear(); chat.classList.remove('is-playing'); msgs.forEach((m) => m.classList.remove('is-shown')); replay?.removeEventListener('click', play); };
}
