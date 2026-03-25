const fs = require('fs');
const path = require('path');

// Engagement components to inject into each page
const pages = [
  { file: 'index.html', nextUrl: '/reservation/', nextTitle: '예약 방법 알아보기', gateText: '단골들만 아는 비밀이 있다. 신실장은 두 번째 방문부터 취향을 기억한다. 지난번에 좋아했던 안주, 앉았던 자리, 선호하는 술까지. 기계가 아니라 사람이 하는 서비스. 그래서 한 번 오면 안 올 수가 없다.' },
  { file: 'reservation/index.html', nextUrl: '/course/', nextTitle: '코스 요리 미리 보기', gateText: '예약할 때 "처음입니다"라고 말하면 대우가 달라진다. 신실장이 메뉴부터 자리, 공연 시간까지 직접 맞춰준다. 단골이 되는 첫걸음은 솔직함이다.' },
  { file: 'course/index.html', nextUrl: '/dresscode/', nextTitle: '드레스코드 확인하기', gateText: '계절마다 메뉴가 바뀐다. 봄에는 냉이 된장, 여름엔 전복 물회, 가을엔 송이버섯, 겨울엔 꿩 만두. 그래서 매번 새롭다. 단골들이 계절이 바뀔 때마다 오는 이유가 이거다.' },
  { file: 'dresscode/index.html', nextUrl: '/parking/', nextTitle: '주차 방법 알아보기', gateText: '한 가지 더. 계절감 있는 옷을 입으면 분위기가 배로 좋아진다. 가을이면 브라운 톤, 겨울이면 다크 네이비. 공간이랑 옷이 어울리면 사진도 잘 나온다.' },
  { file: 'parking/index.html', nextUrl: '/budget/', nextTitle: '예산 가이드 보기', gateText: '네비에 안 뜨는 팁이 있다. 큰길에서 골목으로 들어올 때 두 번째 좌회전이다. 첫 번째로 꺾으면 막다른 길이다. 이것만 알면 헤매지 않는다.' },
  { file: 'budget/index.html', nextUrl: '/manners/', nextTitle: '에티켓 알아보기', gateText: '아는 사람만 아는 것. 평일 저녁이 주말보다 여유롭다. 같은 코스인데 분위기가 더 좋다. 사람이 적으니까 가야금 소리가 더 또렷하게 들린다.' },
  { file: 'manners/index.html', nextUrl: '/compare/', nextTitle: '비교 가이드 보기', gateText: '가야금 연주자한테 곡을 요청할 수 있다. 대부분 모른다. "아리랑 한번 부탁드려요" 하면 바로 연주해준다. 분위기가 확 달라진다.' },
  { file: 'compare/index.html', nextUrl: '/', nextTitle: '메인으로 돌아가기', gateText: '이 근처에서 가야금 라이브를 하는 곳은 여기뿐이다. 다른 곳은 스피커로 틀어놓는다. 라이브와 녹음의 차이는 직접 들어보면 안다. 공기가 다르다.' },
];

const engageComponents = (p) => `
<!-- ===== ENGAGEMENT COMPONENTS ===== -->

<!-- Curiosity Gap -->
<div class="curiosity-gap scroll-reveal">
  <div class="curiosity-blur">
    <p style="color:#8B0000;font-weight:700;margin-bottom:.5rem">숨겨진 정보</p>
    <p>${p.gateText}</p>
  </div>
  <button class="curiosity-unlock" onclick="revealCuriosity(this)">터치해서 확인하기</button>
</div>

<!-- Time-Gated Content -->
<div class="time-gate scroll-reveal" data-seconds="20">
  <div class="gate-lock">
    <p style="color:#8B0000;font-weight:700">잠긴 콘텐츠</p>
    <span class="countdown">20초</span>
    <span class="gate-label">기다리면 공개됩니다</span>
  </div>
  <div class="gate-content">
    <p style="color:#8B0000;font-weight:700;margin-bottom:.5rem">공개된 비밀</p>
    <p style="color:#555">신실장 전화번호 하나면 모든 게 해결된다. 예약, 코스 변경, 주차 안내, 자리 배정. 전화 한 통에 전부 끝난다. 복잡하게 생각할 필요 없다.</p>
  </div>
</div>

<!-- Slot Machine -->
<div class="slot-machine scroll-reveal">
  <h3>오늘의 행운 뽑기</h3>
  <p style="color:#555;font-size:.85rem">하루에 한 번! 어떤 행운이 나올까?</p>
  <div class="slot-display">
    <div class="slot-reel">🌙</div>
    <div class="slot-reel">🍶</div>
    <div class="slot-reel">🎵</div>
  </div>
  <button class="slot-btn" onclick="spinSlot()">뽑기</button>
  <div class="slot-result"></div>
</div>

<!-- Reactions -->
<div class="reactions scroll-reveal">
  <button class="react-btn" data-emoji="❤️" onclick="react(this,'❤️')">❤️ <span class="count">0</span></button>
  <button class="react-btn" data-emoji="🔥" onclick="react(this,'🔥')">🔥 <span class="count">0</span></button>
  <button class="react-btn" data-emoji="👏" onclick="react(this,'👏')">👏 <span class="count">0</span></button>
  <button class="react-btn" data-emoji="😮" onclick="react(this,'😮')">😮 <span class="count">0</span></button>
</div>

<!-- Achievement Badges -->
<div style="text-align:center;margin:1.5rem 0" class="scroll-reveal">
  <p style="font-size:.85rem;color:#8B0000;font-weight:700;margin-bottom:.8rem">획득한 배지</p>
  <div class="badges">
    <div><div class="badge" data-badge="scroll50">🏃</div><div class="badge-label">탐험가</div></div>
    <div><div class="badge" data-badge="scroll80">🔍</div><div class="badge-label">몰입자</div></div>
    <div><div class="badge" data-badge="scroll100">🏆</div><div class="badge-label">정복자</div></div>
    <div><div class="badge" data-badge="curiosity">🔓</div><div class="badge-label">호기심</div></div>
    <div><div class="badge" data-badge="slot">🎰</div><div class="badge-label">도전자</div></div>
    <div><div class="badge" data-badge="react">💛</div><div class="badge-label">공감왕</div></div>
    <div><div class="badge" data-badge="timegate">⏰</div><div class="badge-label">인내심</div></div>
  </div>
</div>

<!-- Auto-Next Countdown -->
<div class="auto-next scroll-reveal" id="autoNext">
  <h4>다음 글 자동 이동</h4>
  <div class="next-timer">15</div>
  <div class="next-title">${p.nextTitle}</div>
  <div class="auto-next-bar"><div class="auto-next-fill" style="width:0%"></div></div>
</div>

<!-- Exit Intent Popup -->
<div class="exit-overlay" id="exitOverlay">
  <div class="exit-popup" style="position:relative">
    <button class="exit-close" onclick="closeExit()">&times;</button>
    <h3>잠깐!</h3>
    <p>아직 못 본 내용이 남아있어요.<br>비밀 콘텐츠를 확인해보세요.</p>
    <a class="exit-cta" href="tel:010-3695-4929">신실장에게 바로 전화</a>
  </div>
</div>
`;

// Auto-next init script
const autoNextScript = (p) => `
if(document.getElementById('autoNext')&&typeof initAutoNext==='function'){
  initAutoNext(document.getElementById('autoNext'),'${p.nextUrl}','${p.nextTitle}',15);
}
`;

pages.forEach(p => {
  let html = fs.readFileSync(p.file, 'utf8');

  // Add engage.css before </head> if not present
  if (!html.includes('engage.css')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="/engage.css">\n</head>');
  }

  // Add engage.js before </body> if not present
  if (!html.includes('engage.js')) {
    html = html.replace('</body>', '<script defer src="/engage.js"></script>\n</body>');
  }

  // Inject engagement components before the rec-sec or footer
  const marker = html.includes('rec-sec') ? '<div class="rec-sec">' : '<footer>';
  if (!html.includes('slot-machine')) {
    html = html.replace(marker, engageComponents(p) + '\n' + marker);
  }

  // Add auto-next init to existing script block
  if (!html.includes('initAutoNext')) {
    html = html.replace('</script>\n</body>', autoNextScript(p) + '</script>\n</body>');
  }

  // Add scroll-reveal class to existing cards
  html = html.replace(/class="card"/g, 'class="card scroll-reveal"');
  html = html.replace(/class="illust"/g, 'class="illust scroll-reveal"');
  html = html.replace(/class="tip-box"/g, 'class="tip-box scroll-reveal"');
  html = html.replace(/class="vote-sec"/g, 'class="vote-sec scroll-reveal"');
  html = html.replace(/class="quiz-sec"/g, 'class="quiz-sec scroll-reveal"');
  html = html.replace(/class="counter"/g, 'class="counter scroll-reveal"');

  fs.writeFileSync(p.file, html);
  console.log('✓ ' + p.file);
});

console.log('\nAll pages injected with engagement engine!');
