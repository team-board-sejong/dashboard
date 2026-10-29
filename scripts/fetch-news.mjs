// 구글 뉴스 RSS를 받아 news.json으로 저장합니다. (GitHub 자동 작업이 30분마다 실행)
// 뉴스 묶음을 바꾸려면 아래 FEEDS의 name과 검색어(q)만 고치면 됩니다.
import { writeFileSync } from 'node:fs';

const FEEDS = [
  { name: '주요뉴스', q: '' },
  { name: '농식품부', q: '농림축산식품부' },
  { name: '원산지', q: '원산지표시' },
];
const PER_FEED = 10;

const feedUrl = (q) => q
  ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`
  : 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko';

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

const byFeed = [];
const errors = [];
for (const f of FEEDS) {
  const list = [];
  try {
    const res = await fetch(feedUrl(f.q), { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'ko-KR,ko;q=0.9' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    for (const b of xml.split('<item>').slice(1, PER_FEED + 1)) {
      let title = pick(b, 'title');
      const source = pick(b, 'source');
      if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3));
      if (title) list.push({ feed: f.name, title, source, link: pick(b, 'link'), pub: pick(b, 'pubDate') });
    }
    if (!list.length) errors.push(`${f.name}: 기사 없음`);
  } catch (e) {
    errors.push(`${f.name}: ${e.message}`);
  }
  byFeed.push(list);
}

// 묶음별로 번갈아 섞어서 한쪽 뉴스만 몰리지 않게
const items = [];
for (let i = 0; i < PER_FEED; i++) for (const list of byFeed) if (list[i]) items.push(list[i]);

console.log(`뉴스 ${items.length}건, 오류: ${errors.join(' / ') || '없음'}`);
if (!items.length) {
  console.error('뉴스를 하나도 받지 못해 기존 news.json을 그대로 둡니다.');
  process.exit(1);
}
writeFileSync('news.json', JSON.stringify({ updated: new Date().toISOString(), items, errors }, null, 1) + '\n');
