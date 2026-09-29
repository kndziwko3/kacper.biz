/** FastBot example: replays the published sample conversation once it scrolls into view. */
export function initChat(reduced: boolean): () => void {
  const chat = document.querySelector<HTMLElement>('[data-chat]');
  if (!chat || reduced) return () => undefined;
  const msgs = Array.from(chat.querySelectorAll<HTMLElement>('[data-msg]'));
  const typing = chat.querySelector<HTMLElement>('[data-typing]');
  const replay = chat.querySelector<HTMLButtonElement>('[data-chat-replay]');
  let timers: number[] = [];
  const clear = () => { timers.forEach((t) => window.clearTimeout(t)); timers = []; };
  const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

  const play = () => {
    clear();
    chat.classList.add('is-playing');
    msgs.forEach((m) => m.classList.remove('is-shown'));
    if (replay) replay.hidden = true;
    let t = 350;
    for (const m of msgs) {
      const fromBot = m.classList.contains('msg--bot');
      if (fromBot && typing) {
        at(t, () => { m.before(typing); typing.hidden = false; });
        t += 1150;
      }
      at(t, () => { if (typing) typing.hidden = true; m.classList.add('is-shown'); });
      t += fromBot ? 750 : 950;
    }
    at(t, () => { if (replay) replay.hidden = false; });
  };

  chat.classList.add('is-playing');
  let played = false;
  const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting && !played) { played = true; play(); } }, { threshold: 0.4 });
  io.observe(chat);
  replay?.addEventListener('click', play);
  return () => { io.disconnect(); clear(); replay?.removeEventListener('click', play); };
}
