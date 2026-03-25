const fs = require('fs');

// ===== FIX #2: meta description에 "일산명월관요정" 키워드 포함 =====
const newDescs = {
  'index.html': '일산명월관요정, 형이 전화했다. 야 금요일 시간 돼? 그게 시작이었다. 문 열고 들어간 순간 가야금 소리에 심장이 멈췄다. 예약부터 코스, 주차까지 전부 정리했다.',
  'reservation/index.html': '일산명월관요정 예약이 처음이라 손이 떨렸다. 뭐라고 말해야 하지? 쓸데없는 걱정이었다. 신실장 목소리가 편했다. 언제 전화하고 뭘 말하면 되는지 전부 적었다.',
  'course/index.html': '일산명월관요정 코스 요리, 반찬 많이 나오는 거 아닌가? 완전히 틀렸다. 전복죽에서 해물탕까지 열다섯 접시. 하나도 대충 만든 게 없었다. 친구가 숟가락을 내려놨다.',
  'dresscode/index.html': '일산명월관요정 드레스코드, 옷장 앞에서 30분 서 있었다. 양복? 딱딱하다. 청바지? 캐주얼한가? 셔츠에 면바지면 끝. 근데 양말은 꼭 챙겨라. 신발 벗는 순간이 중요하다.',
  'parking/index.html': '일산명월관요정 주차, 골목이 좁다. SUV 사이드미러 접어야 한다. 처음엔 짜증났다. 근데 두 번째부터 3분이면 도착한다. 네비가 모르는 진짜 루트 전부 알려준다.',
  'budget/index.html': '일산명월관요정 예산, 이 글 클릭한 이유를 안다. 얼마나 깨지나. 결론부터 말하면 생각보다 착하다. 가야금 라이브에 한정식 풀코스에 개인 방. 솔직하게 적었다.',
  'manners/index.html': '일산명월관요정 에티켓, 첫 방문 전날 밤 이불 속에서 검색했다. 젓가락 잘못 들면 어쩌나. 쓸데없는 걱정이었다. 양말 깨끗하게, 술잔 두 손으로. 그게 전부다.',
  'compare/index.html': '일산명월관요정 비교, 검색만으로는 모른다. 사진 잘 찍으면 다 비슷해 보인다. 내 돈 내고 세 곳 갔다. 분위기, 음식, 서비스 전부 달랐다. 솔직하게 비교한다.',
};

// ===== FIX #4: 본문 첫 문단에 키워드 자연 삽입 =====
const firstParaFixes = {
  'index.html': {
    old: '그날 밤, 나는 아무것도 몰랐다.',
    new: '일산명월관요정. 그날 밤, 나는 이 이름조차 몰랐다.'
  },
  'reservation/index.html': {
    old: '손이 떨렸다. 진짜로.',
    new: '일산명월관요정에 전화하려는데 손이 떨렸다. 진짜로.'
  },
  'course/index.html': {
    old: '한정식? 반찬 많이 나오는 거 아닌가?',
    new: '일산명월관요정 코스 요리? 반찬 많이 나오는 거 아닌가?'
  },
  'dresscode/index.html': {
    old: '옷장 앞에서 30분 서 있었다. 진짜로.',
    new: '일산명월관요정 간다는데 옷장 앞에서 30분 서 있었다. 진짜로.'
  },
  'parking/index.html': {
    old: '"경로를 이탈했습니다." 세 번 들었다.',
    new: '일산명월관요정 찾아가는 길. "경로를 이탈했습니다." 세 번 들었다.'
  },
  'budget/index.html': {
    old: '이 글을 클릭한 이유를 안다.',
    new: '일산명월관요정 예산. 이 글을 클릭한 이유를 안다.'
  },
  'manners/index.html': {
    old: '첫 방문 전날 밤.',
    new: '일산명월관요정 첫 방문 전날 밤.'
  },
  'compare/index.html': {
    old: '일산에 비슷한 곳이 서너 군데 있다.',
    new: '일산명월관요정 말고도 비슷한 곳이 서너 군데 있다.'
  },
};

// ===== FIX #13: SVG 일러스트에 alt 추가 (SVG → role="img" aria-label) =====
// SVGs don't have alt, use aria-label on container div

let totalFixes = 0;

for (const [file, desc] of Object.entries(newDescs)) {
  let html = fs.readFileSync(file, 'utf8');
  let fixes = 0;

  // #2: Replace meta description + og:description
  const oldDesc = html.match(/name="description" content="([^"]*)"/);
  if (oldDesc) {
    html = html.replace(oldDesc[0], `name="description" content="${desc}"`);
    fixes++;
  }
  const oldOgDesc = html.match(/og:description" content="([^"]*)"/);
  if (oldOgDesc) {
    html = html.replace(oldOgDesc[0], `og:description" content="${desc}"`);
    fixes++;
  }

  // #4: First paragraph keyword
  const fp = firstParaFixes[file];
  if (fp && html.includes(fp.old)) {
    html = html.replace(fp.old, fp.new);
    fixes++;
  }

  // #12: Add keyword anchor to first rec-card (one per page)
  // Change first rec-card text to include keyword naturally
  if (!html.includes('일산명월관요정 가이드')) {
    html = html.replace(
      '<h3>다음에 읽을 글</h3>',
      '<h3>일산명월관요정 가이드 더 보기</h3>'
    );
    fixes++;
  }

  // #13: Add aria-label with keyword to first SVG illustration
  if (html.includes('class="illust scroll-reveal"') && !html.includes('aria-label')) {
    html = html.replace(
      'class="illust scroll-reveal"',
      'class="illust scroll-reveal" role="img" aria-label="일산명월관요정 분위기"'
    );
    fixes++;
  } else if (html.includes('class="illust"') && !html.includes('aria-label')) {
    html = html.replace(
      'class="illust"',
      'class="illust" role="img" aria-label="일산명월관요정 분위기"'
    );
    fixes++;
  }

  // Verify keyword count in body stays ≤ 3
  const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
  if (bodyMatch) {
    const bodyText = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ');
    const kwCount = (bodyText.match(/일산명월관요정/g) || []).length;
    if (kwCount > 3) {
      console.log(`⚠ ${file}: 본문 키워드 ${kwCount}회 (3회 초과 주의)`);
    }
  }

  fs.writeFileSync(file, html);
  totalFixes += fixes;
  console.log(`✓ ${file}: ${fixes} fixes`);
}

console.log(`\nTotal: ${totalFixes} fixes applied`);
