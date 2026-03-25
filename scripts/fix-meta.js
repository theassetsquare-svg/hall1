const fs = require('fs');

const metas = {
  'index.html': {
    title: '일산명월관요정 — 한 번도 안 간 사람은 있어도, 한 번만 간 사람은 없다',
    desc: '형이 전화했다. "야, 금요일 저녁에 시간 돼?" 그게 시작이었다. 문 열고 들어간 순간 가야금 소리에 심장이 멈췄다. 예약부터 코스, 주차까지 전부 정리했다. 신실장 안내.',
  },
  'reservation/index.html': {
    title: '일산명월관요정 예약 — 손이 떨렸다, 근데 전화 한 통이면 끝이었다',
    desc: '뭐라고 말해야 하지? 격식 차려야 하나? 쓸데없는 걱정이었다. 신실장 목소리가 편했다. 동네 형 같았다. 언제 전화하고, 뭘 말하면 되는지 전부 적었다.',
  },
  'course/index.html': {
    title: '일산명월관요정 코스 — 첫 숟가락에 "와" 소리가 나왔다, 진짜로',
    desc: '반찬 많이 나오는 거 아닌가? 완전히 틀렸다. 전복죽에서 시작해서 해물탕으로 끝나는 열다섯 접시. 하나도 대충 만든 게 없었다. 친구가 숟가락 내려놓고 나를 쳐다봤다.',
  },
  'dresscode/index.html': {
    title: '일산명월관요정 드레스코드 — 옷장 앞에서 30분 서 있었다',
    desc: '양복? 너무 딱딱하다. 청바지? 너무 캐주얼한가? 결론은 간단했다. 셔츠에 면바지면 끝. 근데 양말은 꼭 챙겨라. 신발 벗는 순간 엄지발가락이 삐죽 나오면 끝장이다.',
  },
  'parking/index.html': {
    title: '일산명월관요정 주차·교통 — 네비가 포기했다, "경로를 이탈했습니다" 세 번',
    desc: '골목이 좁다. SUV 사이드미러 접어야 한다. 처음엔 짜증났다. 근데 두 번째부터 3분이면 도착한다. 네비가 모르는 진짜 루트, 주차 꿀팁 전부 알려준다.',
  },
  'budget/index.html': {
    title: '일산명월관요정 예산 — 강남 고깃집보다 싸다, 진짜다',
    desc: '이 글을 클릭한 이유를 안다. 얼마나 깨지나. 결론부터 말하면 생각보다 착하다. 가야금 라이브에 한정식 풀코스에 개인 방. 뭐가 포함이고 뭐가 별도인지 솔직하게 적었다.',
  },
  'manners/index.html': {
    title: '일산명월관요정 에티켓 — 이불 속에서 "요정 예절" 검색했다',
    desc: '첫 방문 전날 밤. 젓가락 잘못 들면 어쩌나. 모르는 음식 나오면 어쩌나. 쓸데없는 걱정이었다. 양말 깨끗한 거 신고, 술잔 두 손으로 받으면 끝. 그게 전부다.',
  },
  'compare/index.html': {
    title: '일산명월관요정 비교 — 세 군데 내 돈 내고 가봤다, 솔직히 말한다',
    desc: '검색만으로는 모른다. 사진 잘 찍으면 다 비슷해 보인다. 내 돈 내고 세 곳 갔다. 분위기, 음식, 서비스 전부 달랐다. 어디가 나한테 맞는지 솔직하게 비교해준다.',
  },
};

let totalChanges = 0;

for (const [file, meta] of Object.entries(metas)) {
  let html = fs.readFileSync(file, 'utf8');
  let changes = 0;

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  changes++;

  // Replace meta description
  html = html.replace(
    /name="description" content="[^"]*"/,
    `name="description" content="${meta.desc}"`
  );
  changes++;

  // Replace og:title
  html = html.replace(
    /og:title" content="[^"]*"/,
    `og:title" content="${meta.title}"`
  );
  changes++;

  // Replace og:description - same as meta description
  html = html.replace(
    /og:description" content="[^"]*"/,
    `og:description" content="${meta.desc}"`
  );
  changes++;

  // Replace twitter:title
  html = html.replace(
    /twitter:title" content="[^"]*"/,
    `twitter:title" content="${meta.title}"`
  );
  changes++;

  // Update JSON-LD description on index.html
  if (file === 'index.html') {
    html = html.replace(
      /"description":"[^"]*"/,
      `"description":"${meta.desc.replace(/"/g, '\\"')}"`
    );
    changes++;
  }

  fs.writeFileSync(file, html);
  totalChanges += changes;

  // Verify character count
  const descLen = meta.desc.length;
  const status = descLen <= 150 ? '✓' : '✗ OVER';
  console.log(`${status} ${file}: title=${meta.title.length}자, desc=${descLen}자`);
}

console.log(`\nTotal: ${totalChanges} changes`);
