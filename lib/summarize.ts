const stop = new Set(['a','o','os','as','de','da','do','das','dos','e','em','um','uma','que','para','com','no','na','nos','nas','por','se','ao','à','às','aos','é','ser','foi','são','era','há'])

export function summarize(text: string) {
  const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(w => w && !stop.has(w) && w.length > 2)
  const freq: Record<string, number> = {}
  for (const w of words) freq[w] = (freq[w] || 0) + 1
  const keywords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([w])=>w)
  const sentences = text.split(/(?<=[\.!?])\s+/)
  const scored = sentences.map(s=>({ s, score: s.toLowerCase().split(/\s+/).reduce((acc,w)=>acc+(freq[w]||0),0) }))
  const summary = scored.sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.s).join(' ')
  const topics = keywords.slice(0,5)
  return { summary, keywords, topics }
}
