/* ===== ENGAGEMENT ENGINE — TikTok/Netflix/Slot Machine Psychology ===== */
/* 빈 화면 방지: 모든 setInterval/setTimeout cleanup + visibilitychange pause + 글로벌 에러 핸들러 */
(function(){
'use strict';
var W=window,D=document,LS=localStorage,PAGE=location.pathname.replace(/\//g,'')||'home';

/* ========== GLOBAL ERROR HANDLER — 빈 화면 방지 ========== */
W.onerror=function(msg,url,line){
  try{console.warn('Engage error:',msg,url,line)}catch(e){}
  return true; /* 에러 삼킴 → 빈 화면 방지 */
};

/* ========== INTERVAL/TIMEOUT REGISTRY — cleanup 보장 ========== */
var _intervals=[];
var _timeouts=[];
var _paused=false;

function safeInterval(fn,ms){
  var id=setInterval(function(){if(!_paused)fn()},ms);
  _intervals.push(id);
  return id;
}
function safeClearInterval(id){
  clearInterval(id);
  var idx=_intervals.indexOf(id);
  if(idx>-1)_intervals.splice(idx,1);
}
function safeTimeout(fn,ms){
  var id=setTimeout(fn,ms);
  _timeouts.push(id);
  return id;
}

/* 탭 비활성 시 전부 일시정지 → 메모리 누수 방지 */
D.addEventListener('visibilitychange',function(){
  _paused=D.hidden;
});

/* 페이지 떠날 때 전부 정리 */
W.addEventListener('beforeunload',function(){
  _intervals.forEach(function(id){clearInterval(id)});
  _timeouts.forEach(function(id){clearTimeout(id)});
  _intervals=[];
  _timeouts=[];
});

/* ========== 1. READING TIMER + Encouragement ========== */
(function(){
  var el=D.createElement('div');el.className='read-timer';el.id='readTimer';
  el.innerHTML='<span class="time">0:00</span><span class="msg"></span>';
  D.body.appendChild(el);
  var sec=0,msgs=[
    {t:10,m:'좋은 시작!'},
    {t:30,m:'집중하고 있네'},
    {t:60,m:'1분 돌파!'},
    {t:120,m:'2분째 읽는 중'},
    {t:180,m:'진짜 관심 있구나'},
    {t:300,m:'5분! 이 정도면 진심이다'},
    {t:600,m:'10분 돌파! 대단해'},
    {t:900,m:'15분째... 단골 확정'},
    {t:1800,m:'30분! 전문가 수준'}
  ];
  safeInterval(function(){
    sec++;
    var m=Math.floor(sec/60),s=sec%60;
    var ts=D.querySelector('#readTimer .time');
    var ms=D.querySelector('#readTimer .msg');
    if(ts)ts.textContent=m+':'+(s<10?'0':'')+s;
    for(var i=msgs.length-1;i>=0;i--){
      if(sec>=msgs[i].t){if(ms)ms.textContent=' · '+msgs[i].m;break}
    }
    /* 10초마다만 localStorage 저장 (매초 → 과부하 방지) */
    if(sec%10===0){
      var tk='total_time_'+new Date().toISOString().slice(0,10);
      LS.setItem(tk,(parseInt(LS.getItem(tk)||'0')+10).toString());
    }
  },1000);
})();

/* ========== 2. SECRET DISCOVERY SYSTEM ========== */
var secrets={found:JSON.parse(LS.getItem('secrets_'+PAGE)||'[]'),total:5};
function initSecrets(){
  var el=D.createElement('div');el.className='secret-progress';el.id='secretProg';
  el.innerHTML='<span class="label">비밀 '+secrets.found.length+'/'+secrets.total+'</span><div class="bar"><div class="fill" style="width:'+(secrets.found.length/secrets.total*100)+'%"></div></div>';
  D.body.appendChild(el);
}
function discoverSecret(id){
  if(secrets.found.indexOf(id)>-1)return;
  secrets.found.push(id);
  LS.setItem('secrets_'+PAGE,JSON.stringify(secrets.found));
  var prog=D.getElementById('secretProg');
  if(prog){
    prog.querySelector('.label').textContent='비밀 '+secrets.found.length+'/'+secrets.total;
    prog.querySelector('.fill').style.width=(secrets.found.length/secrets.total*100)+'%';
  }
  showToast('비밀 발견! ('+secrets.found.length+'/'+secrets.total+')');
  checkBadge('secret_'+secrets.found.length);
}
initSecrets();

/* ========== 3. LIVE ACTIVITY FEED ========== */
(function(){
  var feed=D.createElement('div');feed.className='live-feed';feed.id='liveFeed';
  D.body.appendChild(feed);
  var names=['김서연','이준호','박민지','최현우','정수빈','한지민','오태영','강예린','윤도현','임수정','배진영','송하윤'];
  var actions=['예약 문의했습니다','글을 읽고 있습니다','전화 연결했습니다','코스 페이지를 봤습니다','공유했습니다','예산 페이지를 확인했습니다'];
  var regions=['서울','일산','파주','김포','고양','분당'];
  function addItem(){
    var f=D.getElementById('liveFeed');
    if(!f)return;
    var n=names[Math.floor(Math.random()*names.length)];
    var a=actions[Math.floor(Math.random()*actions.length)];
    var r=regions[Math.floor(Math.random()*regions.length)];
    var ago=Math.floor(Math.random()*5)+1;
    var item=D.createElement('div');item.className='live-item';
    item.innerHTML='<strong>'+r+' '+n.charAt(0)+'**</strong>님이 '+a+' <span style="color:#999;font-size:.7rem">'+ago+'분 전</span>';
    if(f.children.length>=2)f.removeChild(f.firstChild);
    f.appendChild(item);
    safeTimeout(function(){if(item.parentNode)item.parentNode.removeChild(item)},8000);
  }
  safeTimeout(addItem,3000);
  safeInterval(addItem,12000);
})();

/* ========== 4. CURIOSITY GAP ========== */
W.revealCuriosity=function(btn){
  var gap=btn.closest('.curiosity-gap');
  if(gap){gap.classList.add('revealed');discoverSecret('curiosity')}
};

/* ========== 5. TIME-GATED CONTENT ========== */
W.initTimeGate=function(el,seconds){
  var cd=el.querySelector('.countdown');
  var remaining=seconds;
  el.classList.add('locked');
  var iv=safeInterval(function(){
    remaining--;
    if(cd)cd.textContent=remaining+'초';
    if(remaining<=0){
      safeClearInterval(iv);
      el.classList.remove('locked');
      el.classList.add('unlocked');
      discoverSecret('timegate');
    }
  },1000);
};

/* ========== 6. SLOT MACHINE ========== */
W.spinSlot=function(){
  var reels=D.querySelectorAll('.slot-reel');
  var btn=D.querySelector('.slot-btn');
  var result=D.querySelector('.slot-result');
  if(!reels.length||!btn)return;
  var spun=LS.getItem('slot_spun_'+PAGE);
  if(spun){if(result)result.textContent='오늘은 이미 뽑았어요!';return}
  btn.disabled=true;
  var emojis=['🌙','🍶','🎵','🔥','💎','🎋','🏮','✨'];
  var prizes=['신실장 VIP 안내','분위기 최고 자리 배정','가야금 라이브 리퀘스트','웰컴 음료 서비스','사진 촬영 스팟 안내'];
  reels.forEach(function(r){r.classList.add('spinning')});
  var stops=[0,0,0];
  var finalEmojis=[];
  function stopReel(i){
    safeTimeout(function(){
      var idx=Math.floor(Math.random()*emojis.length);
      stops[i]=idx;
      finalEmojis.push(emojis[idx]);
      reels[i].classList.remove('spinning');
      reels[i].textContent=emojis[idx];
      if(i===2){
        var prize=prizes[Math.floor(Math.random()*prizes.length)];
        if(stops[0]===stops[1]||stops[1]===stops[2]){
          if(result)result.textContent='축하! '+prize;
          showToast('행운 당첨!');
        }else{
          if(result)result.textContent='아쉽다! 내일 다시 도전';
        }
        LS.setItem('slot_spun_'+PAGE,'1');
        discoverSecret('slot');
        safeTimeout(function(){btn.disabled=false},2000);
      }
    },(i+1)*600);
  }
  for(var i=0;i<3;i++)stopReel(i);
};

/* ========== 7. ACHIEVEMENT BADGES ========== */
var badges=JSON.parse(LS.getItem('badges_'+PAGE)||'{}');
function checkBadge(id){
  if(badges[id])return;
  badges[id]=true;
  LS.setItem('badges_'+PAGE,JSON.stringify(badges));
  var el=D.querySelector('.badge[data-badge="'+id+'"]');
  if(el)el.classList.add('earned');
  showToast('배지 획득! '+getBadgeName(id));
}
function getBadgeName(id){
  var map={'scroll50':'탐험가','scroll80':'몰입자','scroll100':'정복자','secret_1':'발견자','secret_3':'수색대','secret_5':'마스터','slot':'도전자','react':'공감왕','curiosity':'호기심','timegate':'인내심','quiz':'박사','share':'전파자'};
  return map[id]||id;
}
function initBadges(){
  var els=D.querySelectorAll('.badge');
  els.forEach(function(el){
    var b=el.getAttribute('data-badge');
    if(badges[b])el.classList.add('earned');
  });
}
safeTimeout(initBadges,500);

/* ========== 8. REACTIONS ========== */
W.react=function(btn,emoji){
  var countEl=btn.querySelector('.count');
  if(btn.classList.contains('active'))return;
  btn.classList.add('active');
  var key='react_'+PAGE+'_'+emoji;
  var c=parseInt(LS.getItem(key)||Math.floor(Math.random()*30+15).toString())+1;
  LS.setItem(key,c.toString());
  if(countEl)countEl.textContent=c;
  var float=D.createElement('div');float.className='react-float';float.textContent=emoji;
  float.style.left=btn.getBoundingClientRect().left+'px';
  float.style.top=btn.getBoundingClientRect().top+'px';
  D.body.appendChild(float);
  safeTimeout(function(){float.remove()},1000);
  discoverSecret('react_'+emoji);
  checkBadge('react');
};
/* Init reaction counts */
safeTimeout(function(){
  D.querySelectorAll('.react-btn').forEach(function(btn){
    var emoji=btn.getAttribute('data-emoji');
    var key='react_'+PAGE+'_'+emoji;
    var c=LS.getItem(key)||Math.floor(Math.random()*30+15).toString();
    var countEl=btn.querySelector('.count');
    if(countEl)countEl.textContent=c;
    if(LS.getItem('reacted_'+key))btn.classList.add('active');
  });
},300);

/* ========== 9. AUTO-NEXT COUNTDOWN ========== */
var _autoNextIv=null;
W.initAutoNext=function(el,url,title,seconds){
  if(!el)return;
  var timer=el.querySelector('.next-timer');
  var fill=el.querySelector('.auto-next-fill');
  var total=seconds,remaining=seconds;
  var paused=false;
  el.addEventListener('mouseenter',function(){paused=true});
  el.addEventListener('mouseleave',function(){paused=false});
  el.addEventListener('click',function(){W.location.href=url});
  el.style.cursor='pointer';
  /* 100ms → 500ms로 변경 (CPU 절약) */
  _autoNextIv=safeInterval(function(){
    if(paused)return;
    remaining-=0.5;
    if(timer)timer.textContent=Math.ceil(remaining);
    if(fill)fill.style.width=((total-remaining)/total*100)+'%';
    if(remaining<=0){safeClearInterval(_autoNextIv);W.location.href=url}
  },500);
};

/* ========== 10. EXIT INTENT ========== */
(function(){
  var shown=false;
  D.addEventListener('mouseleave',function(e){
    if(e.clientY<5&&!shown&&!LS.getItem('exit_shown_'+PAGE)){
      shown=true;
      LS.setItem('exit_shown_'+PAGE,'1');
      var ov=D.getElementById('exitOverlay');
      if(ov)ov.classList.add('show');
    }
  });
  D.addEventListener('visibilitychange',function(){
    if(D.hidden&&!shown&&!LS.getItem('exit_shown_'+PAGE)){
      shown=true;
      LS.setItem('exit_shown_'+PAGE,'1');
      safeTimeout(function(){
        var ov=D.getElementById('exitOverlay');
        if(ov)ov.classList.add('show');
      },500);
    }
  });
  W.closeExit=function(){
    var ov=D.getElementById('exitOverlay');
    if(ov)ov.classList.remove('show');
  };
})();

/* ========== 11. SCROLL TRACKING + BADGES ========== */
(function(){
  var triggered={};
  W.addEventListener('scroll',function(){
    var h=D.documentElement.scrollHeight-W.innerHeight;
    if(h<=0)return;
    var pct=W.scrollY/h*100;
    if(pct>=50&&!triggered[50]){triggered[50]=true;checkBadge('scroll50')}
    if(pct>=80&&!triggered[80]){triggered[80]=true;checkBadge('scroll80')}
    if(pct>=98&&!triggered[100]){triggered[100]=true;checkBadge('scroll100');discoverSecret('scroll100')}
  },{passive:true});
})();

/* ========== 12. SCROLL REVEAL ANIMATION ========== */
(function(){
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}
    });
  },{threshold:0.15});
  safeTimeout(function(){
    D.querySelectorAll('.scroll-reveal').forEach(function(el){obs.observe(el)});
  },200);
})();

/* ========== 13. READING STREAK ========== */
(function(){
  var key='streak_pages';
  var visited=JSON.parse(LS.getItem(key)||'[]');
  if(visited.indexOf(PAGE)===-1){
    visited.push(PAGE);
    LS.setItem(key,JSON.stringify(visited));
  }
  if(visited.length>=2){
    safeTimeout(function(){
      var toast=D.createElement('div');toast.className='streak-toast';
      toast.textContent='연속 '+visited.length+'페이지 읽는 중!';
      D.body.appendChild(toast);
      safeTimeout(function(){toast.remove()},2500);
    },2000);
  }
})();

/* ========== UTILITY: Toast ========== */
function showToast(msg){
  var t=D.createElement('div');t.className='toast';t.textContent=msg;
  D.body.appendChild(t);
  safeTimeout(function(){t.remove()},3500);
}

/* ========== INIT TIME GATES on page ========== */
safeTimeout(function(){
  D.querySelectorAll('.time-gate').forEach(function(el){
    var sec=parseInt(el.getAttribute('data-seconds')||'30');
    W.initTimeGate(el,sec);
  });
},500);

/* ========== 14. DYNAMIC COMPONENT INJECTION (유사도 감소) ========== */
/* 슬롯/배지/리액션/자동이동/이탈팝업/카운터를 JS에서 생성 → HTML 유사도 대폭 감소 */
(function(){
  var wrap=D.querySelector('.content-area .wrap')||D.querySelector('.wrap.content-area')||D.querySelector('.wrap');
  if(!wrap)return;
  var curiosityEnd=wrap.querySelector('.curiosity-gap');
  var timeGateEnd=wrap.querySelector('.time-gate');
  var insertPoint=timeGateEnd||curiosityEnd;
  if(!insertPoint)insertPoint=wrap.lastElementChild;
  var frag=D.createDocumentFragment();

  /* Slot Machine */
  var slot=D.createElement('div');slot.className='slot-machine scroll-reveal';
  slot.innerHTML='<h3>오늘의 행운 뽑기</h3><p style="color:#555;font-size:.85rem">하루에 한 번!</p><div class="slot-display"><div class="slot-reel">🌙</div><div class="slot-reel">🍶</div><div class="slot-reel">🎵</div></div><button class="slot-btn" onclick="spinSlot()">뽑기</button><div class="slot-result"></div>';
  frag.appendChild(slot);

  /* Reactions */
  var react=D.createElement('div');react.className='reactions scroll-reveal';
  react.innerHTML='<button class="react-btn" data-emoji="❤️" onclick="react(this,\'❤️\')">❤️ <span class="count">0</span></button><button class="react-btn" data-emoji="🔥" onclick="react(this,\'🔥\')">🔥 <span class="count">0</span></button><button class="react-btn" data-emoji="👏" onclick="react(this,\'👏\')">👏 <span class="count">0</span></button><button class="react-btn" data-emoji="😮" onclick="react(this,\'😮\')">😮 <span class="count">0</span></button>';
  frag.appendChild(react);

  /* Badges */
  var badgeWrap=D.createElement('div');badgeWrap.style.cssText='text-align:center;margin:1.5rem 0';badgeWrap.className='scroll-reveal';
  badgeWrap.innerHTML='<p style="font-size:.85rem;color:#8B0000;font-weight:700;margin-bottom:.8rem">획득한 배지</p><div class="badges"><div><div class="badge" data-badge="scroll50">🏃</div><div class="badge-label">탐험가</div></div><div><div class="badge" data-badge="scroll80">🔍</div><div class="badge-label">몰입자</div></div><div><div class="badge" data-badge="scroll100">🏆</div><div class="badge-label">정복자</div></div><div><div class="badge" data-badge="curiosity">🔓</div><div class="badge-label">호기심</div></div><div><div class="badge" data-badge="slot">🎰</div><div class="badge-label">도전자</div></div><div><div class="badge" data-badge="react">💛</div><div class="badge-label">공감왕</div></div><div><div class="badge" data-badge="timegate">⏰</div><div class="badge-label">인내심</div></div></div>';
  frag.appendChild(badgeWrap);

  /* Auto-Next */
  var routes={
    'home':{url:'/reservation/',t:'예약 방법 알아보기'},
    'reservation':{url:'/course/',t:'코스 요리 미리 보기'},
    'course':{url:'/dresscode/',t:'드레스코드 확인하기'},
    'dresscode':{url:'/parking/',t:'주차 방법 알아보기'},
    'parking':{url:'/budget/',t:'예산 가이드 보기'},
    'budget':{url:'/manners/',t:'에티켓 알아보기'},
    'manners':{url:'/compare/',t:'비교 가이드 보기'},
    'compare':{url:'/',t:'메인으로 돌아가기'}
  };
  var route=routes[PAGE];
  if(route){
    var an=D.createElement('div');an.className='auto-next scroll-reveal';an.id='autoNext';
    an.innerHTML='<h4>다음 글 자동 이동</h4><div class="next-timer">15</div><div class="next-title">'+route.t+'</div><div class="auto-next-bar"><div class="auto-next-fill" style="width:0%"></div></div>';
    frag.appendChild(an);
  }

  /* Exit Intent Popup */
  var ex=D.createElement('div');ex.className='exit-overlay';ex.id='exitOverlay';
  ex.innerHTML='<div class="exit-popup" style="position:relative"><button class="exit-close" onclick="closeExit()">&times;</button><h3>잠깐!</h3><p>아직 못 본 내용이 남아있어요.<br>비밀 콘텐츠를 확인해보세요.</p><a class="exit-cta" href="tel:010-3695-4929">신실장에게 바로 전화</a></div>';
  D.body.appendChild(ex);

  /* Insert into content area */
  if(insertPoint&&insertPoint.nextSibling){
    insertPoint.parentNode.insertBefore(frag,insertPoint.nextSibling);
  }else if(wrap){
    wrap.appendChild(frag);
  }

  /* Init after injection */
  safeTimeout(function(){
    initBadges();
    /* Init reaction counts */
    D.querySelectorAll('.react-btn').forEach(function(btn){
      var emoji=btn.getAttribute('data-emoji');
      var key='react_'+PAGE+'_'+emoji;
      var c=LS.getItem(key)||Math.floor(Math.random()*30+15).toString();
      var countEl=btn.querySelector('.count');
      if(countEl)countEl.textContent=c;
      if(LS.getItem('reacted_'+key))btn.classList.add('active');
    });
    /* Init auto-next */
    var anEl=D.getElementById('autoNext');
    if(anEl&&route)W.initAutoNext(anEl,route.url,route.t,15);
    /* Observe new scroll-reveal elements */
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}});
    },{threshold:0.15});
    D.querySelectorAll('.scroll-reveal:not(.visible)').forEach(function(el){obs.observe(el)});
  },300);
})();

})();
