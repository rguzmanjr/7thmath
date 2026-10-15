/* Grade 7 TEKS question sets for the arcade games.
   Built on Kody Spitz's Spitz Arcade engine: every game loads this file and asks SpitzQ.forGame(prefix) for questions,
   and the hub link picks the set and topics:  game.html?set=pct&topics=disc,tax
   Same rules as the original bank: each question carries an independent check, the right answer must pass it,
   no wrong answer may pass it, and every wrong answer carries a short "why" that students see. */
(function(){
'use strict';

/* ---------------- shared helpers (one copy per game prefix) ---------------- */
function helpers(PFX){
  var H={}, MINUS='−';
  H.MINUS=MINUS;
  H.ri=function(a,b){ return a+Math.floor(Math.random()*(b-a+1)); };
  H.nz=function(a,b){ var v; do{ v=H.ri(a,b); }while(v===0); return v; };
  H.pick=function(a){ return a[Math.floor(Math.random()*a.length)]; };
  H.chance=function(p){ return Math.random()<p; };
  H.shuffle=function(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; };
  H.gcd=function(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ var t=a%b; a=b; b=t; } return a; };
  H.lcm=function(a,b){ return Math.abs(a*b)/H.gcd(a,b); };
  /* exact fractions {n,d} */
  H.R=function(n,d){ if(d===undefined) d=1; if(d<0){ n=-n; d=-d; } var g=H.gcd(n,d)||1; return {n:n/g,d:d/g}; };
  H.isR=function(v){ return !!v&&typeof v==='object'&&typeof v.n==='number'&&typeof v.d==='number'&&Object.keys(v).length===2; };
  H.add=function(a,b){ return H.R(a.n*b.d+b.n*a.d,a.d*b.d); };
  H.sub=function(a,b){ return H.R(a.n*b.d-b.n*a.d,a.d*b.d); };
  H.mul=function(a,b){ return H.R(a.n*b.n,a.d*b.d); };
  H.div=function(a,b){ return H.R(a.n*b.d,a.d*b.n); };
  H.neg=function(a){ return H.R(-a.n,a.d); };
  H.absR=function(a){ return H.R(Math.abs(a.n),a.d); };
  H.eqR=function(a,b){ return H.isR(a)&&H.isR(b)&&a.n*b.d===b.n*a.d; };
  H.val=function(a){ return a.n/a.d; };
  /* a decimal like 3.25 as an exact fraction */
  H.D=function(x){ var k=0; while(Math.abs(Math.round(x*Math.pow(10,k))-x*Math.pow(10,k))>1e-9&&k<8) k++; return H.R(Math.round(x*Math.pow(10,k)),Math.pow(10,k)); };
  function commas(s){ return s.replace(/\B(?=(\d{3})+(?!\d))/g,','); }
  H.num=function(n){ return n<0? MINUS+commas(''+(-n)) : commas(''+n); };
  /* terminating decimal text for an exact fraction, or null if it doesn't end within 6 places */
  H.decStr=function(r){ for(var k=0;k<=6;k++){ var m=Math.pow(10,k); if((r.n*m)%r.d===0){ var N=r.n*m/r.d; return H.fixed(N,k,true); } } return null; };
  /* integer N read as N / 10^k, e.g. fixed(1250,2) = "12.50"; trim drops trailing zeros */
  H.fixed=function(N,k,trim){ var neg=N<0, s=''+Math.abs(N); while(s.length<=k) s='0'+s;
    var w=k?s.slice(0,-k):s, f=k?s.slice(-k):''; if(trim) f=f.replace(/0+$/,''); return (neg?MINUS:'')+commas(w)+(f?'.'+f:''); };
  H.money=function(cents){ return (cents<0?MINUS:'')+'$'+H.fixed(Math.abs(cents),2); };
  H.moneyR=function(r){ return H.money(Math.round(H.val(r)*100)); };
  H.frac=function(n,d){ return '<span class="'+PFX+'-fr"><span>'+n+'</span><span>'+d+'</span></span>'; };
  /* fraction text, as a mixed number when it is more than 1 */
  H.fmtF=function(r,improper){ if(r.d===1) return H.num(r.n); var neg=r.n<0, n=Math.abs(r.n), w=Math.floor(n/r.d), p=n%r.d;
    return (neg?MINUS:'')+((!improper&&w>0)? w+H.frac(p,r.d) : H.frac(n,r.d)); };
  /* plain-text fraction for SVG labels */
  H.fmtFt=function(r){ if(r.d===1) return H.num(r.n); var neg=r.n<0, n=Math.abs(r.n), w=Math.floor(n/r.d), p=n%r.d; return (neg?MINUS:'')+(w>0? w+' '+p+'/'+r.d : n+'/'+r.d); };
  H.fmtD=function(r){ var s=H.decStr(r); return s===null? H.fmtF(r) : s; };
  H.C=function(html,val,why){ return {html:html,val:val,why:why||'',key:html}; };
  H.eq=function(h){ return '<span class="'+PFX+'-eq">'+h+'</span>'; };
  H.big=function(h){ return '<span class="'+PFX+'-eq" style="font-size:1.3em">'+h+'</span>'; };
  H.ans=function(h){ return '<span class="c-ans">'+h+'</span>'; };
  H.hl=function(h){ return '<span class="c-m">'+h+'</span>'; };
  H.par=function(txt,isNeg){ return isNeg? '('+txt+')' : txt; };
  /* SVG pieces: every picture is a 380 × 380 box, the size the games make room for */
  H.FONT=' font-family="Inter,Lexend,sans-serif" font-weight="800"';
  H.COL={ grid:'#2A3142', axis:'#C9D1E0', ink:'#F2F4F8', mute:'#9BA5B8', y:'#FFC82E', c:'#3DE0FF', r:'#FF5A5A', p:'#FF8BD8', g:'#7CE04A', v:'#D9A6FF', o:'#FF9F43', fill:'#232838' };
  H.svg=function(inner,label){ return '<svg class="'+PFX+'-graph" width="380" height="380" viewBox="0 0 380 380" role="img" aria-label="'+(label||'Picture for the question')+'">'+inner+'</svg>'; };
  H.t=function(x,y,s,size,fill,anchor){ return '<text x="'+(+x).toFixed(1)+'" y="'+(+y).toFixed(1)+'" text-anchor="'+(anchor||'middle')+'" font-size="'+(size||22)+'" fill="'+(fill||H.COL.ink)+'"'+H.FONT+'>'+s+'</text>'; };
  /* label with a dark halo so it reads on top of lines */
  H.tb=function(x,y,s,size,fill,anchor){ return '<text x="'+(+x).toFixed(1)+'" y="'+(+y).toFixed(1)+'" text-anchor="'+(anchor||'middle')+'" font-size="'+(size||22)+'" fill="'+(fill||H.COL.ink)+'" stroke="#0E1016" stroke-width="5" paint-order="stroke"'+H.FONT+'>'+s+'</text>'; };
  H.line=function(x1,y1,x2,y2,col,w,dash){ return '<line x1="'+(+x1).toFixed(1)+'" y1="'+(+y1).toFixed(1)+'" x2="'+(+x2).toFixed(1)+'" y2="'+(+y2).toFixed(1)+'" stroke="'+col+'" stroke-width="'+(w||3)+'" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>'; };
  H.poly=function(pts,fill,stroke,w){ return '<polygon points="'+pts.map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ')+'" fill="'+(fill||'none')+'" stroke="'+(stroke||'none')+'" stroke-width="'+(w||3)+'" stroke-linejoin="round"/>'; };
  /* a table: head = column titles, rows = arrays of strings; widths optional (fractions of 380) */
  H.table=function(head,rows,widths){ var n=rows.length+1, h=Math.min(64,380/n), top=(380-h*n)/2, cols=head.length, s='', x=0;
    widths=widths||head.map(function(){ return 1/cols; }); var xs=[]; widths.forEach(function(w){ xs.push([x,x+w*380]); x+=w*380; });
    var fs=Math.min(30,h*0.5);
    s+='<rect x="0" y="'+top+'" width="380" height="'+h+'" fill="'+H.COL.fill+'"/>';
    head.forEach(function(c,i){ s+=H.t((xs[i][0]+xs[i][1])/2,top+h/2+fs*0.36,c,fs*0.9,H.COL.axis); });
    rows.forEach(function(r,j){ var yy=top+(j+1)*h+h/2+fs*0.36; r.forEach(function(c,i){ s+=H.t((xs[i][0]+xs[i][1])/2,yy,c,fs,H.COL.ink); }); });
    for(var i=1;i<n;i++) s+=H.line(0,top+i*h,380,top+i*h,'#343B4D',2);
    for(i=1;i<cols;i++) s+=H.line(xs[i][0],top,xs[i][0],top+n*h,'#343B4D',2);
    return s; };
  /* pick wrong answers: first the right one, then candidates [value, why, label?] that are new and valid */
  H.choices=function(right,cands,fmt,ok){ var out=[right], keys={}; keys[right.key]=1;
    cands.forEach(function(c){ if(out.length>=4||c===null||c===undefined) return; var v=c[0]; if(v===null||v===undefined) return; if(ok&&!ok(v)) return;
      var html=c[2]!==undefined? c[2] : fmt(v); if(html===null||keys[html]) return;
      if(out.some(function(o){ return H.isR(o.val)&&H.isR(v)? H.eqR(o.val,v) : o.val===v; })) return;
      keys[html]=1; out.push(H.C(html,v,c[1])); });
    return out; };
  return H;
}

/* sort key for "smallest to largest" choice order; null means not a number */
function sortKey(v){ if(typeof v==='number') return v; if(v&&typeof v==='object'&&typeof v.n==='number'&&typeof v.d==='number'&&Object.keys(v).length===2) return v.n/v.d; return null; }

/* every set's generators go through this */
function builder(GEN,setId){
  return function build(type){ var last='', target=Math.floor(Math.random()*4), miss=0;   /* the right answer's slot, picked first so every slot is equally likely */
    for(var tries=0;tries<600;tries++){ var q=GEN[type](); if(!q) continue;
      if(!q.choices||q.choices.length!==4) continue;
      if(new Set(q.choices.map(function(c){ return c.key; })).size!==4) continue;
      if(!q.check(q.choices[0].val)) { last='right answer failed its check'; continue; }                     // the answer must pass the independent check
      if(q.choices.slice(1).some(function(c){ return q.check(c.val); })) { last='a wrong answer passed'; continue; }  // and no distractor may pass it
      if(q.choices.slice(1).some(function(c){ return !c.why; })) { last='missing why'; continue; }
      q.type=type; q.choices.forEach(function(c,i){ c.ok=i===0; });
      var keys=q.choices.map(function(c){ return sortKey(c.val); });
      if(q.keepOrder){ if(q.order) q.choices.sort(function(a,b){ return q.order(a.val)-q.order(b.val); }); }
      else { var sorted=keys.every(function(k){ return k!==null; });
        if(sorted){ var tmp=q.choices.slice().sort(function(a,b){ return sortKey(a.val)-sortKey(b.val); });     // numbers read best smallest to largest,
          if(tmp.findIndex(function(c){ return c.ok; })!==target&&miss++<30) continue;                             // but only when that puts the answer in the target slot
          if(tmp.findIndex(function(c){ return c.ok; })===target) q.choices=tmp; else sorted=false; }
        if(!sorted){ var ok=q.choices[0], rest=q.choices.slice(1); for(var i=rest.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=rest[i]; rest[i]=rest[j]; rest[j]=t; }
          rest.splice(target,0,ok); q.choices=rest; } }
      delete q.keepOrder; delete q.order; q.visual=q.visual||''; q.data=q.data||{}; delete q.check; return q; }
    throw new Error('generator failed: '+setId+'.'+type+' ('+last+')'); };
}

/* ================= 7.3A  Rational number operations =================
   One problem uses one kind of number: decimals, fractions/mixed numbers, or integers, so the answer choices match. */
function G_rat(H){
  var R=H.R;
  function kind(){ var r=Math.random(); return r<0.45?'dec':r<0.85?'frac':'int'; }
  function decOp(places){ var m=places===2?100:10, v=H.nz(-12*m,12*m); return R(v,m); }
  var DENS=[2,3,4,5,6,8,10,12];
  function fracOp(d,mixed){ var n=H.ri(1,d-1); if(H.gcd(n,d)!==1&&H.chance(0.6)) n=1; var w=mixed?H.ri(1,3):0, r=R(w*d+n,d); return H.chance(0.5)?H.neg(r):r; }
  function pair(k,op){ var a,b;
    if(k==='int'){ a=R(H.nz(-20,20)); b=R(H.nz(-20,20)); if(op==='mul'||op==='div'){ a=R(H.nz(-12,12)); b=R(H.nz(-12,12)); } }
    else if(k==='dec'){ var pl=(op==='add'||op==='sub')&&H.chance(0.4)?2:1; a=decOp(pl); b=decOp(1); if(H.chance(0.5)){ var t=a; a=b; b=t; } }
    else { var d1=H.pick(DENS), d2=H.pick(DENS); if(H.lcm(d1,d2)>24) return null; a=fracOp(d1,H.chance(0.3)); b=fracOp(d2,H.chance(0.25)); if(a.d===1||b.d===1) return null; }
    if(a.n>0&&b.n>0&&H.chance(0.85)){ if(H.chance(0.5)) a=H.neg(a); else b=H.neg(b); }   /* a negative most of the time: that is the skill */
    return [a,b]; }
  function fmtK(k){ return function(r){ if(k==='dec'){ var s=H.decStr(r); return s; } if(k==='int') return r.d===1?H.num(r.n):null; return H.fmtF(r); }; }
  function signRuleAdd(a,b){ return (a.n<0)===(b.n<0)? 'Same signs: add the sizes and keep the sign.' : 'Different signs: subtract the sizes and keep the sign of the number farther from 0.'; }
  function mk(op){ return function(){ var k=kind(), p=pair(k,op); if(!p) return null; var a=p[0], b=p[1], F=fmtK(k), ans, sym, cands=[], chk;
    if(op==='div'){ /* build a ÷ b from a friendly quotient */
      if(k==='dec'){ var q=H.chance(0.5)?R(H.nz(-12,12)):R(H.nz(-60,60),10); b=R(H.nz(-25,25),10); if(b.d===1) return null; a=H.mul(b,q); if(H.decStr(a)===null||H.decStr(a).replace(/[^0-9]/g,'').length>4) return null; }
      if(k==='int'){ var qq=H.nz(-12,12); a=H.mul(b,R(qq)); }
      if(a.n===0) return null; }
    var bTxt=H.par(F(b),b.n<0);
    if(op==='add'){ ans=H.add(a,b); sym=' + '; chk=function(v){ return H.eqR(H.sub(v,b),a); };
      var A=H.absR(a), B=H.absR(b), sizeWrong=(a.n<0)===(b.n<0)? H.sub(A,B) : H.add(A,B); if(ans.n<0) sizeWrong=H.neg(sizeWrong);
      cands=[[H.neg(ans),'Check the sign. '+signRuleAdd(a,b)],[sizeWrong,signRuleAdd(a,b)],[H.sub(a,b),'That subtracts. This problem adds.']];
      if(k==='frac') cands.unshift([R(a.n+b.n,a.d+b.d),'Don’t add the denominators. Rewrite with a common denominator first.']);
      if(k==='dec'){ var pa=(H.decStr(a).split('.')[1]||'').length, pb=(H.decStr(b).split('.')[1]||'').length; if(pa!==pb) cands.unshift([pa<pb? H.add(H.div(a,R(10)),b) : H.add(a,H.div(b,R(10))),'Line up the decimal points before you add.']); } }
    else if(op==='sub'){ ans=H.sub(a,b); sym=' − '; chk=function(v){ return H.eqR(H.add(v,b),a); };
      cands=[[H.add(a,b),'Subtracting means adding the opposite: '+F(a)+' + '+H.par(F(H.neg(b)),b.n>0)+'.'],[H.neg(ans),'Check the sign.'],[H.neg(H.add(a,b)),'Add the opposite first, then use the sign rules.']];
      if(k==='frac'&&a.d!==b.d&&a.d-b.d!==0) cands.unshift([R(a.n-b.n,Math.abs(a.d-b.d)),'Don’t subtract the denominators. Rewrite with a common denominator first.']); }
    else if(op==='mul'){ ans=H.mul(a,b); sym=' × '; chk=function(v){ return b.n!==0&&H.eqR(H.div(v,b),a); };
      var rule=(a.n<0)===(b.n<0)?'Same signs give a positive.':'Different signs give a negative.';
      cands=[[H.neg(ans),'Check the sign. '+rule]];
      if(k==='dec') cands.push([H.mul(ans,R(10)),'Count the decimal places in both numbers.'],[H.div(ans,R(10)),'Count the decimal places in both numbers.']);
      if(k==='frac') cands.push([H.div(a,b),'That divides. To multiply fractions, multiply the tops and multiply the bottoms.'],[H.add(a,b),'You added. This problem multiplies.']);
      if(k==='int') cands.push([H.add(a,b),'You added. This problem multiplies.'],[H.neg(H.add(a,b)),'You added. This problem multiplies.']); }
    else { ans=H.div(a,b); sym=' ÷ '; chk=function(v){ return H.eqR(H.mul(v,b),a); };
      var rule2=(a.n<0)===(b.n<0)?'Same signs give a positive.':'Different signs give a negative.';
      cands=[[H.neg(ans),'Check the sign. '+rule2],[H.div(R(1),ans),'That’s flipped. Divide the first number by the second.']];
      if(k==='dec') cands.push([H.mul(ans,R(10)),'Move both decimal points the same number of places before dividing.'],[H.div(ans,R(10)),'Move both decimal points the same number of places before dividing.']);
      if(k==='frac') cands.unshift([H.mul(a,b),'Dividing means multiplying by the reciprocal: flip the second fraction.']);
      if(k==='int') cands.push([H.sub(a,b),'That subtracts. This problem divides.']); }
    if(ans.n===0) return null;
    if(F(ans)===null) return null;
    var ch=H.choices(H.C(F(ans),ans),cands,F);
    var explain=H.eq(F(a)+sym+bTxt+' = '+H.ans(F(ans)));
    if(op==='add') explain=signRuleAdd(a,b)+' '+explain;
    if(op==='sub') explain='Add the opposite: '+H.eq(F(a)+' + '+H.par(F(H.neg(b)),b.n>0))+'. '+explain;
    if(op==='mul'||op==='div') explain=((a.n<0)===(b.n<0)?'Same signs: positive. ':'Different signs: negative. ')+explain;
    return { prompt:H.big(F(a)+sym+bTxt+' = ?'), choices:ch, check:chk, explain:explain }; }; }
  return { ratAdd:mk('add'), ratSub:mk('sub'), ratMul:mk('mul'), ratDiv:mk('div') };
}

/* ================= 7.3B  Rational number word problems ================= */
function G_wp(H){
  var R=H.R, M=H.money;
  function deg(v){ return H.num(v)+'°F'; }
  return {
  wpTemp:function(){ var s=H.nz(-15,10), c=H.ri(5,22), up=H.chance(0.5), e=up?s+c:s-c; if(e===0||Math.abs(e)===Math.abs(s)) return null;
    var cands=[[up?s-c:s+c, up?'It rose, so add '+c+'.':'It fell, so subtract '+c+'.'],[-e,'Check the sign.'],[Math.abs(s)+(up?c:-c),'Start at '+deg(s)+'. Below zero is negative.'],[e+(up?-10:10),'Start at '+deg(s)+' on a number line and count '+(up?'up':'down')+' '+c+'.']];
    return { prompt:'At 6 a.m. it was '+deg(s)+'. By noon the temperature had '+(up?'risen':'dropped')+' '+c+'°F. What was the temperature at noon?',
      choices:H.choices(H.C(deg(e),e),cands,deg), check:function(v){ return v-s===(up?c:-c); },
      explain:H.eq(H.num(s)+(up?' + ':' − ')+c+' = '+H.ans(deg(e))) }; },
  wpDiff:function(){ var hi=H.ri(2,30), lo=-H.ri(2,20), d=hi-lo;
    var cands=[[hi+lo,'Find the distance between them: '+hi+' − ('+H.num(lo)+') = '+hi+' + '+(-lo)+'.'],[d+10,'Count across zero: '+hi+' down to 0, then 0 down to '+H.num(lo)+'.'],[-lo,'That only gets you from 0 to '+deg(lo)+'.'],[hi,'That only gets you from 0 to '+deg(hi)+'.']];
    function f(v){ return v+'°F'; }
    return { prompt:'The high was '+deg(hi)+' and the low was '+deg(lo)+'. How many degrees warmer was the high than the low?',
      choices:H.choices(H.C(f(d),d),cands,f,function(v){ return v>0; }), check:function(v){ return lo+v===hi; },
      explain:H.eq(hi+' − ('+H.num(lo)+') = '+hi+' + '+(-lo)+' = '+H.ans(d+'°F')) }; },
  wpElev:function(){ var d=H.ri(10,60), r=H.ri(5,30), s=H.ri(5,40), e=-d+r-s; if(e>=0||e===-d) return null;
    function f(v){ return H.num(v)+' ft'; }
    var cands=[[-d-r+s,'Rising moves up (add). Diving deeper moves down (subtract).'],[d+r-s,'Below sea level is negative: start at '+H.num(-d)+' ft.'],[-d+r+s,'Diving deeper moves down, so subtract '+s+'.'],[-e,'Check the sign. The diver is below sea level.']];
    return { prompt:'A diver is at '+H.num(-d)+' feet. She rises '+r+' feet, then dives '+s+' feet deeper. Where is she now?',
      choices:H.choices(H.C(f(e),e),cands,f), check:function(v){ return v+s-r===-d; },
      explain:H.eq(H.num(-d)+' + '+r+' − '+s+' = '+H.ans(f(e))) }; },
  wpBuy:function(){ var have=H.ri(3,10)*500, n=H.ri(2,5), p=H.ri(150,1200); p=p-p%25; var left=have-n*p; if(left<=0) return null;
    var item=H.pick(['notebooks','T-shirts','tacos','movie tickets','phone cases','smoothies']);
    var cands=[[have-p,'You buy '+n+' of them: '+n+' × '+M(p)+' first.'],[n*p,'That’s what you spend. Subtract it from '+M(have)+'.'],[have-n*p+2*p,'Multiply '+n+' × '+M(p)+' carefully.'],[have+n*p,'Spending money means subtract.']];
    return { prompt:'You have '+M(have)+'. You buy '+n+' '+item+' for '+M(p)+' each. How much money is left?',
      choices:H.choices(H.C(M(left),left),cands,M,function(v){ return v>0; }), check:function(v){ var t=v; for(var i=0;i<n;i++) t+=p; return t===have; },
      explain:H.eq(M(have)+' − '+n+' × '+M(p)+' = '+H.ans(M(left))) }; },
  wpBank:function(){ var a=H.ri(5,40)*100+H.pick([0,25,50,75]), b=H.ri(30,90)*100, c=H.ri(10,50)*100+H.pick([0,25,50,75]), e=-a+b-c; if(e===0) return null;
    var cands=[[a+b-c,'Overdrawn means the balance starts negative: '+M(-a)+'.'],[-a+b+c,'A payment takes money out, so subtract '+M(c)+'.'],[-a-b-c,'A deposit adds money.'],[-e,'Check the sign.']];
    return { prompt:'Leo’s account balance is '+M(-a)+'. He deposits '+M(b)+', then pays a '+M(c)+' bill. What is the balance now?',
      choices:H.choices(H.C(M(e),e),cands,M), check:function(v){ return v+c-b===-a; },
      explain:H.eq(M(-a)+' + '+M(b)+' − '+M(c)+' = '+H.ans(M(e))) }; },
  wpSplit:function(){ var n=H.pick([2,3,4,5]), each=H.ri(800,2500), tip=H.ri(2,8)*n*25; if(each*n-tip<n*300) return null; var bill=each*n-tip;
    var cands=[[bill/n+tip,'Split the tip too: add first, then divide by '+n+'.'],[(bill-tip)/n,'The tip adds to the bill.'],[bill+tip,'That’s the total. Share it among '+n+' people.'],[bill/n,'Don’t forget the tip.']];
    return { prompt:n+' friends share a '+M(bill)+' bill and leave a '+M(tip)+' tip. They split it evenly. How much does each person pay?',
      choices:H.choices(H.C(M(each),each),cands,M,function(v){ return Number.isInteger(v)&&v>0; }), check:function(v){ return v*n===bill+tip; },
      explain:H.eq('('+M(bill)+' + '+M(tip)+') ÷ '+n+' = '+H.ans(M(each))) }; },
  wpRecipe:function(){ var a=H.pick([R(1,2),R(3,4),R(2,3),R(1,3),R(1,4),R(3,8)]), b=H.pick([R(3,2),R(5,2),R(2),R(3),R(7,4),R(5,4),R(4,3)]), ans=H.mul(a,b);
    var cands=[[H.add(a,b),'Multiply: cups per batch × number of batches.'],[H.div(b,a),'That divides. Multiply cups per batch by batches.'],[H.div(a,b),'That divides. Multiply cups per batch by batches.']];
    return { prompt:'A recipe uses '+H.fmtF(a)+' cup of sugar per batch. How many cups for '+H.fmtF(b)+' batches?',
      choices:H.choices(H.C(H.fmtF(ans),ans),cands,H.fmtF), check:function(v){ return H.eqR(H.div(v,b),a); },
      explain:H.eq(H.fmtF(a)+' × '+H.fmtF(b)+' = '+H.ans(H.fmtF(ans)+' cups')) }; },
  wpRope:function(){ var p=H.pick([R(3,4),R(1,2),R(2,3),R(3,8),R(5,4),R(3,2)]), k=H.ri(4,12), L=H.mul(p,R(k)); if(L.d===1) return null;
    function f(v){ return H.isR(v)? H.fmtF(v) : ''+v; }
    var cands=[[H.mul(L,p),'Divide the whole length by the length of one piece.'],[R(Math.floor(H.val(L))),'That’s the length in feet, not the number of pieces.'],[H.sub(L,p),'That subtracts one piece. Divide to find how many pieces.'],[R(k+1),'Check: '+(k+1)+' × '+H.fmtFt(p)+' is more than '+H.fmtFt(L)+'.']];
    return { prompt:'A ribbon is '+H.fmtF(L)+' feet long. You cut it into pieces '+H.fmtF(p)+' foot long. How many pieces do you get?',
      choices:H.choices(H.C(''+k,R(k)),cands,f), check:function(v){ return H.eqR(H.mul(v,p),L); },
      explain:H.eq(H.fmtF(L)+' ÷ '+H.fmtF(p)+' = '+H.ans(k+' pieces')) }; },
  wpTrail:function(){ var t=H.add(R(H.ri(4,9)),H.pick([R(1,4),R(1,3),R(1,2),R(1,6),R(1,8)])), h=H.add(R(H.ri(1,3)),H.pick([R(3,4),R(2,3),R(1,2),R(5,6),R(3,8),R(5,8)])), left=H.sub(t,h);
    if(left.n<=0||left.d===1) return null;
    var tw=Math.floor(H.val(t)), hw=Math.floor(H.val(h));
    var cands=[[H.add(t,h),'Subtract what she already hiked.'],[H.add(left,R(1)),'You may need to regroup: borrow 1 whole from '+tw+'.'],[H.sub(left,R(1)),'Check your regrouping.'],[R(tw-hw),'Don’t drop the fractions.']];
    return { prompt:'A trail is '+H.fmtF(t)+' miles long. Ana has hiked '+H.fmtF(h)+' miles. How far does she have left?',
      choices:H.choices(H.C(H.fmtF(left),left),cands,H.fmtF,function(v){ return v.n>0; }), check:function(v){ return H.eqR(H.add(v,h),t); },
      explain:H.eq(H.fmtF(t)+' − '+H.fmtF(h)+' = '+H.ans(H.fmtF(left)+' miles')) }; }
  };
}

/* ================= 7.2  Sets of numbers ================= */
function G_nums(H){
  var R=H.R, NAMES=['Natural numbers','Whole numbers','Integers','Rational numbers'];
  /* 0 natural, 1 whole (only 0), 2 integer, 3 rational */
  function cls(r){ if(r.d!==1) return 3; if(r.n>0) return 0; if(r.n===0) return 1; return 2; }
  /* a number of a given class, with the way it is written; some are disguised (18/3, −12/4) */
  function make(c){ var r, html, note='';
    if(c===0){ var n=H.ri(1,40); if(H.chance(0.3)){ var d=H.pick([2,3,4,5]); r=R(n); html=H.frac(n*d,d); note=H.frac(n*d,d)+' = '+n; } else { r=R(n); html=''+n; } }
    else if(c===1){ r=R(0); html=H.chance(0.3)? H.frac(0,H.pick([3,5,7])) : '0'; if(html!=='0') note=html+' = 0'; }
    else if(c===2){ var m=-H.ri(1,40); r=R(m); if(H.chance(0.3)){ var d2=H.pick([2,3,4]); html=H.MINUS+H.frac(-m*d2,d2); note=html+' = '+H.num(m); } else html=H.num(m); }
    else { var t=H.ri(0,3);
      if(t===0){ var dd=H.pick([3,4,5,7,8]), nn=H.ri(1,dd*3); if(nn%dd===0) nn++; r=R(nn,dd); if(r.d===1) return null; if(H.chance(0.5)) r=H.neg(r); html=H.fmtF(r,true); }
      else if(t===1){ var k=H.nz(-99,99); if(k%10===0) return null; r=R(k,10); html=H.decStr(r); }
      else if(t===2){ var w=H.ri(1,9); r=H.add(R(w),R(1,H.pick([2,4]))); r=H.chance(0.5)?H.neg(r):r; html=H.fmtF(r); }
      else { var dig=H.ri(1,8); r=R(dig,9); html='0.'+dig+dig+dig+'…'; note=html+' repeats, and it equals '+H.frac(dig,9); } }
    return {r:r,html:html,note:note}; }
  function why(chosen,truth){
    if(chosen<truth) return [ 'Natural numbers are the counting numbers 1, 2, 3, …', 'Whole numbers are 0, 1, 2, 3, … No negatives, no fractions.', 'Integers have no fractions or decimals.' ][chosen];
    return 'It is '+(truth===2?'an integer':truth===1?'a whole number':'a natural number')+' too, and that set is smaller. Pick the smallest set.'; }
  var Q={
  numClassify:function(){ var c=H.pick([0,0,1,2,2,3,3,3]), x=make(c); if(!x) return null;
    var ch=[H.C(NAMES[c],c)]; [0,1,2,3].forEach(function(i){ if(i!==c) ch.push(H.C(NAMES[i],i,why(i,c))); });
    return { prompt:'What is the <b>smallest</b> set that '+H.big(x.html)+' belongs to?', choices:ch, keepOrder:true, order:function(v){ return v; },
      check:function(v){ return v===cls(x.r); }, explain:(x.note?H.eq(x.note)+'. ':'')+'It belongs to '+H.ans(NAMES[c])+'.' }; },
  numFind:function(){ var T=H.ri(0,3), spec;
    if(T===0) spec={ ask:'an integer but <b>not</b> a whole number', ok:function(c){ return c===2; }, want:2, others:[[0,'Positive integers are whole numbers.'],[1,'0 is a whole number.'],[3,'Integers have no fractions or decimals.']] };
    else if(T===1) spec={ ask:'a rational number but <b>not</b> an integer', ok:function(c){ return c===3; }, want:3, others:[[2,'That is an integer.'],[0,'That is an integer.'],[1,'0 is an integer.']] };
    else if(T===2) spec={ ask:'a whole number but <b>not</b> a natural number', ok:function(c){ return c===1; }, want:1, others:[[0,'That is a counting (natural) number.'],[2,'Whole numbers have no negatives.'],[3,'Whole numbers have no fractions or decimals.']] };
    else spec={ ask:'<b>not</b> a whole number', ok:function(c){ return c>=2; }, want:H.pick([2,3]), others:[[1,'0 is a whole number.'],[0,'Counting numbers are whole numbers.'],[0,'Check: it simplifies to a counting number.']] };
    var a=make(spec.want); if(!a) return null; var ch=[H.C(a.html,a.r)], used={}; used[a.html]=1;
    for(var i=0;i<spec.others.length;i++){ var o=spec.others[i], b=null, tries=0; do{ b=make(o[0]); tries++; }while((!b||used[b.html]||ch.some(function(c){ return H.eqR(c.val,b.r); }))&&tries<20);
      if(!b) return null; if(T===3&&i===2){ var n=H.ri(2,9), d=H.pick([2,3,4]); b={r:R(n),html:H.frac(n*d,d),note:''}; if(used[b.html]) return null; }
      used[b.html]=1; ch.push(H.C(b.html,b.r,(b.note&&o[0]!==3? H.eq(b.note)+'. ' : '')+o[1])); }
    return { prompt:'Which number is '+spec.ask+'?', choices:ch, check:function(v){ return spec.ok(cls(v)); },
      explain:H.ans(a.html)+' is '+(cls(a.r)===2?'an integer below 0':cls(a.r)===3?'a fraction or decimal that is not an integer':cls(a.r)===1?'0: whole, but not a counting number':'')+'.' }; },
  numVenn:function(){ var c=H.ri(0,3), C=H.COL;
    var box=[[10,10,360,360,'Rational numbers',C.v],[30,56,320,304,'Integers',C.c],[50,102,280,248,'Whole numbers',C.g],[70,148,240,192,'Natural numbers',C.y]], s='';
    box.forEach(function(b){ s+='<rect x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+b[3]+'" rx="22" fill="'+b[5]+'" fill-opacity="0.10" stroke="'+b[5]+'" stroke-width="3"/>'+H.t(b[0]+14,b[1]+31,b[4],21,b[5],'start'); });
    var star=c===3?[328,40]:c===2?[312,86]:c===1?[296,132]:[190,262];
    s+=H.t(star[0],star[1]+14,'★',40,'#FFFFFF');
    var nums=[0,1,2,3].map(function(k){ return make(k); }); if(nums.some(function(n){ return !n; })) return null;
    var whyS=['That is a natural number. It goes in the middle.','0 goes in the whole numbers ring.','Negative integers go in the integers ring.','Fractions and decimals go in the outer ring.'];
    var ch=[H.C(nums[c].html,nums[c].r)]; [0,1,2,3].forEach(function(k){ if(k!==c) ch.push(H.C(nums[k].html,nums[k].r,(nums[k].note?H.eq(nums[k].note)+'. ':'')+whyS[k])); });
    return { prompt:'Which number belongs where the ★ is?', visual:H.svg(s,'Nested sets of numbers'), choices:ch,
      check:function(v){ return cls(v)===c; }, explain:'The ★ is in '+H.ans(NAMES[c])+(c<3?' (but not a smaller ring)':' but outside the integers')+': '+nums[c].html+'.' }; }
  };
  return Q;
}

/* ================= 7.4A–C  Rates and proportionality ================= */
function G_rate(H){
  var R=H.R, C=H.COL;
  /* first-quadrant graph, 0..10 on x; y step chosen so the line fits */
  function qGraph(step,lines,dots,xl,yl){ var o=46, S=310, u=S/10, X=function(x){ return o+x*u; }, Y=function(y){ return 380-o-(y/step)*u; }, s='';
    for(var i=0;i<=10;i++){ s+=H.line(X(i),Y(0),X(i),Y(10*step),C.grid,2)+H.line(X(0),Y(i*step),X(10),Y(i*step),C.grid,2); }
    s+=H.line(X(0),Y(0),X(10),Y(0),C.axis,3)+H.line(X(0),Y(0),X(0),Y(10*step),C.axis,3);
    for(i=2;i<=10;i+=2){ s+=H.t(X(i),Y(0)+24,''+i,17,C.mute)+H.t(X(0)-8,Y(i*step)+6,H.num(i*step),17,C.mute,'end'); }
    s+=H.t(X(0)-8,Y(0)+24,'0',17,C.mute,'end');
    lines.forEach(function(L){ var x2=10, y2=L.f(10); if(y2>10*step){ x2=(10*step-L.b)/L.m; y2=10*step; } if(y2<0){ x2=(0-L.b)/L.m; y2=0; }
      s+=H.line(X(0),Y(L.b),X(x2),Y(y2),L.col||C.c,5); });
    (dots||[]).forEach(function(p){ s+='<circle cx="'+X(p[0]).toFixed(1)+'" cy="'+Y(p[1]).toFixed(1)+'" r="8" fill="'+C.y+'" stroke="#0E1016" stroke-width="3"/>'; });
    if(xl) s+=H.tb(X(10)-2,Y(0)-10,xl,17,C.axis,'end');
    if(yl) s+=H.tb(X(0)+10,Y(10*step)+18,yl,17,C.axis,'start');
    return s; }
  var CTX=[ {a:'miles',b:'hours',rate:'miles per hour',lo:35,hi:75,tlo:2,thi:6,verb:function(A,B){ return 'A car travels '+A+' miles in '+B+' hours.'; }},
    {a:'words',b:'minutes',rate:'words per minute',lo:25,hi:70,tlo:3,thi:9,verb:function(A,B){ return 'Maya types '+A+' words in '+B+' minutes.'; }},
    {a:'pages',b:'days',rate:'pages per day',lo:12,hi:45,tlo:3,thi:8,verb:function(A,B){ return 'Diego reads '+A+' pages in '+B+' days.'; }},
    {a:'gallons',b:'minutes',rate:'gallons per minute',lo:4,hi:15,tlo:6,thi:12,verb:function(A,B){ return 'A hose fills '+A+' gallons in '+B+' minutes.'; }} ];
  return {
  rateUnit:function(){ var c=H.pick(CTX), r=H.ri(c.lo,c.hi), t=H.ri(c.tlo,c.thi), A=r*t;
    function f(v){ return H.fmtD(v)+' '+c.rate; }
    var cands=[[R(A*t),'You multiplied. Divide '+c.a+' by '+c.b+'.'],[R(A+t),'You added. Divide '+c.a+' by '+c.b+'.'],[R(A-t),'You subtracted. Divide '+c.a+' by '+c.b+'.'],[R(r+t),'Check the division: '+A+' ÷ '+t+'.']];
    return { prompt:c.verb(A,t)+' What is the unit rate?', choices:H.choices(H.C(f(R(r)),R(r)),cands,f), check:function(v){ return H.eqR(H.mul(v,R(t)),R(A)); },
      explain:H.eq(A+' ÷ '+t+' = '+H.ans(f(R(r)))) }; },
  rateComplex:function(){ var T=H.pick([
      {a:'mile',as:'miles',b:'hour',bs:'hours',rate:'miles per hour',say:function(A,B){ return 'Ana walks '+A+' mile in '+B+' hour.'; }},
      {a:'wall',as:'walls',b:'hour',bs:'hours',rate:'walls per hour',say:function(A,B){ return 'Sam paints '+A+' of a wall in '+B+' hour.'; }},
      {a:'cup',as:'cups',b:'batch',bs:'batches',rate:'cups per batch',say:function(A,B){ return 'Lily uses '+A+' cup of flour for '+B+' of a batch.'; }} ]);
    var A=H.pick([R(1,2),R(3,4),R(2,3),R(1,3),R(3,8),R(5,6)]), B=H.pick([R(1,4),R(1,2),R(1,3),R(2,3),R(3,4),R(1,6)]); if(H.eqR(A,B)) return null; var u=H.div(A,B);
    if(u.d>4) return null;
    function f(v){ return H.fmtF(v)+' '+T.rate; }
    var cands=[[H.mul(A,B),'Unit rate means divide: '+H.fmtFt(A)+' ÷ '+H.fmtFt(B)+'.'],[H.div(B,A),'That’s '+T.bs+' per '+T.a+'. Divide '+T.as+' by '+T.bs+'.'],[H.add(A,B),'Unit rate means divide, not add.']];
    return { prompt:T.say(H.fmtF(A),H.fmtF(B))+' What is the unit rate?', choices:H.choices(H.C(f(u),u),cands,f), check:function(v){ return H.eqR(H.mul(v,B),A); },
      explain:'Divide: '+H.eq(H.fmtF(A)+' ÷ '+H.fmtF(B)+' = '+H.fmtF(A)+' × '+H.fmtF(H.div(R(1),B))+' = '+H.ans(H.fmtF(u)))+'.' }; },
  rateBest:function(){ var sizes=H.shuffle([6,8,10,12,16,18,20,24,32]).slice(0,4), us=H.shuffle([12,14,15,16,18,20,22,24,25,28,30]).slice(0,4);
    var item=H.pick(['cereal','juice','shampoo','salsa','peanut butter','dog food']), unit=item==='juice'||item==='shampoo'?'fl oz':'oz';
    var opts=sizes.map(function(s,i){ return {s:s,p:s*us[i]}; }), best=0; opts.forEach(function(o,i){ if(o.p*opts[best].s<opts[best].p*o.s) best=i; });
    var bigIdx=0; opts.forEach(function(o,i){ if(o.s>opts[bigIdx].s) bigIdx=i; }); if(bigIdx===best&&H.chance(0.6)) return null;      /* biggest isn't always best */
    function lab(o){ return o.s+' '+unit+' for '+H.money(o.p); }
    var ch=[H.C(lab(opts[best]),{s:opts[best].s,p:opts[best].p})]; opts.forEach(function(o,i){ if(i!==best) ch.push(H.C(lab(o),{s:o.s,p:o.p},'That costs '+(o.p/o.s)+'¢ per '+unit+'. Compare cost ÷ size.')); });
    return { prompt:'Which size of '+item+' is the best buy?', choices:ch,
      check:function(v){ return opts.every(function(o){ return o.s===v.s&&o.p===v.p || v.p*o.s<o.p*v.s; }); },
      explain:'Price ÷ size: '+H.money(opts[best].p)+' ÷ '+opts[best].s+' = '+H.ans((opts[best].p/opts[best].s)+'¢ per '+unit)+', the lowest.' }; },
  rateKTable:function(){ var k=H.pick([R(2),R(3),R(4),R(5),R(6),R(8),R(1,2),R(3,2),R(5,2),R(1,4),R(3,4)]), step=H.pick([1,2,3]), x0=H.pick([1,2,3]);
    var xs=[0,1,2,3].map(function(i){ return x0+i*step; }), ys=xs.map(function(x){ return H.mul(k,R(x)); }); if(ys.some(function(y){ return H.decStr(y)===null; })) return null;
    function f(v){ return H.fmtF(v); }
    var cands=[[H.div(R(1),k),'That’s x ÷ y. The constant k = y ÷ x.'],[H.mul(k,R(step)),'That’s how much y changes when x goes up '+step+'. Find y ÷ x.'],[ys[0],'That’s a y-value. Divide y by x.'],[H.add(k,R(1)),'Check: y ÷ x for any row.']];
    var visual=H.svg(H.table(['x','y'],xs.map(function(x,i){ return [''+x,H.decStr(ys[i])]; })),'Table of x and y');
    return { prompt:'The table shows a proportional relationship. What is the constant of proportionality (k)?', visual:visual,
      choices:H.choices(H.C(f(k),k),cands,f,function(v){ return v.n>0; }), check:function(v){ return xs.every(function(x,i){ return H.eqR(H.mul(v,R(x)),ys[i]); }); },
      explain:'k = y ÷ x: '+H.eq(H.decStr(ys[0])+' ÷ '+xs[0]+' = '+H.ans(f(k)))+'.' }; },
  rateKGraph:function(){ var k=H.pick([R(1),R(2),R(3),R(1,2),R(3,2),R(5,2),R(4),R(5)]), step=H.val(k)>2?(H.val(k)>3?5:2):1;
    var px=k.d===1? H.ri(2,Math.floor(10*step/H.val(k))) : 2*H.ri(1,Math.floor(10*step/H.val(k)/2)); if(px<1||px>10) return null; var py=H.val(k)*px; if(py>10*step||py%step!==0) return null;
    var ctx=H.pick([['Hours','Dollars earned'],['Gallons','Miles'],['Minutes','Laps'],['Pounds','Cost ($)']]);
    var vis=H.svg(qGraph(step,[{m:H.val(k),b:0,f:function(x){ return H.val(k)*x; }}],[[0,0],[px,py]],ctx[0],ctx[1]),'Graph of a line through the origin');
    function f(v){ return H.fmtF(v); }
    var cands=[[H.div(R(1),k),'That’s x ÷ y. Use y ÷ x.'],[R(py),'That’s the y-value of the point. Divide it by x.'],[R(px),'That’s the x-value of the point. Find y ÷ x.'],[H.add(k,R(1)),'Pick a point and find y ÷ x.']];
    return { prompt:'What is the constant of proportionality for the graph?', visual:vis, choices:H.choices(H.C(f(k),k),cands,f), check:function(v){ return H.eqR(H.mul(v,R(px)),R(py)); },
      explain:'The point ('+px+', '+py+'): '+H.eq(py+' ÷ '+px+' = '+H.ans(f(k)))+'.' }; },
  rateEq:function(){ var words=H.chance(0.5), k=words? H.D(H.pick([1.25,2.5,7.5,0.75,12,8.5,3.25,15])) : H.pick([R(2),R(3),R(5),R(1,2),R(3,2),R(4),R(5,2)]), ks=H.decStr(k)||H.fmtF(k), kinv=H.div(R(1),k);
    var pts=[[2,H.val(k)*2],[4,H.val(k)*4],[6,H.val(k)*6]], prompt, vis='';
    if(words){ var c=H.pick([['Apples cost $'+H.fixed(Math.round(H.val(k)*100),2)+' per pound.','cost','pounds'],['A worker earns $'+H.fixed(Math.round(H.val(k)*100),2)+' per hour.','pay','hours']]);
      if(H.val(k)>=10) return null; prompt=c[0]+' Which equation shows the '+c[1]+' y for x '+c[2]+'?'; }
    else { prompt='Which equation represents the table?'; vis=H.svg(H.table(['x','y'],pts.concat([[8,H.val(k)*8]]).map(function(p){ return [''+p[0],H.decStr(H.D(p[1]))]; })),'Table of x and y'); }
    function lab(v){ return v.t==='mul'? 'y = '+(v.k.d===1&&v.k.n===1?'':(H.decStr(v.k)||H.fmtF(v.k)))+'x' : v.t==='add'? 'y = x + '+(H.decStr(v.k)||H.fmtF(v.k)) : 'x = '+(H.decStr(v.k)||H.fmtF(v.k))+'y'; }
    var right={t:'mul',k:k};
    var ch=[H.C(lab(right),right),H.C(lab({t:'add',k:k}),{t:'add',k:k},'A proportional relationship multiplies: y = kx.'),H.C(lab({t:'inv',k:k}),{t:'inv',k:k},'x and y are switched. y = kx.')];
    var dinv=H.decStr(kinv); ch.push(H.C(lab({t:'mul',k:kinv}),{t:'mul',k:kinv},'That’s x ÷ y. k = y ÷ x.'));
    if(dinv===null&&kinv.d>8) return null;
    return { prompt:prompt, visual:vis, choices:ch,
      check:function(v){ return pts.every(function(p){ var x=R(p[0]), y=H.D(p[1]); return v.t==='mul'? H.eqR(H.mul(v.k,x),y) : v.t==='add'? H.eqR(H.add(x,v.k),y) : H.eqR(H.mul(v.k,y),x); }); },
      explain:'k = y ÷ x = '+ks+', so '+H.ans(lab(right))+'.' }; }
  };
}

/* ================= 7.4D  Percents ================= */
function G_pct(H){
  var R=H.R, M=H.money;
  function P(v){ return H.fmtD(v)+'%'; }
  return {
  pctOf:function(){ var p=H.pick([5,10,15,20,25,30,35,40,45,60,75,80,12,8]), n=H.pick([20,40,60,80,120,150,200,240,300,50,90,160]), a=R(p*n,100); if(H.decStr(a)===null||a.d>10) return null;
    var cands=[[H.mul(a,R(10)),'Percent means out of 100: '+p+'% = '+H.decStr(R(p,100))+'.'],[H.sub(R(n),a),'That’s what is left after taking away '+p+'%.'],[R(n-p),p+'% of '+n+' means '+H.decStr(R(p,100))+' × '+n+', not '+n+' − '+p+'.'],[H.div(a,R(10)),'Percent means out of 100: '+p+'% = '+H.decStr(R(p,100))+'.']];
    return { prompt:'What is '+H.big(p+'% of '+n)+'?', choices:H.choices(H.C(H.decStr(a),a),cands,H.fmtD), check:function(v){ return H.eqR(H.mul(v,R(100)),R(p*n)); },
      explain:H.eq(H.decStr(R(p,100))+' × '+n+' = '+H.ans(H.decStr(a))) }; },
  pctWhole:function(){ var p=H.pick([10,20,25,40,50,75,30,60,15]), w=H.pick([40,60,80,120,200,160,240,300]), part=R(p*w,100); if(part.d!==1) return null;
    var cands=[[H.mul(part,R(p,100)),'That finds '+p+'% of '+part.n+'. Here '+part.n+' is the part; find the whole.'],[R(w-part.n),'That’s the rest, not the whole.'],[H.div(H.mul(part,R(100)),R(100-p)),'Use '+p+'% in the proportion, not '+(100-p)+'%.'],[R(part.n+p),'Set up part ÷ whole = '+p+' ÷ 100.']];
    return { prompt:H.big(part.n+' is '+p+'% of what number?'), choices:H.choices(H.C(''+w,R(w)),cands,H.fmtD,function(v){ return H.decStr(v)!==null; }),
      check:function(v){ return H.eqR(H.mul(v,R(p,100)),part); }, explain:H.eq(part.n+' ÷ '+H.decStr(R(p,100))+' = '+H.ans(''+w)) }; },
  pctChange:function(){ var o=H.pick([20,25,40,50,60,80,120,150,200,250]), p=H.pick([10,15,20,25,30,40,50,60,75]), up=H.chance(0.5); var ch=o*p/100; if(ch%1!==0) return null; var n=up?o+ch:o-ch;
    var cands=[[H.div(R(ch*100),R(n)),'Divide the change by the <b>original</b> amount ('+M(o*100)+'), not the new one.'],[R(ch),'That’s the change in dollars. Divide it by the original.'],[R(up?100+p:100-p),'That’s the new price as a percent of the old. Find the change.'],[R(p+10),'Find the change, then divide by the original.']];
    return { prompt:'A price went from '+M(o*100)+' to '+M(n*100)+'. What is the percent '+(up?'increase':'decrease')+'?',
      choices:H.choices(H.C(p+'%',R(p)),cands,P,function(v){ return H.decStr(v)!==null&&v.d<=10; }), check:function(v){ return H.eqR(H.mul(v,R(o)),R(ch*100)); },
      explain:'Change ÷ original: '+H.eq(ch+' ÷ '+o+' = '+H.ans(p+'%'))+'.' }; },
  pctApply:function(){ var o=H.pick([400,1200,2400,800,1500,3000,250,600]), p=H.pick([5,10,15,20,25,4,8]), up=H.chance(0.6), ch=o*p/100; if(ch%1!==0) return null; var n=up?o+ch:o-ch;
    var ctx=up? H.pick([['A town has '+H.num(o)+' people. The population grows '+p+'%. What is the new population?','people'],['A school had '+H.num(o)+' books. The library adds '+p+'% more. How many books now?','books']])
              : H.pick([['A lake had '+H.num(o)+' fish. The number dropped '+p+'%. How many fish now?','fish'],['A game had '+H.num(o)+' players. Players dropped '+p+'%. How many players now?','players']]);
    function f(v){ return H.num(v)+' '+ctx[1]; }
    var cands=[[ch,'That’s the change. '+(up?'Add it to':'Subtract it from')+' '+H.num(o)+'.'],[up?o-ch:o+ch,up?'It grows, so add.':'It drops, so subtract.'],[up?o+p:o-p,'Find '+p+'% of '+H.num(o)+' first.']];
    return { prompt:ctx[0], choices:H.choices(H.C(f(n),n),cands,f), check:function(v){ return (v-o)*100===(up?1:-1)*p*o; },
      explain:H.eq(H.num(o)+(up?' + ':' − ')+H.decStr(R(p,100))+' × '+H.num(o)+' = '+H.ans(f(n))) }; },
  pctDisc:function(){ var d=H.pick([10,15,20,25,30,40,50,60,35]), P0=H.pick([20,24,36,40,48,60,80,90,120,45,64])*100, off=P0*d/100; if(off%5!==0) return null; var sale=P0-off;
    var item=H.pick(['jacket','pair of shoes','video game','backpack','skateboard','headset']);
    var cands=[[off,'That’s how much you save. Subtract it from the price.'],[P0+off,'A discount lowers the price.'],[P0-d*100,'Take '+d+'% of the price, not $'+d+'.'],[P0*d/1000,'Percent means out of 100.']];
    return { prompt:'A '+M(P0)+' '+item+' is '+d+'% off. What is the sale price?', choices:H.choices(H.C(M(sale),sale),cands,M,function(v){ return Number.isInteger(v)&&v>0; }),
      check:function(v){ return v*100===P0*(100-d); }, explain:'Pay '+(100-d)+'%: '+H.eq(H.decStr(R(100-d,100))+' × '+M(P0)+' = '+H.ans(M(sale)))+'.' }; },
  pctMarkup:function(){ var c=H.pick([20,24,30,40,50,60,80,12,16])*100, m=H.pick([20,25,40,50,30,75,60]), up=c*m/100; if(up%5!==0) return null; var s=c+up;
    var cands=[[up,'That’s only the markup. Add it to the cost.'],[c-up,'A markup raises the price.'],[c+m*100,'Take '+m+'% of the cost, not $'+m+'.']];
    return { prompt:'A store pays '+M(c)+' for a hoodie and marks it up '+m+'%. What is the selling price?', choices:H.choices(H.C(M(s),s),cands,M,function(v){ return v>0; }),
      check:function(v){ return v*100===c*(100+m); }, explain:'Charge '+(100+m)+'%: '+H.eq(H.decStr(R(100+m,100))+' × '+M(c)+' = '+H.ans(M(s)))+'.' }; },
  pctDeal:function(){ var P0=H.pick([40,60,80,120,50,100,90])*100;
    var deals=[ {t:'$'+H.pick([10,12,15,18,20])+' off', s:function(t){ return +t.slice(1,t.indexOf(' '))*100; }},
      {t:H.pick([10,15,20,25,30])+'% off', s:function(t){ return P0*parseInt(t,10)/100; }},
      {t:H.pick(['1/4','1/5','1/3','1/2'])+' off', s:function(t){ var a=t.split(' ')[0].split('/'); return P0*(+a[0])/(+a[1]); }},
      {t:'Pay '+H.pick([70,75,80,85,90])+'% of the price', s:function(t){ return P0*(100-parseInt(t.slice(4),10))/100; }} ];
    var sv=deals.map(function(d){ return d.s(d.t); }); if(sv.some(function(v){ return v%1!==0; })) return null; var best=0; sv.forEach(function(v,i){ if(v>sv[best]) best=i; });
    if(sv.filter(function(v){ return v===sv[best]; }).length>1) return null;
    var ch=[H.C(deals[best].t,{i:best})]; deals.forEach(function(d,i){ if(i!==best) ch.push(H.C(d.t,{i:i},'That saves '+M(sv[i])+'. Another deal saves more.')); });
    return { prompt:'Which deal saves the most on a '+M(P0)+' item?', choices:ch, check:function(v){ return sv.every(function(x){ return x<=sv[v.i]; }); },
      explain:H.ans(deals[best].t)+' saves '+M(sv[best])+', the most.' }; },
  pctTax:function(){ var P0=H.ri(3,30)*400, tax=P0*825/10000, tot=P0+tax;
    var item=H.pick(['bike','phone','pair of jeans','lamp','soccer ball','backpack']);
    var cands=[[tax,'That’s just the tax. Add it to the price.'],[P0+825,'8.25% of the price is not $8.25.'],[P0+P0*825/1000,'8.25% = 0.0825. Count the decimal places.'],[P0-tax,'Sales tax adds to the price.']];
    return { prompt:'In Texas the sales tax is 8.25%. What is the total cost of a '+M(P0)+' '+item+'?', choices:H.choices(H.C(M(tot),tot),cands,M,function(v){ return Number.isInteger(v)&&v>0; }),
      check:function(v){ return v*10000===P0*10825; }, explain:'Tax: '+H.eq('0.0825 × '+M(P0)+' = '+M(tax))+'. Total: '+H.ans(M(tot))+'.' }; },
  pctTip:function(){ var p=H.pick([15,18,20]), m=H.ri(12,60)*100+H.pick([0,50]), tip=m*p/100; if(tip%1!==0) return null; var tot=m+tip;
    var cands=[[tip,'That’s just the tip. Add it to the bill.'],[m+p*100,p+'% of the bill is not $'+p+'.'],[m-tip,'A tip adds to the bill.'],[m+tip*10,'Percent means out of 100: '+p+'% = '+H.decStr(R(p,100))+'.']];
    return { prompt:'Dinner costs '+M(m)+'. You leave a '+p+'% tip. What is the total?', choices:H.choices(H.C(M(tot),tot),cands,M,function(v){ return Number.isInteger(v)&&v>0; }),
      check:function(v){ return v*100===m*(100+p); }, explain:'Tip: '+H.eq(H.decStr(R(p,100))+' × '+M(m)+' = '+M(tip))+'. Total: '+H.ans(M(tot))+'.' }; }
  };
}

/* ================= 7.4E  Measurement conversions ================= */
function G_conv(H){
  var R=H.R;
  var U={ in:['inch','inches'], ft:['foot','feet'], yd:['yard','yards'], mi:['mile','miles'], oz:['ounce','ounces'], lb:['pound','pounds'], T:['ton','tons'],
    floz:['fluid ounce','fluid ounces'], c:['cup','cups'], pt:['pint','pints'], qt:['quart','quarts'], gal:['gallon','gallons'],
    mm:['millimeter','millimeters'], cm:['centimeter','centimeters'], m:['meter','meters'], km:['kilometer','kilometers'], mg:['milligram','milligrams'], g:['gram','grams'], kg:['kilogram','kilograms'], mL:['milliliter','milliliters'], L:['liter','liters'] };
  /* [big, small, how many small in one big] */
  var LEN=[['ft','in',12],['yd','ft',3],['yd','in',36],['mi','ft',5280],['mi','yd',1760]];
  var WC=[['lb','oz',16],['T','lb',2000],['c','floz',8],['pt','c',2],['qt','pt',2],['gal','qt',4],['qt','c',4]];
  var MET=[['cm','mm',10],['m','cm',100],['km','m',1000],['g','mg',1000],['kg','g',1000],['L','mL',1000],['m','mm',1000]];
  var NICE=[R(1,2),R(1,4),R(3,4),R(3,2),R(5,2),R(2),R(3),R(4),R(5),R(6),R(9,2),R(7,2),R(8),R(7,4),R(10)];
  var NICEM=NICE.concat([R(32,10),R(45,100),R(125,10),R(6,10),R(275,100),R(15,10)]);
  function nm(u,v){ return H.eqR(v,R(1))? U[u][0] : U[u][1]; }
  function mk(list,metric){ return function(){ var c=H.pick(list), big=c[0], sm=c[1], f=c[2], down=H.chance(0.5), a=H.pick(metric?NICEM:NICE);
    if(c[2]>=1760&&!H.eqR(a,R(1,2))&&!H.eqR(a,R(1,4))&&!H.eqR(a,R(1))&&!H.eqR(a,R(3,4))&&!H.eqR(a,R(2))&&!H.eqR(a,R(3,2))) return null;
    /* down: big → small (multiply). up: small → big (divide). a is always the number of big units */
    var smallN=H.mul(a,R(f)), give=down?a:smallN, ans=down?smallN:a, from=down?big:sm, to=down?sm:big;
    if(smallN.d!==1&&!metric) return null; if(H.decStr(give)===null||H.decStr(ans)===null) return null;
    var wrongF=metric? (f===10?100:10) : (f===12?10:f===3?12:f===16?10:f===2?4:f===4?2:f===8?16:f===36?12:f===2000?1000:f===5280?1000:f===1760?3:10);
    var cands=[[down?H.div(give,R(f)):H.mul(give,R(f)), down?'Big units to small units: there are more of them, so multiply by '+H.num(f)+'.':'Small units to big units: there are fewer of them, so divide by '+H.num(f)+'.'],
      [down?H.mul(give,R(wrongF)):H.div(give,R(wrongF)),'1 '+U[big][0]+' = '+H.num(f)+' '+U[sm][1]+'.']];
    if(metric) cands.push([H.mul(ans,R(10)),'Count the zeros: 1 '+U[big][0]+' = '+H.num(f)+' '+U[sm][1]+'.'],[H.div(ans,R(10)),'Count the zeros: 1 '+U[big][0]+' = '+H.num(f)+' '+U[sm][1]+'.']);
    else cands.push([down?H.add(give,R(f)):H.sub(give,R(f)),'Multiply or divide by '+H.num(f)+'. Don’t add or subtract.'],[H.mul(ans,R(2)),'Check: 1 '+U[big][0]+' = '+H.num(f)+' '+U[sm][1]+'.']);
    function fm(v){ return H.decStr(v)===null? null : H.decStr(v)+' '+nm(to,v); }
    return { prompt:H.big(H.decStr(give)+' '+(H.eqR(give,R(1))?U[from][0]:U[from][1]))+' = how many '+U[to][1]+'?',
      choices:H.choices(H.C(fm(ans),ans),cands,fm,function(v){ return v.n>0&&H.decStr(v)!==null; }),
      check:function(v){ return down? H.eqR(H.div(v,R(f)),give) : H.eqR(H.mul(v,R(f)),give); },
      explain:'1 '+U[big][0]+' = '+H.num(f)+' '+U[sm][1]+'. '+H.eq(H.decStr(give)+(down?' × ':' ÷ ')+H.num(f)+' = '+H.ans(H.decStr(ans)+' '+nm(to,ans)))+'.' }; }; }
  return { convLen:mk(LEN,false), convWC:mk(WC,false), convMet:mk(MET,true) };
}

/* ================= 7.5A, 7.5C  Scale drawings and similar figures ================= */
function G_scale(H){
  var R=H.R, C=H.COL;
  function F(v){ return H.fmtD(v); }
  /* two similar shapes side by side; s = [w,h] small, k = scale factor; unknown 'w' or 'h' on the big one */
  function drawPair(kind,s,k,unknown,unit){ var w1=s[0],h1=s[1],w2=H.val(k)*w1,h2=H.val(k)*h1, sc=Math.min(150/Math.max(w1,w2*0.62), 230/Math.max(h1,h2), 230/w2*0.95), o='';
    var a=[30,320], b=[30+w1*sc+50,320]; if(b[0]+w2*sc>365){ sc=sc*(335-30-50)/((w1+w2)*sc); b=[30+w1*sc+50,320]; }
    function shape(p,w,h,col){ return kind==='rect'? H.poly([[p[0],p[1]],[p[0]+w*sc,p[1]],[p[0]+w*sc,p[1]-h*sc],[p[0],p[1]-h*sc]],col+'22',col,4) : H.poly([[p[0],p[1]],[p[0]+w*sc,p[1]],[p[0],p[1]-h*sc]],col+'22',col,4); }
    o+=shape(a,w1,h1,C.c)+shape(b,w2,h2,C.p);
    o+=H.tb(a[0]+w1*sc/2,a[1]+28,F(R(w1))+' '+unit,20)+H.tb(a[0]-8,a[1]-h1*sc/2+7,F(R(h1)),20,C.ink,'end');
    o+=H.tb(b[0]+w2*sc/2,b[1]+28,(unknown==='w'?'x':F(H.mul(k,R(w1))))+' '+unit,20,unknown==='w'?C.y:C.ink)+H.tb(b[0]-8,b[1]-h2*sc/2+7,unknown==='h'?'x':F(H.mul(k,R(h1))),20,unknown==='h'?C.y:C.ink,'end');
    o+=H.t(a[0]+w1*sc/2,a[1]-h1*sc-12,'A',22,C.c)+H.t(b[0]+w2*sc/2,b[1]-h2*sc-12,'B',22,C.p);
    return H.svg(o,'Two similar figures'); }
  return {
  scaleActual:function(){ var a=H.pick([R(1),R(1),R(2),R(1,2),R(1,4)]), b=H.pick([5,8,10,12,15,20,25,40,50]), unitA=H.pick(['inch','cm']), unitB=unitA==='inch'?H.pick(['miles','feet']):H.pick(['km','meters']);
    var m=H.pick([R(3),R(5,2),R(7,2),R(9,2),R(6),R(3,2),R(5),R(15,4),R(8)]); var act=H.mul(H.div(m,a),R(b)); if(H.decStr(act)===null) return null;
    var sa=(H.fmtF(a))+' '+(H.val(a)<=1?unitA:(unitA==='inch'?'inches':'cm')), map=H.decStr(m)+' '+(unitA==='inch'?'inches':'cm');
    function f(v){ return H.decStr(v)===null? null : H.decStr(v)+' '+unitB; }
    var cands=[[H.add(m,R(b)),'Use the scale as a ratio. Don’t add.'],[H.mul(m,R(b)),H.eqR(a,R(1))?'Check: '+H.decStr(m)+' × '+b+'.':'First find what 1 '+unitA+' stands for: '+b+' ÷ '+H.decStr(a)+'.'],[H.div(R(b),m),'Divide the other way: map length ÷ scale length, then × '+b+'.'],[H.mul(act,R(10)),'Check the decimal point.']];
    return { prompt:'On a map, '+sa+' = '+b+' '+unitB+'. Two towns are '+map+' apart on the map. What is the real distance?',
      choices:H.choices(H.C(f(act),act),cands,f,function(v){ return v.n>0; }), check:function(v){ return H.eqR(H.mul(v,a),H.mul(m,R(b))); },
      explain:H.eq(H.decStr(m)+' ÷ '+H.decStr(a)+' × '+b+' = '+H.ans(f(act)))+'.' }; },
  scaleDraw:function(){ var b=H.pick([2,4,5,8,10]), act=H.pick([R(12),R(14),R(18),R(20),R(24),R(30),R(36),R(40),R(15),R(22)]), d=H.div(act,R(b)); if(H.decStr(d)===null) return null;
    var room=H.pick(['A classroom','A garden','A basketball court','A kitchen','A bedroom']);
    function f(v){ return H.decStr(v)===null? null : H.decStr(v)+' in'; }
    var cands=[[H.mul(act,R(b)),'A drawing is smaller than the real thing. Divide by '+b+'.'],[H.sub(act,R(b)),'Use the scale as a ratio. Don’t subtract.'],[R(act.n/10),'Use the scale: 1 inch = '+b+' feet.'],[H.add(d,R(1)),'Check: '+H.decStr(act)+' ÷ '+b+'.']];
    return { prompt:'A scale drawing uses 1 inch = '+b+' feet. '+room+' is '+H.decStr(act)+' feet long. How long is it on the drawing?',
      choices:H.choices(H.C(f(d),d),cands,f,function(v){ return v.n>0; }), check:function(v){ return H.eqR(H.mul(v,R(b)),act); },
      explain:H.eq(H.decStr(act)+' ÷ '+b+' = '+H.ans(f(d)))+'.' }; },
  scaleSimilar:function(){ var kind=H.pick(['rect','tri']), w=H.ri(2,8), h=H.ri(2,8); if(w===h) return null; var k=H.pick([R(2),R(3),R(3,2),R(5,2),R(4),R(5,4)]), unknown=H.pick(['w','h']);
    var x=H.mul(k,R(unknown==='w'?w:h)), other=unknown==='w'?h:w, otherBig=H.mul(k,R(other)), sameS=unknown==='w'?w:h; if(H.decStr(x)===null||H.decStr(otherBig)===null) return null;
    var unit=H.pick(['cm','in','ft','m']);
    function f(v){ return H.decStr(v)===null? null : H.decStr(v)+' '+unit; }
    var cands=[[H.add(R(sameS),H.sub(otherBig,R(other))),'Similar figures multiply by a scale factor. They don’t add the same amount.'],[H.div(H.mul(R(sameS),R(other)),otherBig),'Match the sides: small to small, big to big. Then multiply by the scale factor.'],[H.mul(otherBig,R(sameS)),'Set up a ratio of matching sides.'],[H.add(x,R(2)),'Scale factor = '+H.decStr(otherBig)+' ÷ '+other+'.']];
    return { prompt:(kind==='rect'?'Rectangle':'Triangle')+' A is similar to '+(kind==='rect'?'rectangle':'triangle')+' B. What is x?', visual:drawPair(kind,[w,h],k,unknown,unit),
      choices:H.choices(H.C(f(x),x),cands,f,function(v){ return v.n>0&&H.decStr(v)!==null; }), check:function(v){ return H.eqR(H.mul(v,R(other)),H.mul(otherBig,R(sameS))); },
      explain:'Scale factor: '+H.eq(H.decStr(otherBig)+' ÷ '+other+' = '+H.decStr(k))+'. So x = '+H.eq(sameS+' × '+H.decStr(k)+' = '+H.ans(f(x)))+'.' }; },
  scaleFactor:function(){ var a=H.ri(3,12), k=H.pick([R(2),R(3),R(3,2),R(5,2),R(1,2),R(4),R(1,3),R(2,3)]), b=H.mul(R(a),k); if(b.d!==1||b.n===a) return null;
    var nm=H.pick([['ABC','DEF','AB','DE'],['PQR','XYZ','PQ','XY'],['JKL','MNO','JK','MN']]);
    var cands=[[H.div(R(1),k),'That’s from '+nm[1]+' to '+nm[0]+'. Divide the new side by the original side.'],[R(Math.abs(b.n-a)),'A scale factor multiplies. It is not the difference.'],[R(a+b.n),'Divide the new side by the original side.'],[R(a*b.n),'Divide the new side by the original side.']];
    return { prompt:'Triangle '+nm[0]+' is similar to triangle '+nm[1]+'. '+nm[2]+' = '+a+' and '+nm[3]+' = '+b.n+'. What is the scale factor from '+nm[0]+' to '+nm[1]+'?',
      choices:H.choices(H.C(H.fmtF(k),k),cands,H.fmtF,function(v){ return v.n>0; }), check:function(v){ return H.eqR(H.mul(v,R(a)),b); },
      explain:'New ÷ original: '+H.eq(b.n+' ÷ '+a+' = '+H.ans(H.fmtF(k)))+'.' }; }
  };
}

/* ================= 7.5B, 7.9B  Circles (π ≈ 3.14) =================
   Lengths and areas are kept in hundredths as whole numbers, so 3.14 × 5 × 5 = 78.5 is exact. */
function G_circ(H){
  var R=H.R, C=H.COL;
  function hu(n){ return H.fixed(n,2,true); }
  function circle(label,useD,extra){ var s='<circle cx="190" cy="190" r="140" fill="'+C.c+'1A" stroke="'+C.c+'" stroke-width="5"/><circle cx="190" cy="190" r="6" fill="'+C.ink+'"/>';
    if(useD===true) s+=H.line(50,190,330,190,C.y,5)+H.tb(190,178,label,28,C.y);
    else if(useD===false) s+=H.line(190,190,330,190,C.y,5)+H.tb(260,178,label,28,C.y);
    if(extra) s+=H.tb(190,90,extra,28,C.p);
    return H.svg(s,'A circle'); }
  return {
  circC:function(){ var r=H.ri(2,15), useD=H.chance(0.5), d=2*r, unit=H.pick(['cm','in','ft','m']), C100=314*d;
    function f(v){ return hu(v)+' '+unit; }
    var cands=[[314*r,useD?'C = πd. Use the whole diameter, '+d+'.':'C = πd = 2πr. Double the radius first: d = '+d+'.'],[314*r*r,'That’s the area (πr²). Circumference is the distance around.'],[314*d*2,'C = πd. Don’t double the diameter.'],[314*d+100,'Multiply: 3.14 × '+d+'.']];
    return { prompt:'Find the circumference. Use 3.14 for π.', visual:circle((useD?'d = ':'r = ')+(useD?d:r)+' '+unit,useD),
      choices:H.choices(H.C(f(C100),C100),cands,f), check:function(v){ return v*1===314*(r+r); },
      explain:'C = πd: '+H.eq('3.14 × '+d+' = '+H.ans(f(C100)))+'.' }; },
  circA:function(){ var r=H.ri(2,12), useD=H.chance(0.5), d=2*r, unit=H.pick(['cm','in','ft','m']), A100=314*r*r;
    function f(v){ return hu(v)+' '+unit+'²'; }
    var cands=[[314*d*d,'Use the radius: r = '+d+' ÷ 2 = '+r+'.'],[314*d,'That’s the circumference. Area is πr².'],[314*r,'Square the radius: r² = '+r+' × '+r+'.'],[314*r*2,'r² means '+r+' × '+r+', not '+r+' × 2.']];
    if(!useD) cands.shift();
    return { prompt:'Find the area. Use 3.14 for π.', visual:circle((useD?'d = ':'r = ')+(useD?d:r)+' '+unit,useD),
      choices:H.choices(H.C(f(A100),A100),cands,f), check:function(v){ var rr=0; for(var i=0;i<r;i++) rr+=r; return v===314*rr; },
      explain:(useD?'r = '+r+'. ':'')+'A = πr²: '+H.eq('3.14 × '+r+' × '+r+' = '+H.ans(f(A100)))+'.' }; },
  circBack:function(){ var unit=H.pick(['cm','in','ft','m']);
    if(H.chance(0.55)){ var d=H.ri(2,30), C100=314*d, askR=H.chance(0.4)&&d%2===0, ans=askR?d/2:d;
      function f(v){ return H.decStr(R(v,100))===null?null:H.decStr(R(v,100))+' '+unit; }
      var cands=[[askR?d*100:d*50,askR?'That’s the diameter. The radius is half of it.':'That’s the radius. The diameter is twice as long.'],[Math.round(C100*314/100),'Divide by 3.14, don’t multiply.'],[C100/2,'Divide the circumference by 3.14.'],[(ans+1)*100,'Check: 3.14 × '+(ans+1)+(askR?' × 2':'')+' ≠ '+hu(C100)+'.']];
      return { prompt:'A circle has a circumference of '+hu(C100)+' '+unit+'. What is its '+(askR?'radius':'diameter')+'? Use 3.14 for π.', visual:circle('',null,'C = '+hu(C100)+' '+unit),
        choices:H.choices(H.C(f(ans*100),ans*100),cands,f,function(v){ return v>0; }), check:function(v){ return 314*(askR?2*v:v)===C100*100; },
        explain:'d = C ÷ π: '+H.eq(hu(C100)+' ÷ 3.14 = '+d)+(askR?', so r = '+H.ans(f(ans*100)):' = '+H.ans(f(ans*100)))+'.' }; }
    var r=H.ri(2,10), A100=314*r*r;
    function g(v){ return H.decStr(R(v,100))===null?null:H.decStr(R(v,100))+' '+unit; }
    var c2=[[r*r*100,'That’s r². Now find the number that times itself makes '+(r*r)+'.'],[2*r*100,'That’s the diameter. The question asks for the radius.'],[Math.round(A100/2/3.14)*1,'Area is πr². Divide by 3.14, then take the square root.'],[(r+1)*100,'Check: 3.14 × '+(r+1)+' × '+(r+1)+' is too big.']];
    return { prompt:'A circle has an area of '+hu(A100)+' '+unit+'². What is its radius? Use 3.14 for π.', visual:circle('',null,'A = '+hu(A100)+' '+unit+'²'),
      choices:H.choices(H.C(g(r*100),r*100),c2,g,function(v){ return v>0; }), check:function(v){ return v%100===0&&314*(v/100)*(v/100)===A100; },
      explain:H.eq(hu(A100)+' ÷ 3.14 = '+(r*r))+', and '+H.eq(r+' × '+r+' = '+(r*r))+', so r = '+H.ans(g(r*100))+'.' }; }
  };
}

/* ================= 7.8, 7.9A, 7.9C, 7.9D  Area, volume and surface area ================= */
function G_geo(H){
  var R=H.R, C=H.COL;
  /* a box: l across, w into the page, h up */
  function box(l,w,h,labels){ var dx=0.55, dy=0.4, sc=Math.min(250/(l+w*dx), 230/(h+w*dy)), x0=(380-(l+w*dx)*sc)/2, y0=380-(380-(h+w*dy)*sc)/2-10;
    var A=[x0,y0], B=[x0+l*sc,y0], Cc=[x0+l*sc,y0-h*sc], D=[x0,y0-h*sc], ox=w*dx*sc, oy=-w*dy*sc;
    function o(p){ return [p[0]+ox,p[1]+oy]; }
    var s=H.poly([D,Cc,o(Cc),o(D)],C.c+'26',C.c,3)+H.poly([B,o(B),o(Cc),Cc],C.c+'14',C.c,3)+H.poly([A,B,Cc,D],C.c+'33',C.c,4);
    s+=H.line(A[0]+ox,A[1]+oy,o(B)[0],o(B)[1],C.c,2,'6 6')+H.line(A[0]+ox,A[1]+oy,o(D)[0],o(D)[1],C.c,2,'6 6')+H.line(A[0],A[1],A[0]+ox,A[1]+oy,C.c,2,'6 6');
    s+=H.tb((A[0]+B[0])/2,A[1]+30,labels[0],24)+H.tb(A[0]-10,(A[1]+D[1])/2+8,labels[2],24,C.ink,'end')+H.tb((B[0]+o(B)[0])/2+14,(B[1]+o(B)[1])/2+18,labels[1],24,C.ink,'start');
    return H.svg(s,'Rectangular prism'); }
  function triPrism(b,th,L,labels){ var dx=0.6, dy=0.35, sc=Math.min(240/(b+L*dx), 220/(th+L*dy)), x0=(380-(b+L*dx)*sc)/2, y0=380-(380-(th+L*dy)*sc)/2-12;
    var A=[x0,y0], B=[x0+b*sc,y0], T=[x0,y0-th*sc], ox=L*dx*sc, oy=-L*dy*sc; function o(p){ return [p[0]+ox,p[1]+oy]; }
    var s=H.poly([T,B,o(B),o(T)],C.g+'1A',C.g,3)+H.poly([A,B,T],C.g+'33',C.g,4)+H.line(T[0],T[1],o(T)[0],o(T)[1],C.g,3)+H.line(A[0],A[1],o(A)[0],o(A)[1],C.g,2,'6 6')+H.line(o(A)[0],o(A)[1],o(B)[0],o(B)[1],C.g,2,'6 6')+H.line(o(A)[0],o(A)[1],o(T)[0],o(T)[1],C.g,2,'6 6');
    s+='<rect x="'+A[0]+'" y="'+(A[1]-16)+'" width="16" height="16" fill="none" stroke="'+C.g+'" stroke-width="2"/>';
    s+=H.tb((A[0]+B[0])/2,A[1]+30,labels[0],24)+H.tb(A[0]-10,(A[1]+T[1])/2+8,labels[1],24,C.ink,'end')+H.tb((B[0]+o(B)[0])/2+14,(B[1]+o(B)[1])/2+18,labels[2],24,C.ink,'start');
    return H.svg(s,'Triangular prism'); }
  function pyramid(l,w,h,labels){ var dx=0.55, dy=0.4, sc=Math.min(250/(l+w*dx), 220/(h+w*dy*0.5)), x0=(380-(l+w*dx)*sc)/2, y0=330;
    var A=[x0,y0], B=[x0+l*sc,y0], ox=w*dx*sc, oy=-w*dy*sc, Bb=[B[0]+ox,B[1]+oy], Ab=[A[0]+ox,A[1]+oy], M=[(A[0]+Bb[0])/2,(A[1]+Bb[1])/2], P=[M[0],M[1]-h*sc];
    if(P[1]<20){ return null; }
    var s=H.poly([A,B,Bb,Ab],C.o+'1A','none')+H.line(A[0],A[1],B[0],B[1],C.o,4)+H.line(B[0],B[1],Bb[0],Bb[1],C.o,4)+H.line(A[0],A[1],Ab[0],Ab[1],C.o,2,'6 6')+H.line(Ab[0],Ab[1],Bb[0],Bb[1],C.o,2,'6 6');
    s+=H.poly([A,B,P],C.o+'26',C.o,4)+H.poly([B,Bb,P],C.o+'14',C.o,4)+H.line(Ab[0],Ab[1],P[0],P[1],C.o,2,'6 6')+H.line(P[0],P[1],M[0],M[1],C.y,3,'6 6');
    s+=H.tb((A[0]+B[0])/2,A[1]+30,labels[0],24)+H.tb((B[0]+Bb[0])/2+14,(B[1]+Bb[1])/2+18,labels[1],24,C.ink,'start')+H.tb(M[0]+10,(M[1]+P[1])/2+10,labels[2],24,C.y,'start');
    return H.svg(s,'Rectangular pyramid'); }
  function U(u,p){ return u+(p?'³':'²'); }
  return {
  geoPrism:function(){ var unit=H.pick(['cm','in','ft','m']);
    if(H.chance(0.6)){ var l=H.ri(2,12), w=H.ri(2,9), h=H.ri(2,10), V=l*w*h, SA=2*(l*w+l*h+w*h);
      function f(v){ return H.num(v)+' '+U(unit,1); }
      var cands=[[l*w,'That’s the base area B. V = Bh: multiply by the height too.'],[SA,'That’s the surface area. Volume is B × h.'],[l+w+h,'Multiply the dimensions, don’t add them.'],[V+l*w,'Check: '+l+' × '+w+' × '+h+'.']];
      return { prompt:'What is the volume of the rectangular prism?', visual:box(l,w,h,[l+' '+unit,w+' '+unit,h+' '+unit]),
        choices:H.choices(H.C(f(V),V),cands,f), check:function(v){ return v/h===l*w&&v%h===0; }, explain:'V = Bh = '+H.eq(l+' × '+w+' × '+h+' = '+H.ans(f(V)))+'.' }; }
    var b=H.ri(3,10), th=H.ri(3,9), L=H.ri(4,12); if((b*th)%2) return null; var B=b*th/2, V2=B*L;
    function g(v){ return H.num(v)+' '+U(unit,1); }
    var c2=[[b*th*L,'The base is a triangle: B = ½ × '+b+' × '+th+' = '+B+'.'],[B,'That’s the base area. Multiply by the length, '+L+'.'],[b+th+L,'Find B = ½bh, then multiply by '+L+'.'],[B*L+B,'Check: '+B+' × '+L+'.']];
    return { prompt:'What is the volume of the triangular prism?', visual:triPrism(b,th,L,[b+' '+unit,th+' '+unit,L+' '+unit]),
      choices:H.choices(H.C(g(V2),V2),c2,g), check:function(v){ return 2*v===b*th*L; }, explain:'B = ½ × '+b+' × '+th+' = '+B+'. '+H.eq('V = '+B+' × '+L+' = '+H.ans(g(V2)))+'.' }; },
  geoPyr:function(){ var unit=H.pick(['cm','in','ft','m']);
    if(H.chance(0.35)){ var Vp=H.ri(4,40)*6, py=Vp/3;
      var c0=[[Vp*3,'A pyramid holds less than the prism. Divide by 3.'],[Vp/2,'Use ⅓, not ½.'],[Vp,'Same base and height, but a pyramid is ⅓ of the prism.'],[Vp-3,'Divide by 3.']];
      function f0(v){ return H.num(v)+' '+U(unit,1); }
      return { prompt:'A prism and a pyramid have the same base and the same height. The prism’s volume is '+H.num(Vp)+' '+U(unit,1)+'. What is the pyramid’s volume?',
        choices:H.choices(H.C(f0(py),py),c0,f0,function(v){ return Number.isInteger(v)&&v>0; }), check:function(v){ return 3*v===Vp; }, explain:'A pyramid is ⅓ of the prism: '+H.eq(H.num(Vp)+' ÷ 3 = '+H.ans(f0(py)))+'.' }; }
    var l=H.ri(3,12), w=H.ri(3,10), h=H.ri(3,12); if((l*w*h)%3) return null; var V=l*w*h/3, vis=pyramid(l,w,h,[l+' '+unit,w+' '+unit,h+' '+unit]); if(!vis) return null;
    function f(v){ return H.num(v)+' '+U(unit,1); }
    var cands=[[l*w*h,'That’s a prism. A pyramid is ⅓ of it.'],[l*w*h/2,'Use ⅓, not ½.'],[l*w,'That’s the base area B. V = ⅓Bh.'],[V+l*w,'Check: ⅓ × '+l+' × '+w+' × '+h+'.']];
    return { prompt:'What is the volume of the rectangular pyramid?', visual:vis, choices:H.choices(H.C(f(V),V),cands,f,function(v){ return Number.isInteger(v)&&v>0; }),
      check:function(v){ return 3*v===l*w*h; }, explain:'V = ⅓Bh = '+H.eq('⅓ × '+l+' × '+w+' × '+h+' = '+H.ans(f(V)))+'.' }; },
  geoComp:function(){ var unit=H.pick(['cm','in','ft','m']), t=H.ri(0,2), s='', ans, cands, explain, X;
    if(t===0){ /* L shape: W × Ht with a w × h corner cut from the top right */
      var W=H.ri(8,14), Ht=H.ri(7,12), w=H.ri(3,W-3), h=H.ri(3,Ht-3); var sc=Math.min(250/W,270/Ht), x0=70+(250-W*sc)/2, y0=(380+Ht*sc)/2;
      X=function(x){ return x0+x*sc; }; var Y=function(y){ return y0-y*sc; };
      s=H.poly([[X(0),Y(0)],[X(W),Y(0)],[X(W),Y(Ht-h)],[X(W-w),Y(Ht-h)],[X(W-w),Y(Ht)],[X(0),Y(Ht)]],C.v+'2A',C.v,4);
      s+=H.tb(X(W/2),Y(0)+30,W+' '+unit,22)+H.tb(X(0)-10,Y(Ht/2)+8,Ht+' '+unit,22,C.ink,'end')+H.tb(X((W-w)/2),Y(Ht)-12,(W-w)+'',22)+H.tb(X(W)+10,Y((Ht-h)/2)+8,(Ht-h)+'',22,C.ink,'start')+H.tb(X(W-w/2),Y(Ht-h)-12,w+'',22)+H.tb(X(W-w)+10,Y(Ht-h/2)+8,h+'',22,C.ink,'start');
      ans=R(W*Ht-w*h); cands=[[R(W*Ht),'Subtract the missing corner: '+w+' × '+h+'.'],[R(2*(W+Ht)),'That’s the perimeter (distance around). Area counts square units inside.'],[R(W*Ht+w*h),'The corner is missing, so subtract it.'],[R(W*(Ht-h)+(W-w)*Ht),'Those two rectangles overlap. Split the shape so they don’t.']];
      explain=H.eq(W+' × '+Ht+' − '+w+' × '+h+' = '+H.ans(H.num(ans.n)+' '+U(unit))); }
    else if(t===1){ /* house: rectangle W × Ht plus triangle on top (base W, height th) */
      var W2=H.ri(6,12), Ht2=H.ri(4,9), th=H.ri(3,7); if((W2*th)%2) return null; var sc2=Math.min(250/W2,280/(Ht2+th)), x02=70+(250-W2*sc2)/2, y02=(380+(Ht2+th)*sc2)/2;
      var X2=function(x){ return x02+x*sc2; }, Y2=function(y){ return y02-y*sc2; };
      s=H.poly([[X2(0),Y2(0)],[X2(W2),Y2(0)],[X2(W2),Y2(Ht2)],[X2(W2/2),Y2(Ht2+th)],[X2(0),Y2(Ht2)]],C.v+'2A',C.v,4)+H.line(X2(0),Y2(Ht2),X2(W2),Y2(Ht2),C.v,2,'6 6')+H.line(X2(W2/2),Y2(Ht2),X2(W2/2),Y2(Ht2+th),C.y,3,'6 6');
      s+=H.tb(X2(W2/2),Y2(0)+30,W2+' '+unit,22)+H.tb(X2(0)-10,Y2(Ht2/2)+8,Ht2+' '+unit,22,C.ink,'end')+H.tb(X2(W2/2)+10,Y2(Ht2+th/2)+12,th+' '+unit,22,C.y,'start');
      ans=R(W2*Ht2+W2*th/2); cands=[[R(W2*Ht2+W2*th),'Triangle area is ½ × base × height.'],[R(W2*Ht2),'Add the triangle on top.'],[R(W2*(Ht2+th)),'The top is a triangle, not a rectangle: ½ × '+W2+' × '+th+'.'],[R(W2*Ht2+th),'Find the triangle’s area: ½ × '+W2+' × '+th+'.']];
      explain=H.eq(W2+' × '+Ht2+' + ½ × '+W2+' × '+th+' = '+H.ans(H.num(ans.n)+' '+U(unit))); }
    else { /* rectangle W × Ht with a semicircle on the right (diameter Ht) */
      var Ht3=H.pick([2,4,6,8,10]), W3=H.ri(5,12), r=Ht3/2; var sc3=Math.min(260/(W3+r),260/Ht3), x03=70+(260-(W3+r)*sc3)/2, y03=(380+Ht3*sc3)/2;
      var X3=function(x){ return x03+x*sc3; }, Y3=function(y){ return y03-y*sc3; };
      s='<path d="M'+X3(0)+' '+Y3(0)+' L'+X3(W3)+' '+Y3(0)+' A'+(r*sc3)+' '+(r*sc3)+' 0 0 0 '+X3(W3)+' '+Y3(Ht3)+' L'+X3(0)+' '+Y3(Ht3)+' Z" fill="'+C.v+'2A" stroke="'+C.v+'" stroke-width="4"/>'+H.line(X3(W3),Y3(0),X3(W3),Y3(Ht3),C.v,2,'6 6');
      s+=H.tb(X3(W3/2),Y3(0)+30,W3+' '+unit,22)+H.tb(X3(0)-10,Y3(Ht3/2)+8,Ht3+' '+unit,22,C.ink,'end');
      var A100=W3*Ht3*100+157*r*r; ans=R(A100,100);
      cands=[[R(W3*Ht3*100+314*r*r,100),'Half a circle: ½ × 3.14 × '+r+' × '+r+'.'],[R(W3*Ht3*100+157*Ht3*Ht3,100),'Use the radius: '+Ht3+' ÷ 2 = '+r+'.'],[R(W3*Ht3),'Add the half circle.'],[R(W3*Ht3*100+157*Ht3,100),'Half-circle area is ½πr².']];
      explain=H.eq(W3+' × '+Ht3+' + ½ × 3.14 × '+r+'² = '+H.ans(H.decStr(ans)+' '+U(unit)))+'. Use 3.14 for π.'; }
    function f(v){ return H.decStr(v)+' '+U(unit); }
    var chk=ans; return { prompt:'What is the area of the composite figure?'+(t===2?' Use 3.14 for π.':''), visual:H.svg(s,'Composite figure'), choices:H.choices(H.C(f(ans),ans),cands,f),
      check:function(v){ return H.eqR(v,chk); }, explain:explain }; },
  geoSA:function(){ var l=H.ri(2,10), w=H.ri(2,8), h=H.ri(2,9), unit=H.pick(['cm','in','ft','m']), lat=H.chance(0.4), LA=2*h*(l+w), TA=LA+2*l*w, ans=lat?LA:TA;
    function f(v){ return H.num(v)+' '+U(unit); }
    var cands=[[lat?TA:LA,lat?'Lateral area leaves out the top and bottom.':'Total surface area includes the top and bottom: add 2 × '+l+' × '+w+'.'],[l*w*h,'That’s the volume. Surface area adds the areas of the faces.'],[TA/2,'Each face has a matching face on the other side. Count both.'],[lat?h*(l+w):LA+l*w,lat?'There are 4 side faces: 2 of '+l+' × '+h+' and 2 of '+w+' × '+h+'.':'There are two bases (top and bottom).']];
    return { prompt:'What is the '+(lat?'<b>lateral</b>':'<b>total</b>')+' surface area of the prism?', visual:box(l,w,h,[l+' '+unit,w+' '+unit,h+' '+unit]),
      choices:H.choices(H.C(f(ans),ans),cands,f), check:function(v){ var faces=[l*h,l*h,w*h,w*h].concat(lat?[]:[l*w,l*w]); return v===faces.reduce(function(a,b){ return a+b; },0); },
      explain:lat? 'Sides: '+H.eq('2('+l+' × '+h+') + 2('+w+' × '+h+') = '+H.ans(f(ans)))+'.' : H.eq('2('+l+'×'+w+' + '+l+'×'+h+' + '+w+'×'+h+') = '+H.ans(f(ans)))+'.' }; }
  };
}

/* ================= 7.10, 7.11A, 7.11B  Equations and inequalities ================= */
function G_eqin(H){
  var R=H.R, C=H.COL, MI=H.MINUS;
  function cx(a,v){ return a===1? v : a===-1? MI+v : H.num(a)+v; }
  function sg(b){ return b>0? ' + '+b : b<0? ' '+MI+' '+(-b) : ''; }
  var OPS=['<','≤','>','≥'];
  function holds(op,l,r){ return op==='<'? l<r : op==='≤'? l<=r : op==='>'? l>r : l>=r; }
  function flip(op){ return {'<':'>','>':'<','≤':'≥','≥':'≤'}[op]; }
  function swapStrict(op){ return {'<':'≤','≤':'<','>':'≥','≥':'>'}[op]; }
  function esc(op){ return op==='<'?'&lt;':op==='>'?'&gt;':op; }
  function sol(v){ return 'x '+esc(v.op)+' '+H.fmtF(v.k); }
  /* number line from k−5 to k+5 */
  function numberLine(k,op){ var lo=k-5, x=function(t){ return 30+(t-lo)*32; }, y=200, s='', closed=op==='≤'||op==='≥', right=op==='>'||op==='≥';
    s+=H.line(14,y,366,y,C.axis,3)+H.poly([[366,y],[352,y-8],[352,y+8]],C.axis)+H.poly([[14,y],[28,y-8],[28,y+8]],C.axis);
    for(var t=lo;t<=lo+10;t++){ s+=H.line(x(t),y-9,x(t),y+9,C.axis,2)+H.t(x(t),y+38,H.num(t),17,t===k?C.y:C.mute); }
    s+=H.line(x(k),y,right?350:30,y,C.c,8)+H.poly(right?[[364,y],[344,y-13],[344,y+13]]:[[16,y],[36,y-13],[36,y+13]],C.c);
    s+='<circle cx="'+x(k)+'" cy="'+y+'" r="11" fill="'+(closed?C.c:'#12151D')+'" stroke="'+C.c+'" stroke-width="4"/>';
    return H.svg(s,'Number line graph'); }
  return {
  eqSolve:function(){ var f=H.pick(['ax+b','ax+b','x/a+b','a(x+b)']), x=H.nz(-12,12), a=H.nz(-9,9), b=H.nz(-15,15), lhs, c, cands=[], steps;
    if(Math.abs(a)===1) return null;
    if(f==='ax+b'){ c=a*x+b; lhs=cx(a,'x')+sg(b); steps=H.eq((b>0?'Subtract '+b:'Add '+(-b))+': '+cx(a,'x')+' = '+H.num(c-b))+', then divide by '+H.num(a);
      cands=[[R(c+b,a),'Undo '+(b>0?'+ '+b+' by subtracting':MI+' '+(-b)+' by adding')+' '+Math.abs(b)+'.'],[H.sub(R(c,a),R(b)),'Undo the '+(b>0?'adding':'subtracting')+' first, then divide.'],[R(-x),'Check the sign.'],[R((c-b)*a),'Undo × '+H.num(a)+' by dividing.']]; }
    else if(f==='x/a+b'){ a=Math.abs(a); x=a*H.nz(-6,6); c=x/a+b; lhs=H.frac('x',a)+sg(b); steps=H.eq((b>0?'Subtract '+b:'Add '+(-b))+': '+H.frac('x',a)+' = '+H.num(c-b))+', then multiply by '+a;
      cands=[[R(c-b,a),'Undo ÷ '+a+' by multiplying.'],[R(a*(c+b)),'Undo '+(b>0?'+ '+b+' by subtracting':MI+' '+(-b)+' by adding')+' '+Math.abs(b)+'.'],[R(a*c-b),'Undo the '+(b>0?'adding':'subtracting')+' first, then multiply.'],[R(-x),'Check the sign.']]; }
    else { c=a*(x+b); lhs=H.num(a)+'(x'+sg(b)+')'; if(Math.abs(c)>150) return null; steps=H.eq('Divide by '+H.num(a)+': x'+sg(b)+' = '+H.num(c/a))+', then '+(b>0?'subtract '+b:'add '+(-b));
      cands=[[R(c/a+b),'Undo '+(b>0?'+ '+b+' by subtracting':MI+' '+(-b)+' by adding')+' '+Math.abs(b)+'.'],[R(c-b,a),H.num(a)+' multiplies both x and '+H.num(b)+'. Divide by '+H.num(a)+' first.'],[R(-x),'Check the sign.'],[R(c-a*b+1),'Divide '+H.num(c)+' by '+H.num(a)+' first.']]; }
    var ask=H.chance(0.3)? 'Which value of x makes '+H.big(lhs+' = '+H.num(c))+' true?' : 'Solve: '+H.big(lhs+' = '+H.num(c));
    var right=R(x), ch=H.choices(H.C('x = '+H.fmtF(right),right),cands.filter(function(cd){ return cd[0].d===1; }).concat(cands.filter(function(cd){ return cd[0].d!==1; })),function(v){ return 'x = '+H.fmtF(v); });
    function L(v){ return f==='ax+b'? H.add(H.mul(R(a),v),R(b)) : f==='x/a+b'? H.add(H.div(v,R(a)),R(b)) : H.mul(R(a),H.add(v,R(b))); }
    return { prompt:ask, choices:ch, check:function(v){ return H.eqR(L(v),R(c)); },
      explain:steps+': '+H.ans('x = '+x)+'. Check: put '+x+' back in.' }; },
  ineqSolve:function(){ if(H.chance(0.3)){ /* which value is a solution? */
      var a2=H.nz(-5,6), b2=H.nz(-12,12), k2=H.nz(-8,8), op2=H.pick(OPS); if(Math.abs(a2)===1) return null; var c2=a2*k2+b2, test=function(v){ return holds(op2,a2*v+b2,c2); };
      var good=[], bad=[]; for(var t=k2-6;t<=k2+6;t++){ if(t===k2) continue; (test(t)?good:bad).push(t); } if(!good.length||bad.length<2) return null;
      var g=H.pick(good), boundary=k2, ch=[H.C('x = '+H.num(g),g)];
      if(!test(boundary)) ch.push(H.C('x = '+H.num(boundary),boundary,'At x = '+H.num(boundary)+' both sides are equal, but '+esc(op2)+' does not include equal.'));
      H.shuffle(bad).forEach(function(bv){ if(ch.length<4) ch.push(H.C('x = '+H.num(bv),bv,'Check: '+H.num(a2)+'('+H.num(bv)+')'+sg(b2)+' = '+H.num(a2*bv+b2)+', which is not '+esc(op2)+' '+H.num(c2)+'.')); });
      return { prompt:'Which value of x is a solution of '+H.big(cx(a2,'x')+sg(b2)+' '+esc(op2)+' '+H.num(c2))+'?', choices:ch, check:function(v){ return test(v); },
        explain:'Put it in: '+H.eq(H.num(a2)+'('+H.num(g)+')'+sg(b2)+' = '+H.num(a2*g+b2))+', and '+H.num(a2*g+b2)+' '+esc(op2)+' '+H.num(c2)+' is true. '+H.ans('x = '+H.num(g))+'.' }; }
    var a=H.chance(0.3)? -H.ri(2,6) : H.ri(2,8), b=H.nz(-15,15), k=H.nz(-9,9), op=H.pick(OPS), c=a*k+b, solOp=a<0?flip(op):op;
    var right={op:solOp,k:R(k)}, wrongK=R(c+b,a), cands=[];
    cands.push([{op:a<0?op:flip(op),k:R(k)}, a<0?'Dividing by a negative number flips the sign.':'You divided by a positive number, so the sign stays the same.']);
    cands.push([{op:solOp,k:wrongK},'Undo '+(b>0?'+ '+b+' by subtracting':MI+' '+(-b)+' by adding')+' '+Math.abs(b)+'.']);
    cands.push([{op:swapStrict(solOp),k:R(k)},op==='<'||op==='>'?'The sign is '+esc(op)+', so the answer can’t include equal to.':'The sign is '+op+', so the answer includes equal to.']);
    cands.push([{op:solOp,k:R(-k)},'Check the sign of the number.']);
    var ch=H.choices(H.C(sol(right),right),cands,sol);
    function same(v){ if(!v||!v.op) return false; for(var t=-30;t<=30;t+=0.5){ if(holds(op,a*t+b,c)!==holds(v.op,t,H.val(v.k))) return false; } return true; }
    return { prompt:'Solve: '+H.big(cx(a,'x')+sg(b)+' '+esc(op)+' '+H.num(c)), choices:ch, check:same,
      explain:H.eq(cx(a,'x')+' '+esc(op)+' '+H.num(c-b))+(a<0?', divide by '+H.num(a)+' and flip: ':', divide by '+a+': ')+H.ans(sol(right))+'.' }; },
  ineqLine:function(){ var k=H.nz(-6,6), op=H.pick(OPS), ch=[H.C('x '+esc(op)+' '+H.num(k),op)];
    OPS.forEach(function(o){ if(o===op) return; var closedR=op==='≤'||op==='≥', closedO=o==='≤'||o==='≥', rightR=op==='>'||op==='≥', rightO=o==='>'||o==='≥';
      ch.push(H.C('x '+esc(o)+' '+H.num(k),o, rightR!==rightO? 'The arrow points '+(rightR?'right, to bigger numbers':'left, to smaller numbers')+'.' : closedR?'The circle is filled in, so '+H.num(k)+' is included.':'The circle is open, so '+H.num(k)+' is not included.')); });
    return { prompt:'Which inequality does the graph show?', visual:numberLine(k,op), choices:ch, check:function(v){ return v===op; },
      explain:(op==='≤'||op==='≥'?'Closed circle: '+H.num(k)+' is included. ':'Open circle: '+H.num(k)+' is not included. ')+'Arrow '+(op==='>'||op==='≥'?'right':'left')+': '+H.ans('x '+esc(op)+' '+H.num(k))+'.' }; },
  eqWrite:function(){ var T=H.ri(0,4), a, b, c, v, rel, text, form='lin';
    if(T===0){ a=H.ri(5,15); b=H.ri(10,60); var w=H.ri(3,12); c=a*w+b; v='w'; rel='='; text='Sam has $'+b+' and saves $'+a+' each week. Which equation finds w, the number of weeks until he has $'+c+'?'; }
    else if(T===1){ a=H.ri(15,45); b=H.ri(20,75); var m=H.ri(2,10); c=a*m+b; v='m'; rel='='; text='A gym charges a $'+b+' sign-up fee plus $'+a+' per month. Maria has paid $'+c+'. Which equation finds m, the number of months?'; }
    else if(T===2){ a=H.ri(8,25); b=H.ri(5,20); c=H.ri(60,150); v='t'; rel='≤'; text='Concert tickets cost $'+a+' each, plus a $'+b+' parking fee. You can spend <b>at most</b> $'+c+'. Which inequality finds t, the number of tickets?'; }
    else if(T===3){ a=H.ri(5,20); b=H.ri(10,80); c=b+a*H.ri(4,12)+H.ri(1,4); v='g'; rel='≥'; text='Kai has '+b+' points and earns '+a+' points each game. He needs <b>at least</b> '+c+' points. Which inequality finds g, the number of games?'; }
    else { a=H.ri(3,6); b=H.ri(2,6); var x=H.ri(5,15); c=a*(x+b); v='x'; rel='='; form='dist'; text=a+' friends each buy a movie ticket for $x and a $'+b+' snack. They spend $'+c+' in all. Which equation finds x?'; }
    function lab(q){ var L=q.f==='dist'? q.a+'('+v+(q.b<0?' − '+(-q.b):' + '+q.b)+')' : q.a+v+(q.b<0?' − '+(-q.b):' + '+q.b); return L+' '+q.rel+' '+q.c; }
    /* a candidate's meaning: its relation and the boundary value of the variable */
    function bound(q){ return q.f==='dist'? H.sub(R(q.c,q.a),R(q.b)) : R(q.c-q.b,q.a); }
    var truth={f:form,a:a,b:b,c:c,rel:rel}, tb=bound(truth);
    var cands=[[{f:form,a:b,b:a,c:c,rel:rel},form==='dist'?'Each friend pays the ticket plus the snack, so '+a+' multiplies both.':'The amount that repeats each '+(T===3?'game':T===2?'ticket':T===1?'month':'week')+' goes with the variable.'],
      [{f:form,a:a,b:-b,c:c,rel:rel},'The $'+b+' adds to the total, so use +.'],
      form==='dist'? [{f:'lin',a:a,b:b,c:c,rel:rel},'The snack is bought '+a+' times too: '+a+'('+v+' + '+b+').'] : [{f:'dist',a:a,b:b,c:c,rel:rel},'Only the repeating amount is multiplied by '+v+'.']];
    if(rel!=='=') cands.unshift([{f:form,a:a,b:b,c:c,rel:rel==='≤'?'≥':'≤'},rel==='≤'?'“At most” means less than or equal to: ≤.':'“At least” means greater than or equal to: ≥.']);
    return { prompt:text, choices:H.choices(H.C(lab(truth),truth),cands,lab), check:function(q){ return q.rel===rel&&H.eqR(bound(q),tb)&&(q.f===form||!H.eqR(bound(q),tb)); },
      explain:H.ans(lab(truth))+'.' }; }
  };
}

/* ================= 7.11C  Angle relationships ================= */
function G_angle(H){
  var C=H.COL, MI=H.MINUS, RAD=Math.PI/180;
  function ex(a,b){ return (a===1?'':a)+'x'+(b>0?' + '+b:b<0?' − '+(-b):''); }
  /* angle expression a·x + b that equals ang when x = X */
  function expr(ang){ for(var t=0;t<40;t++){ var a=H.pick([1,2,2,3,3,4,5]), X=H.ri(3,30), b=ang-a*X; if(Math.abs(b)<=40&&b!==0) return {a:a,b:b,x:X}; } return null; }
  function ray(cx,cy,deg,len,col){ return H.line(cx,cy,cx+len*Math.cos(deg*RAD),cy-len*Math.sin(deg*RAD),col||C.ink,4); }
  function arc(cx,cy,d1,d2,r,col){ var a1=d1*RAD,a2=d2*RAD; return '<path d="M'+(cx+r*Math.cos(a1)).toFixed(1)+' '+(cy-r*Math.sin(a1)).toFixed(1)+' A'+r+' '+r+' 0 '+(d2-d1>180?1:0)+' 0 '+(cx+r*Math.cos(a2)).toFixed(1)+' '+(cy-r*Math.sin(a2)).toFixed(1)+'" fill="none" stroke="'+col+'" stroke-width="3"/>'; }
  function lab(cx,cy,deg,r,s,col,size){ return H.tb(cx+r*Math.cos(deg*RAD),cy-r*Math.sin(deg*RAD)+8,s,size||22,col); }
  function fix(cands,X,E){ var out=cands.filter(function(c){ return Number.isInteger(c[0])&&c[0]>0&&c[0]!==X; });
    [2,-2,5,-5,1,-1].forEach(function(d){ var v=X+d; if(v>0) out.push([v,'Check: '+E.a+'('+v+')'+(E.b>0?' + '+E.b:' − '+(-E.b))+' = '+(E.a*v+E.b)+'°. That doesn’t work.']); }); return out; }
  function finish(prompt,vis,X,E,cands,total,other){ var ch=H.choices(H.C('x = '+X,X),fix(cands,X,E),function(v){ return 'x = '+v; });
    return { prompt:prompt, visual:vis, choices:ch, check:function(v){ return E.a*v+E.b+other===total; },
      explain:H.eq(ex(E.a,E.b)+' + '+other+' = '+total)+', so '+(E.a===1? H.ans('x = '+X) : H.eq(E.a+'x = '+(total-other-E.b))+' and '+H.ans('x = '+X))+'.' }; }
  return {
  angComp:function(){ var p=H.ri(20,70), q=90-p, E=expr(p); if(!E) return null; var cx=70, cy=320, L=250;
    var s=ray(cx,cy,0,L)+ray(cx,cy,90,L)+ray(cx,cy,p,L,C.c)+'<path d="M'+(cx+22)+' '+cy+' V'+(cy-22)+' H'+cx+'" fill="none" stroke="'+C.mute+'" stroke-width="3"/>';
    s+=arc(cx,cy,0,p,70,C.y)+arc(cx,cy,p,90,95,C.p)+lab(cx,cy,p/2,125,ex(E.a,E.b)+'°',C.y)+lab(cx,cy,(p+90)/2,140,q+'°',C.p);
    var cands=[[(180-q-E.b)/E.a,'The angles make a right angle: they add to 90°, not 180°.'],[p,'That’s the angle’s measure. The question asks for x.'],[(90-q+E.b)/E.a,'Undo '+(E.b>0?'+ '+E.b+' by subtracting':'− '+(-E.b)+' by adding')+'.']];
    return finish('The angles are complementary. What is the value of x?',H.svg(s,'Complementary angles'),E.x,E,cands,90,q); },
  angSupp:function(){ var p=H.ri(30,150), q=180-p, E=expr(p); if(!E) return null; var cx=190, cy=260;
    var s=H.line(20,cy,360,cy,C.ink,4)+ray(cx,cy,p,170,C.c)+arc(cx,cy,0,p,48,C.y)+arc(cx,cy,p,180,64,C.p);
    s+=lab(cx,cy,p/2,p<60?115:90,ex(E.a,E.b)+'°',C.y)+lab(cx,cy,(p+180)/2,q<60?120:100,q+'°',C.p);
    var cands=[[(90-q-E.b)/E.a,'Angles on a straight line add to 180°, not 90°.'],[p,'That’s the angle’s measure. The question asks for x.'],[(180-q+E.b)/E.a,'Undo '+(E.b>0?'+ '+E.b+' by subtracting':'− '+(-E.b)+' by adding')+'.']];
    return finish('The angles form a straight line. What is the value of x?',H.svg(s,'Supplementary angles'),E.x,E,cands,180,q); },
  angVert:function(){ var p=H.ri(35,145), E=expr(p); if(!E) return null; var cx=190, cy=190, L=175, adj=H.chance(0.35);
    var s=H.line(cx-L*Math.cos(p*RAD),cy+L*Math.sin(p*RAD),cx+L*Math.cos(p*RAD),cy-L*Math.sin(p*RAD),C.ink,4)+H.line(cx-L,cy,cx+L,cy,C.ink,4);
    s+=arc(cx,cy,0,p,46,C.y)+lab(cx,cy,p/2,p<70?100:84,ex(E.a,E.b)+'°',C.y);
    var shown=adj?180-p:p;
    if(adj) s+=arc(cx,cy,p,180,58,C.p)+lab(cx,cy,(p+180)/2,(180-p)<70?110:92,shown+'°',C.p);
    else s+=arc(cx,cy,180,180+p,46,C.p)+lab(cx,cy,180+p/2,p<70?100:84,shown+'°',C.p);
    if(adj){ var c1=[[(shown-E.b)/E.a,'These angles are next to each other on a line, so they add to 180°. They aren’t equal.'],[p,'That’s the angle’s measure. The question asks for x.'],[(90-shown-E.b)/E.a,'Angles on a straight line add to 180°.']];
      return finish('Two lines cross. What is the value of x?',H.svg(s,'Two intersecting lines'),E.x,E,c1,180,shown); }
    var c2=[[(180-shown-E.b)/E.a,'Vertical angles are equal. They don’t add to 180°.'],[p,'That’s the angle’s measure. The question asks for x.'],[(shown+E.b)/E.a,'Undo '+(E.b>0?'+ '+E.b+' by subtracting':'− '+(-E.b)+' by adding')+'.']];
    var ch=H.choices(H.C('x = '+E.x,E.x),fix(c2,E.x,E),function(v){ return 'x = '+v; });
    return { prompt:'Two lines cross. What is the value of x?', visual:H.svg(s,'Vertical angles'), choices:ch, check:function(v){ return E.a*v+E.b===shown; },
      explain:'Vertical angles are equal: '+H.eq(ex(E.a,E.b)+' = '+shown)+', so '+H.ans('x = '+E.x)+'.' }; },
  angTri:function(){ var A=H.ri(30,90), B=H.ri(30,110), Cc=180-A-B; if(Cc<25) return null; var E=expr(Cc); if(!E) return null;
    /* triangle with angle A at left, B at right, base horizontal */
    var b=1, a=Math.sin(A*RAD)/Math.sin(Cc*RAD), cpx=a*Math.cos(B*RAD), x1=0, x2=b, x3=b-cpx, y3=a*Math.sin(B*RAD);
    var minX=Math.min(x1,x3), maxX=Math.max(x2,x3), sc=Math.min(300/(maxX-minX),260/y3), ox=(380-(maxX-minX)*sc)/2-minX*sc, oy=320;
    function P(x,y){ return [ox+x*sc,oy-y*sc]; } var p1=P(x1,0), p2=P(x2,0), p3=P(x3,y3);
    var s=H.poly([p1,p2,p3],C.c+'1A',C.c,4);
    function inside(p,q,r,s2,col){ var mx=(q[0]+r[0])/2-p[0], my=(q[1]+r[1])/2-p[1], d=Math.hypot(mx,my), k=Math.min(70,d*0.45); return H.tb(p[0]+mx/d*k,p[1]+my/d*k+8,s2,20,col); }
    s+=inside(p1,p2,p3,A+'°',C.ink)+inside(p2,p1,p3,B+'°',C.ink)+inside(p3,p1,p2,ex(E.a,E.b)+'°',C.y);
    var cands=[[(90-A-B-E.b)/E.a,'The angles of a triangle add to 180°.'],[Cc,'That’s the angle’s measure. The question asks for x.'],[(360-A-B-E.b)/E.a,'A triangle’s angles add to 180°, not 360°.'],[(180-A-B+E.b)/E.a,'Undo '+(E.b>0?'+ '+E.b+' by subtracting':'− '+(-E.b)+' by adding')+'.']];
    return finish('What is the value of x in the triangle?',H.svg(s,'A triangle'),E.x,E,cands,180,A+B); }
  };
}

/* ================= 7.6A, C, D, E, H, I  Probability ================= */
function G_prob(H){
  var R=H.R, C=H.COL;
  var COLS=[['red',C.r],['blue',C.c],['green',C.g],['yellow',C.y],['purple',C.v]];
  function F(v){ return H.fmtF(v,true); }
  function jar(counts){ var s='<rect x="40" y="40" width="300" height="310" rx="34" fill="#1A2030" stroke="'+C.mute+'" stroke-width="4"/>', all=[];
    counts.forEach(function(c,i){ for(var k=0;k<c;k++) all.push(i); }); H.shuffle(all);
    var per=6, rr=20; all.forEach(function(ci,k){ var row=Math.floor(k/per), col=k%per; s+='<circle cx="'+(78+col*45+(row%2)*10)+'" cy="'+(320-row*42)+'" r="'+rr+'" fill="'+COLS[ci][1]+'" stroke="#0E1016" stroke-width="3"/>'; });
    return H.svg(s,'A jar of marbles'); }
  function spinner(sec){ var n=sec.length, s='', cx=190, cy=190, r=160;
    sec.forEach(function(ci,i){ var a1=(i/n)*2*Math.PI-Math.PI/2, a2=((i+1)/n)*2*Math.PI-Math.PI/2;
      s+='<path d="M'+cx+' '+cy+' L'+(cx+r*Math.cos(a1)).toFixed(1)+' '+(cy+r*Math.sin(a1)).toFixed(1)+' A'+r+' '+r+' 0 0 1 '+(cx+r*Math.cos(a2)).toFixed(1)+' '+(cy+r*Math.sin(a2)).toFixed(1)+' Z" fill="'+COLS[ci][1]+'" stroke="#0E1016" stroke-width="4"/>'; });
    s+=H.line(cx,cy,cx+70,cy-90,C.ink,6)+'<circle cx="'+cx+'" cy="'+cy+'" r="12" fill="'+C.ink+'"/>';
    return H.svg(s,'A spinner'); }
  return {
  probSimple:function(){ var T=H.ri(0,2);
    if(T===0){ var k=H.pick([3,3,4]), counts=[]; for(var i=0;i<k;i++) counts.push(H.ri(1,7)); var tot=counts.reduce(function(a,b){ return a+b; },0); if(tot>24||tot<6) return null;
      var c=H.ri(0,k-1), not=H.chance(0.3), fav=not?tot-counts[c]:counts[c], ans=R(fav,tot);
      var cands=[[R(fav,tot-fav),'That compares '+(not?'not ':'')+COLS[c][0]+' to the rest. Use favorable ÷ total.'],[R(tot-fav,tot),'That’s the probability of '+(not?'getting ':'NOT getting ')+COLS[c][0]+'.'],[R(1,k),'The colors aren’t equally likely. Count the marbles.'],[R(fav,tot+1),'Count all '+tot+' marbles.']];
      return { prompt:'You pick one marble without looking. What is P('+(not?'<b>not</b> ':'')+COLS[c][0]+')?', visual:jar(counts),
        choices:H.choices(H.C(F(ans),ans),cands,F), check:function(v){ var n=0; counts.forEach(function(x,i){ if((i===c)!==not) n+=x; }); return H.eqR(v,R(n,tot)); },
        explain:(not?'Not '+COLS[c][0]:COLS[c][0].charAt(0).toUpperCase()+COLS[c][0].slice(1))+': '+fav+' out of '+tot+' = '+H.ans(F(ans))+'.' }; }
    if(T===1){ var ev=H.pick([['an even number',function(n){ return n%2===0; }],['a number greater than '+(H.ri(2,4)),null],['a multiple of 3',function(n){ return n%3===0; }],['a prime number',function(n){ return n===2||n===3||n===5; }],['a number less than '+(H.ri(3,5)),null]]);
      var pred=ev[1]; if(!pred){ var m=+ev[0].match(/\d+/)[0]; pred=/greater/.test(ev[0])? function(n){ return n>m; } : function(n){ return n<m; }; }
      var fav2=[1,2,3,4,5,6].filter(pred).length, a2=R(fav2,6);
      var c2=[[R(fav2,6-fav2),'Use favorable ÷ all 6 outcomes.'],[R(6-fav2,6),'That’s the chance of NOT rolling '+ev[0]+'.'],[R(1,6),'Count every face that works, not just one.'],[R(fav2+1,6),'List the faces that work and count them.']];
      return { prompt:'You roll a number cube (1–6). What is the probability of rolling '+ev[0]+'?', choices:H.choices(H.C(F(a2),a2),c2,F,function(v){ return v.n>=0&&H.val(v)<=1; }),
        check:function(v){ var n=0; for(var f=1;f<=6;f++) if(pred(f)) n++; return H.eqR(v,R(n,6)); }, explain:'The faces that work: '+[1,2,3,4,5,6].filter(pred).join(', ')+'. That’s '+fav2+' out of 6 = '+H.ans(F(a2))+'.' }; }
    var n=H.pick([4,5,6,8]), sec=[]; for(var j=0;j<n;j++) sec.push(H.ri(0,3)); var c3=H.pick(sec), fav3=sec.filter(function(x){ return x===c3; }).length; if(fav3===n) return null; var a3=R(fav3,n);
    var c4=[[R(fav3,n-fav3),'Use '+COLS[c3][0]+' sections ÷ all '+n+' sections.'],[R(n-fav3,n),'That’s the chance of NOT landing on '+COLS[c3][0]+'.'],[R(1,n),'Count every '+COLS[c3][0]+' section.'],[R(1,new Set(sec).size),'The colors don’t have the same number of sections.']];
    return { prompt:'The spinner has '+n+' equal sections. What is P('+COLS[c3][0]+')?', visual:spinner(sec), choices:H.choices(H.C(F(a3),a3),c4,F),
      check:function(v){ var k2=0; sec.forEach(function(x){ if(x===c3) k2++; }); return H.eqR(v,R(k2,sec.length)); }, explain:fav3+' of '+n+' sections are '+COLS[c3][0]+': '+H.ans(F(a3))+'.' }; },
  probComp:function(){ var T=H.ri(0,2);
    if(T===0){ var a=H.ri(2,5), b=H.ri(3,6), it=H.pick([['shirts','pairs of pants','outfits'],['sandwiches','drinks','lunch combos'],['flavors of ice cream','toppings','sundaes'],['colors','sizes','choices']]);
      var cands=[[a+b,'Each '+it[0].replace(/s$/,'')+' goes with every one of the '+b+'. Multiply.'],[a*b*2,'Make a tree diagram: '+a+' branches, each with '+b+'.'],[Math.max(a,b),'Count every pair.'],[a*b-1,'Count every pair.']];
      return { prompt:'You choose one of '+a+' '+it[0]+' and one of '+b+' '+it[1]+'. How many different '+it[2]+' are possible?', choices:H.choices(H.C(''+(a*b),a*b),cands,function(v){ return ''+v; }),
        check:function(v){ var n=0; for(var i=0;i<a;i++) for(var j=0;j<b;j++) n++; return v===n; }, explain:H.eq(a+' × '+b+' = '+H.ans(''+a*b))+' '+it[2]+'.' }; }
    if(T===1){ var ev=H.pick([['heads',R(1,2),'flip a coin'],['tails',R(1,2),'flip a coin']]), ev2=H.pick([['an even number',R(1,2)],['a 6',R(1,6)],['a number less than 3',R(1,3)],['a 1 or a 2',R(1,3)],['a number greater than 4',R(1,3)]]);
      var ans=H.mul(ev[1],ev2[1]);
      var cands=[[H.add(ev[1],ev2[1]),'Both have to happen. For independent events, multiply.'],[R(1,8),'There are 2 × 6 = 12 outcomes. Count the ones that work.'],[ev2[1],'Both have to happen: multiply by the chance of '+ev[0]+' too.'],[R(1,12),'Count the outcomes that work, out of 12.']];
      return { prompt:'You '+ev[2]+' and roll a number cube. What is P('+ev[0]+' and '+ev2[0]+')?', choices:H.choices(H.C(F(ans),ans),cands,F,function(v){ return H.val(v)<=1; }),
        check:function(v){ return H.eqR(v,H.mul(ev[1],ev2[1])); }, explain:H.eq(F(ev[1])+' × '+F(ev2[1])+' = '+H.ans(F(ans)))+'.' }; }
    var r=H.ri(2,6), bl=H.ri(2,6), g=H.ri(1,4), t=r+bl+g, ans2=R(r*bl,t*t);
    var c2=[[R(r*bl,t*(t-1)),'The first marble goes back, so the total stays '+t+'.'],[H.add(R(r,t),R(bl,t)),'Both have to happen. Multiply.'],[R(r+bl,2*t),'Multiply the two probabilities.'],[R(r*bl,t),'Multiply the fractions: '+r+'/'+t+' × '+bl+'/'+t+'.']];
    return { prompt:'A bag has '+r+' red, '+bl+' blue, and '+g+' green marbles. You pick one, put it back, then pick again. What is P(red, then blue)?', visual:jar([r,bl,g]),
      choices:H.choices(H.C(F(ans2),ans2),c2,F,function(v){ return H.val(v)<=1; }), check:function(v){ return H.eqR(v,H.mul(R(r,t),R(bl,t))); },
      explain:H.eq(r+'/'+t+' × '+bl+'/'+t+' = '+H.ans(F(ans2)))+'.' }; },
  probPred:function(){ if(H.chance(0.5)){ var n=H.pick([4,5,6,8,10]), k=H.ri(1,n-1), N=n*H.pick([10,20,25,30,15]), ans=N*k/n;
      var cands=[[N-ans,'That’s the prediction for NOT landing on red.'],[N/n,'Red is '+k+' of the '+n+' sections.'],[ans+k*5,'Use the probability '+k+'/'+n+' × '+N+'.'],[k*n,'Multiply the probability by the number of spins.']];
      return { prompt:'A spinner has '+n+' equal sections. '+k+' are red. If you spin it '+N+' times, about how many times will it land on red?',
        choices:H.choices(H.C(''+ans,ans),cands,function(v){ return ''+v; },function(v){ return Number.isInteger(v)&&v>0; }), check:function(v){ return v*n===N*k; },
        explain:H.eq(k+'/'+n+' × '+N+' = '+H.ans(''+ans))+'.' }; }
    var s=H.pick([20,25,40,50,60]), x=H.ri(2,s-2), Np=s*H.pick([5,6,8,10,12,4]), pr=Np*x/s; if(pr%1!==0) return null;
    var item=H.pick([['customers','bought a smoothie'],['students','chose pizza'],['bulbs','were broken'],['shoppers','used a coupon']]);
    var c2=[[Np-pr,'That’s the prediction for the ones that did NOT. '],[x+(Np-s),'Use a ratio: '+x+' out of '+s+'. Don’t add.'],[Np*x/100,'The sample is '+s+', not 100.'],[pr+x,'Set up '+x+'/'+s+' = ?/'+Np+'.']];
    return { prompt:'In a sample of '+s+' '+item[0]+', '+x+' '+item[1]+'. Predict how many of '+H.num(Np)+' '+item[0]+' '+item[1]+'.',
      choices:H.choices(H.C(H.num(pr),pr),c2,H.num,function(v){ return Number.isInteger(v)&&v>0; }), check:function(v){ return v*s===Np*x; },
      explain:H.eq(x+'/'+s+' × '+H.num(Np)+' = '+H.ans(H.num(pr)))+'.' }; },
  probExp:function(){ var N=H.pick([30,60,90,120]), counts=[], left=N; for(var f=1;f<=5;f++){ var c=Math.max(1,Math.round(N/6+H.ri(-N/15,N/15))); counts.push(c); left-=c; } if(left<1) return null; counts.push(left);
    var k=H.ri(1,6), ck=counts[k-1], T=H.ri(0,2), vis=H.svg(H.table(['Number','Times rolled'],counts.map(function(c,i){ return [''+(i+1),''+c]; }),[0.45,0.55]),'Results of rolling a number cube');
    var lead='A number cube was rolled '+N+' times. ';
    if(T===0){ var ans=R(ck,N), cands=[[R(1,6),'That’s the theoretical probability. Use the results in the table.'],[R(ck,6),'Divide by the number of rolls, '+N+'.'],[R(N-ck,N),'That’s the chance of NOT rolling a '+k+'.'],[R(ck,N-ck),'Use '+ck+' ÷ all '+N+' rolls.']];
      return { prompt:lead+'What is the <b>experimental</b> probability of rolling a '+k+'?', visual:vis, choices:H.choices(H.C(F(ans),ans),cands,F), check:function(v){ return H.eqR(v,R(counts[k-1],N)); },
        explain:'Experimental = what happened: '+ck+' out of '+N+' = '+H.ans(F(ans))+'.' }; }
    if(T===1){ var c1=[[R(ck,N),'That’s the experimental probability from the table. Theoretical uses the 6 equal faces.'],[R(1,N),'There are 6 equally likely faces.'],[R(5,6),'That’s the chance of NOT rolling a '+k+'.'],[R(ck,6),'Theoretical probability doesn’t use the table.']];
      return { prompt:lead+'What is the <b>theoretical</b> probability of rolling a '+k+'?', visual:vis, choices:H.choices(H.C(F(R(1,6)),R(1,6)),c1,F), check:function(v){ return H.eqR(v,R(1,6)); },
        explain:'Theoretical = 1 face out of 6 = '+H.ans(F(R(1,6)))+'.' }; }
    var exp=N/6, d=ck-exp; if(d===0) return null;
    var c3=[[ck,'That’s the actual count. Compare it to the expected count.'],[exp,'That’s the expected count, '+N+' ÷ 6. Find the difference.'],[Math.abs(d)+exp,'Subtract: '+ck+' and '+exp+'.'],[Math.abs(d)+1,'Subtract: '+ck+' and '+exp+'.']];
    return { prompt:lead+'Theory says each number should come up about '+exp+' times. How far from that was the number of '+k+'s?', visual:vis,
      choices:H.choices(H.C(''+Math.abs(d),Math.abs(d)),c3,function(v){ return ''+v; },function(v){ return v>0; }), check:function(v){ return v===Math.abs(counts[k-1]-N/6); },
      explain:'Expected '+exp+', actual '+ck+': a difference of '+H.ans(''+Math.abs(d))+'.' }; }
  };
}

/* ================= 7.7A  Linear relationships y = mx + b ================= */
function G_lin(H){
  var R=H.R, C=H.COL, MI=H.MINUS;
  function L(m,b){ var mt=H.decStr(m)||H.fmtF(m), s='y = '; if(m.n!==0) s+=(H.eqR(m,R(1))?'':H.eqR(m,R(-1))?MI:mt)+'x'; if(b.n!==0||m.n===0) s+=(m.n===0?(H.decStr(b)||H.fmtF(b)):(b.n>0?' + ':' '+MI+' ')+(H.decStr(H.absR(b))||H.fmtF(H.absR(b)))); return s; }
  function fits(v,pts){ return pts.every(function(p){ return H.eqR(H.add(H.mul(v.m,p[0]),v.b),p[1]); }); }
  function cand(m,b,why){ return [{m:m,b:b},why,L(m,b)]; }
  function choicesFor(right,cands){ return H.choices(H.C(L(right.m,right.b),right),cands,function(v){ return L(v.m,v.b); }); }
  return {
  linTable:function(){ var m=H.pick([R(2),R(3),R(4),R(5),R(-2),R(-3),R(1,2),R(3,2),R(6)]), b=R(H.nz(-9,12)), step=H.pick([1,1,2]), x0=H.pick([0,1,1,2]);
    var xs=[0,1,2,3].map(function(i){ return x0+i*step; }), pts=xs.map(function(x){ return [R(x),H.add(H.mul(m,R(x)),b)]; }); if(pts.some(function(p){ return p[1].d!==1; })) return null;
    var y1=pts[0][1], cands=[cand(b,m,'The rate goes with x, and the starting value is the number added.'),cand(m,R(0),'Check x = '+xs[0]+': y must be '+H.num(y1.n)+'. Don’t forget b.'),cand(H.mul(m,R(step)),b,'y changes by '+H.num(m.n*step/m.d)+' when x goes up '+step+'. The rate is per 1.'),cand(m,y1,'b is the value of y when x = 0.'),cand(H.neg(m),b,'Check the sign of the rate.')];
    if(x0===0) cands.splice(3,1);
    return { prompt:'Which equation represents the table?', visual:H.svg(H.table(['x','y'],pts.map(function(p){ return [H.num(p[0].n),H.num(p[1].n)]; })),'Table of x and y'),
      choices:choicesFor({m:m,b:b},cands), check:function(v){ return fits(v,pts); }, explain:'Rate = change in y ÷ change in x = '+(H.decStr(m)||H.fmtF(m))+'. When x = 0, y = '+H.num(b.n)+'. '+H.ans(L(m,b))+'.' }; },
  linWords:function(){ var T=H.pick([
      function(){ var f=H.ri(20,60), r=H.ri(15,45); return {m:R(r),b:R(f),t:'A gym charges a $'+f+' sign-up fee plus $'+r+' per month. Which equation shows the total cost y after x months?'}; },
      function(){ var f=H.pick([35,40,45,50,60,75]), r=H.pick([25,30,35,40,45,50,55]); return {m:R(r),b:R(f),t:'A plumber charges $'+f+' to come out plus $'+r+' per hour. Which equation shows the total cost y for x hours?'}; },
      function(){ var h=H.pick([10,12,15,18]), r=H.pick([R(1,2),R(3,2),R(2),R(3,4)]); return {m:H.neg(r),b:R(h),t:'A candle is '+h+' inches tall. It burns '+(H.decStr(r))+' inch'+(H.eqR(r,R(1,2))||H.eqR(r,R(3,4))?'':'es')+' per hour. Which equation shows its height y after x hours?'}; },
      function(){ var s=H.ri(50,200), r=H.ri(10,40); return {m:R(r),b:R(s),t:'Ava has $'+s+' saved. She adds $'+r+' each week. Which equation shows her savings y after x weeks?'}; },
      function(){ var f=H.pick([2.5,3,3.5,4]), r=H.pick([1.5,2,2.5,1.75]); return {m:H.D(r),b:H.D(f),t:'A taxi charges $'+H.fixed(Math.round(f*100),2)+' plus $'+H.fixed(Math.round(r*100),2)+' per mile. Which equation shows the cost y for x miles?'}; } ])();
    var m=T.m, b=T.b, pts=[[R(0),b],[R(2),H.add(H.mul(m,R(2)),b)],[R(5),H.add(H.mul(m,R(5)),b)]];
    var cands=[cand(b,m,'The amount that repeats goes with x. The one-time amount is b.'),cand(m,H.neg(b),'The starting amount adds: + '+(H.decStr(b))+'.'),cand(H.neg(m),b,m.n<0?'It goes down, so the rate is negative.':'It goes up, so the rate is positive.'),cand(H.add(m,b),R(0),'Check x = 0: the cost/amount should be '+H.decStr(b)+'.'),cand(m,R(0),'Don’t forget the starting amount.')];
    return { prompt:T.t, choices:choicesFor({m:m,b:b},cands), check:function(v){ return fits(v,pts); }, explain:'Rate (per x): '+H.decStr(m)+'. Start (x = 0): '+H.decStr(b)+'. '+H.ans(L(m,b))+'.' }; },
  linGraph:function(){ var m=H.pick([R(1),R(2),R(3),R(1,2),R(3,2),R(-1),R(-2),R(-1,2)]), b=R(m.n<0?H.ri(6,10):H.ri(1,4)); var y10=H.add(H.mul(m,R(10)),b);
    var o=46, S=300, u=S/10, X=function(x){ return o+x*u; }, Y=function(y){ return 380-o-y*u; }, s='';
    for(var i=0;i<=10;i++) s+=H.line(X(i),Y(0),X(i),Y(10),C.grid,2)+H.line(X(0),Y(i),X(10),Y(i),C.grid,2);
    s+=H.line(X(0),Y(0),X(10),Y(0),C.axis,3)+H.line(X(0),Y(0),X(0),Y(10),C.axis,3);
    for(i=2;i<=10;i+=2) s+=H.t(X(i),Y(0)+24,''+i,17,C.mute)+H.t(X(0)-8,Y(i)+6,''+i,17,C.mute,'end');
    var xEnd=10, yEnd=H.val(y10); if(yEnd>10){ xEnd=(10-H.val(b))/H.val(m); yEnd=10; } if(yEnd<0){ xEnd=(0-H.val(b))/H.val(m); yEnd=0; }
    s+=H.line(X(0),Y(H.val(b)),X(xEnd),Y(yEnd),C.c,5);
    var p2=null; for(var xx=1;xx<=10;xx++){ var yy=H.add(H.mul(m,R(xx)),b); if(yy.d===1&&yy.n>=0&&yy.n<=10&&xx>=2){ p2=[xx,yy.n]; break; } } if(!p2) return null;
    s+='<circle cx="'+X(0)+'" cy="'+Y(b.n)+'" r="8" fill="'+C.y+'" stroke="#0E1016" stroke-width="3"/><circle cx="'+X(p2[0])+'" cy="'+Y(p2[1])+'" r="8" fill="'+C.y+'" stroke="#0E1016" stroke-width="3"/>';
    var pts=[[R(0),b],[R(p2[0]),R(p2[1])]];
    var cands=[cand(b,m,'The y-intercept is b. The slope (rate) goes with x.'),cand(H.div(R(1),m),b,'Rate = rise ÷ run, not run ÷ rise.'),cand(H.neg(m),b,m.n<0?'The line goes down, so the rate is negative.':'The line goes up, so the rate is positive.'),cand(m,R(p2[1]),'b is where the line crosses the y-axis (x = 0).'),cand(m,R(0),'The line doesn’t start at (0, 0). Add b.')];
    return { prompt:'Which equation represents the line?', visual:H.svg(s,'Graph of a line'), choices:choicesFor({m:m,b:b},cands), check:function(v){ return fits(v,pts); },
      explain:'It crosses the y-axis at '+b.n+'. From (0, '+b.n+') to ('+p2[0]+', '+p2[1]+'): rate = '+H.num(p2[1]-b.n)+' ÷ '+p2[0]+' = '+(H.decStr(m)||H.fmtF(m))+'. '+H.ans(L(m,b))+'.' }; },
  linValue:function(){ if(H.chance(0.5)){ var m=H.nz(-6,8), b=H.nz(-12,15), x=H.ri(2,9); if(Math.abs(m)===1) return null; var y=m*x+b;
      var cands=[[m*(x+b),'Multiply first, then add: '+m+' × '+x+' = '+(m*x)+'.'],[m*x,'Don’t forget b = '+H.num(b)+'.'],[(m+b)*x,'Only '+H.num(m)+' is multiplied by x.'],[m*x-b,'Check the sign of b.']];
      return { prompt:'For '+H.big(L(R(m),R(b)))+', what is y when x = '+x+'?', choices:H.choices(H.C(H.num(y),y),cands,H.num), check:function(v){ return v-b===m*x; },
        explain:H.eq('y = '+m+'('+x+')'+(b>0?' + '+b:' − '+(-b))+' = '+H.ans(H.num(y)))+'.' }; }
    var f=H.pick([35,40,45,50,60]), r=H.pick([25,30,40,45,50]), h=H.pick([R(2),R(3),R(5,2),R(7,2),R(4),R(3,2)]), tot=H.add(H.mul(R(r),h),R(f)); if(tot.d!==1) return null;
    var c2=[[H.mul(R(r+f),h),'The $'+f+' is charged once, not every hour.'],[H.mul(R(r),h),'Add the $'+f+' fee.'],[H.add(R(r),H.mul(R(f),h)),'The hourly rate is $'+r+'. Multiply it by the hours.'],[H.add(tot,R(r)),'Check: '+r+' × '+H.decStr(h)+'.']];
    function M(v){ return H.money(Math.round(H.val(v)*100)); }
    return { prompt:'A plumber charges $'+f+' plus $'+r+' per hour: y = '+r+'x + '+f+'. How much for a '+H.decStr(h)+'-hour job?', choices:H.choices(H.C(M(tot),tot),c2,M),
      check:function(v){ return H.eqR(H.sub(v,R(f)),H.mul(R(r),h)); }, explain:H.eq(r+' × '+H.decStr(h)+' + '+f+' = '+H.ans(M(tot)))+'.' }; }
  };
}

/* ================= 7.13  Personal financial literacy ================= */
function G_fin(H){
  var R=H.R, M=H.money;
  var ASSETS=['Savings account','Car','House','Checking account','Laptop','Stocks','Cash'], LIABS=['Car loan','Credit card debt','Student loan','Mortgage','Unpaid medical bill','Money owed to a friend'];
  return {
  finTax:function(){ if(H.chance(0.55)){ var pay=H.pick([400,500,600,640,720,800,850,900,960,1000,1200]), r=H.pick([10,12,15,20,22]), tax=pay*r/100; if((tax*100)%1) return null; var take=pay-tax, askTax=H.chance(0.35), ans=(askTax?tax:take)*100;
      var cands=[[(askTax?take:tax)*100,askTax?'That’s her take-home pay. The tax is '+r+'% of her pay.':'That’s the tax. Subtract it from her pay.'],[(pay-r)*100,r+'% of '+M(pay*100)+' is not $'+r+'.'],[(pay+tax)*100,'Income tax is taken out of her pay.'],[pay*r*10,'Percent means out of 100.']];
      return { prompt:'Rosa earns '+M(pay*100)+' a week. '+r+'% is withheld for federal income tax. '+(askTax?'How much is withheld?':'How much does she take home?'),
        choices:H.choices(H.C(M(ans),ans),cands,M,function(v){ return Number.isInteger(v)&&v>0; }), check:function(v){ return askTax? v*100===pay*100*r : v*100===pay*100*(100-r); },
        explain:askTax? H.eq(H.decStr(R(r,100))+' × '+M(pay*100)+' = '+H.ans(M(ans))) : 'She keeps '+(100-r)+'%: '+H.eq(H.decStr(R(100-r,100))+' × '+M(pay*100)+' = '+H.ans(M(ans))) }; }
    var p=H.ri(2,20)*1600, tax=p*625/10000, tot=p+tax, askT=H.chance(0.4), a2=askT?tax:tot;
    var c2=[[askT?tot:tax,askT?'That’s the total. The tax alone is 6.25% of the price.':'That’s only the tax. Add it to the price.'],[p+625,'6.25% of the price is not $6.25.'],[askT?tax*10:p+tax*10,'6.25% = 0.0625.'],[p-tax,'Sales tax adds to the price.']];
    return { prompt:'The Texas state sales tax is 6.25%. A '+M(p)+' item has no other tax. '+(askT?'How much is the sales tax?':'What is the total cost?'),
      choices:H.choices(H.C(M(a2),a2),c2,M,function(v){ return Number.isInteger(v)&&v>0; }), check:function(v){ return askT? v*10000===p*625 : v*10000===p*10625; },
      explain:'Tax: '+H.eq('0.0625 × '+M(p)+' = '+M(tax))+(askT?'.':'. Total: '+H.ans(M(tot))+'.') }; },
  finWorth:function(){ if(H.chance(0.4)){ var liab=H.chance(0.5), right=H.pick(liab?LIABS:ASSETS), others=H.shuffle((liab?ASSETS:LIABS).slice()).slice(0,3);
      var ch=[H.C(right,right)]; others.forEach(function(o){ ch.push(H.C(o,o,liab?'That’s something you own, so it’s an asset.':'That’s money you owe, so it’s a liability.')); });
      return { prompt:'Which of these is '+(liab?'a <b>liability</b> (something you owe)?':'an <b>asset</b> (something you own)?'), choices:ch,
        check:function(v){ return liab? LIABS.indexOf(v)>=0 : ASSETS.indexOf(v)>=0; }, explain:H.ans(right)+' is '+(liab?'money owed: a liability.':'something of value you own: an asset.') }; }
    var A=H.shuffle(ASSETS.slice()).slice(0,H.ri(2,3)), L=H.shuffle(LIABS.slice()).slice(0,2), items=[], ta=0, tl=0;
    A.forEach(function(n){ var v=H.ri(2,40)*250; ta+=v; items.push([n,v,1]); }); L.forEach(function(n){ var v=H.ri(1,30)*250; tl+=v; items.push([n,v,-1]); }); H.shuffle(items);
    var nw=ta-tl, ans=nw*100;
    var cands=[[(ta+tl)*100,'Liabilities are money owed. Subtract them.'],[ta*100,'Subtract what is owed (the liabilities).'],[(tl-ta)*100,'Net worth = assets − liabilities.'],[-tl*100,'Add up the assets first.']];
    return { prompt:'What is this person’s net worth?', visual:H.svg(H.table(['Item','Value'],items.map(function(it){ return [it[0],'$'+H.num(it[1])]; }),[0.62,0.38]),'List of assets and liabilities'),
      choices:H.choices(H.C(M(ans),ans),cands,M), check:function(v){ var s=0; items.forEach(function(it){ s+=(ASSETS.indexOf(it[0])>=0?1:-1)*it[1]; }); return v===s*100; },
      explain:'Assets '+M(ta*100)+' − liabilities '+M(tl*100)+' = '+H.ans(M(ans))+'.' }; },
  finInterest:function(){ var P=H.pick([200,400,500,800,1000,1200,2000,2500]), r=H.pick([2,3,4,5,6,8,10]), t=H.pick([2,3,4,5]);
    if(H.chance(0.5)){ var I=P*r*t/100, askI=H.chance(0.5), a=(askI?I:P+I)*100;
      var cands=[[(askI?P+I:I)*100,askI?'That’s the balance. The interest alone is P × r × t.':'That’s just the interest. Add it to the '+M(P*100)+' deposit.'],[(askI?P*r/100:P+P*r/100)*100,'That’s one year. Multiply by '+t+' years.'],[(askI?P*r*t:P+P*r*t)*100,r+'% = '+H.decStr(R(r,100))+'.'],[(askI?I+P*r/100:P+I+P*r/100)*100,'Simple interest: '+M(P*100)+' × '+H.decStr(R(r,100))+' × '+t+'.']];
      return { prompt:'You deposit '+M(P*100)+' at '+r+'% simple interest for '+t+' years. '+(askI?'How much interest do you earn?':'What is the balance at the end?'),
        choices:H.choices(H.C(M(a),a),cands,M,function(v){ return Number.isInteger(v)&&v>0; }), check:function(v){ return askI? v*100===P*100*r*t : v*100===P*100*(100+r*t); },
        explain:'I = Prt = '+H.eq(M(P*100)+' × '+H.decStr(R(r,100))+' × '+t+' = '+M(I*100))+(askI?'.':'. Balance: '+H.ans(M(a))+'.') }; }
    t=H.pick([2,3]); var cents=P*100, hist=[cents]; for(var y=0;y<t;y++){ var nx=cents*(100+r); if(nx%100) return null; cents=nx/100; hist.push(cents); }
    var simple=P*100+P*r*t;
    var c2=[[simple,'That’s simple interest. Compound interest earns interest on the interest too.'],[cents-P*100,'That’s only the interest. The question asks for the balance.'],[hist[t-1],'That’s after '+(t-1)+' year'+(t-1>1?'s':'')+'. Go '+t+' years.'],[P*100*(100+r*t+r)/100,'Find each year’s balance, then take '+r+'% of that.']];
    return { prompt:'You deposit '+M(P*100)+' at '+r+'% interest <b>compounded yearly</b>. What is the balance after '+t+' years?',
      choices:H.choices(H.C(M(cents),cents),c2,M,function(v){ return Number.isInteger(v)&&v>0; }), check:function(v){ var c=P*100; for(var i=0;i<t;i++) c=c+c*r/100; return v===c; },
      explain:hist.map(function(h,i){ return i? 'Year '+i+': '+M(h) : 'Start: '+M(h); }).join(' → ')+'. '+H.ans(M(cents))+'.' }; },
  finBudget:function(){ if(H.chance(0.55)){ var inc=H.pick([1800,2000,2200,2400,2600,3000]), ex=[['Rent',H.ri(14,22)*50],['Food',H.ri(5,9)*50],['Car',H.ri(3,7)*50],['Phone',H.ri(5,9)*10],['Fun',H.ri(4,12)*10]].slice(0,H.ri(3,5)), tot=0;
      ex.forEach(function(e){ tot+=e[1]; }); var left=inc-tot; if(left<=0) return null;
      var last=ex[ex.length-1];
      var cands=[[tot*100,'That’s what is spent. Subtract it from the income.'],[(left+last[1])*100,'Subtract every expense, including '+last[0].toLowerCase()+'.'],[(inc+tot)*100,'Expenses are subtracted from income.'],[(left-50)*100,'Add the expenses carefully: they total $'+H.num(tot)+'.']];
      return { prompt:'Here is a monthly budget. How much money is left for savings?', visual:H.svg(H.table(['Budget','Amount'],[['Income','$'+H.num(inc)]].concat(ex.map(function(e){ return [e[0],'$'+H.num(e[1])]; })),[0.55,0.45]),'Monthly budget'),
        choices:H.choices(H.C(M(left*100),left*100),cands,M,function(v){ return v>0; }), check:function(v){ var s=inc; ex.forEach(function(e){ s-=e[1]; }); return v===s*100; },
        explain:H.eq('$'+H.num(inc)+' − $'+H.num(tot)+' = '+H.ans(M(left*100)))+'.' }; }
    var I=H.pick([1600,2000,2400,2500,3000,3200]), p=H.pick([10,15,20,25,30,35,40]), part=I*p/100; if(part%1) return null;
    var what=H.pick(['rent','food','savings','car costs']);
    function P(v){ return H.fmtD(v)+'%'; }
    var c2=[[R(100-p),'That’s the percent left for everything else.'],[R(Math.round(I/part)),'That divides the whole by the part. Divide '+part+' by '+H.num(I)+'.'],[R(p,100),'Multiply by 100 to write a percent.'],[R(p+5),'Divide '+part+' by '+H.num(I)+'.']];
    return { prompt:'A family earns $'+H.num(I)+' a month and spends $'+H.num(part)+' on '+what+'. What percent of income is that?',
      choices:H.choices(H.C(p+'%',R(p)),c2,P,function(v){ return H.decStr(v)!==null&&v.n>0; }), check:function(v){ return H.eqR(H.mul(v,R(I)),R(part*100)); },
      explain:H.eq(H.num(part)+' ÷ '+H.num(I)+' = '+H.decStr(R(p,100))+' = '+H.ans(p+'%'))+'.' }; }
  };
}

/* ================= 7.6G, 7.12A–C  Data and samples ================= */
function G_data(H){
  var R=H.R, C=H.COL;
  function sorted(a){ return a.slice().sort(function(x,y){ return x-y; }); }
  function median(a){ var s=sorted(a), n=s.length; return n%2? R(s[(n-1)/2]) : R(s[n/2-1]+s[n/2],2); }
  function mean(a){ return R(a.reduce(function(x,y){ return x+y; },0),a.length); }
  function range(a){ var s=sorted(a); return R(s[s.length-1]-s[0]); }
  function mode(a){ var c={}, best=null, bc=0, tie=false; a.forEach(function(v){ c[v]=(c[v]||0)+1; }); Object.keys(c).forEach(function(k){ if(c[k]>bc){ bc=c[k]; best=+k; tie=false; } else if(c[k]===bc) tie=true; }); return tie?null:R(best); }
  function dotPlot(data,lo,title){ var x=function(v){ return 30+(v-lo)*32; }, y0=300, s='';
    s+=H.line(16,y0,364,y0,C.axis,3); for(var v=lo;v<=lo+10;v++) s+=H.line(x(v),y0-7,x(v),y0+7,C.axis,2)+H.t(x(v),y0+30,''+v,17,C.mute);
    var cnt={}; data.forEach(function(d){ cnt[d]=(cnt[d]||0)+1; s+='<circle cx="'+x(d)+'" cy="'+(y0-6-cnt[d]*22)+'" r="9" fill="'+C.c+'"/>'; });
    s+=H.t(190,40,title,20,C.axis); return H.svg(s,'Dot plot'); }
  function boxRow(f,y,lo,col,lab){ var x=function(v){ return 30+(v-lo)*(320/(H.boxSpan||40)); }, s='';
    s+=H.line(x(f[0]),y,x(f[1]),y,col,3)+H.line(x(f[3]),y,x(f[4]),y,col,3)+'<rect x="'+x(f[1])+'" y="'+(y-26)+'" width="'+(x(f[3])-x(f[1]))+'" height="52" fill="'+col+'2A" stroke="'+col+'" stroke-width="3"/>';
    s+=H.line(x(f[2]),y-26,x(f[2]),y+26,col,4)+H.line(x(f[0]),y-14,x(f[0]),y+14,col,3)+H.line(x(f[4]),y-14,x(f[4]),y+14,col,3);
    if(lab) s+=H.t(x(f[0])-8,y-30,lab,18,col,'start'); return s; }
  function axis(lo,span,y){ var s=H.line(20,y,360,y,C.axis,3), step=span/10, x=function(v){ return 30+(v-lo)*(320/span); }; for(var i=0;i<=10;i++){ var v=lo+i*step; s+=H.line(x(v),y-7,x(v),y+7,C.axis,2); if(i%2===0) s+=H.t(x(v),y+28,''+v,17,C.mute); } return s; }
  function five(lo,span){ var step=span/10, q=[]; for(var t=0;t<40;t++){ q=[0,0,0,0,0].map(function(){ return lo+H.ri(0,10)*step; }).sort(function(a,b){ return a-b; }); if(new Set(q).size===5&&q[4]-q[0]>=span*0.4) return q; } return null; }   /* every value sits on a tick mark */
  var NAMES=[['Mean','mean'],['Median','median'],['Mode','mode'],['Range','range']];
  return {
  dataDot:function(){ var lo=H.pick([0,1,2,5,10]), n=H.ri(9,14), data=[]; for(var i=0;i<n;i++) data.push(lo+H.ri(1,9)); var which=H.ri(0,3);
    if(which===0){ var r=data.reduce(function(a,b){ return a+b; },0)%n; for(var k=0;k<r;k++){ var j=H.ri(0,n-1); if(data[j]>lo+1) data[j]--; else return null; } }
    var st={mean:mean(data),median:median(data),mode:mode(data),range:range(data)}; if(!st.mode&&which===2) return null;
    var key=NAMES[which][1], ans=st[key]; if(H.decStr(ans)===null) return null;
    var ctx=H.pick(['Points scored per game','Hours of sleep','Pets per family','Books read this month','Minutes to get to school']);
    var cands=[]; NAMES.forEach(function(nm,i){ if(i!==which&&st[nm[1]]&&H.decStr(st[nm[1]])!==null) cands.push([st[nm[1]],'That’s the '+nm[1]+'.']); });
    cands.push([R(sorted(data)[n-1]),'That’s the greatest value.'],[H.add(ans,R(1)),'Count the dots carefully: there are '+n+'.']);
    var how={mean:'Add all '+n+' values and divide by '+n+'.',median:'Put the '+n+' values in order and find the middle.',mode:'The value with the most dots.',range:'Greatest − least.'}[key];
    return { prompt:'What is the <b>'+key+'</b> of the data?', visual:dotPlot(data,lo,ctx), choices:H.choices(H.C(H.decStr(ans),ans),cands,H.decStr),
      check:function(v){ var t={mean:mean,median:median,mode:mode,range:range}[key](data); return t&&H.eqR(v,t); }, explain:how+' '+H.ans(H.decStr(ans))+'.' }; },
  dataBox:function(){ var lo=H.pick([0,10,20,40,50]), span=H.pick([20,40]), f=five(lo,span); if(!f) return null; H.boxSpan=span;
    var ctx=H.pick(['Points per game','Minutes of homework','Push-ups in a minute','Texts sent per day','Laps run in gym']);
    var s=axis(lo,span,300)+boxRow(f,190,lo,C.c)+H.t(190,60,ctx,20,C.axis), vis=H.svg(s,'Box plot');
    var T=H.ri(0,3);
    if(T<3){ var nm=['median','interquartile range (IQR)','range'][T], ans=[f[2],f[3]-f[1],f[4]-f[0]][T];
      var cands=[[f[3]-f[1],'That’s the IQR: Q3 − Q1.'],[f[4]-f[0],'That’s the range: max − min.'],[f[2],'That’s the median, the line inside the box.'],[f[3],'That’s Q3, the right side of the box.'],[f[1],'That’s Q1, the left side of the box.'],[(f[0]+f[4])/2,'The median is the line inside the box.']];
      return { prompt:'What is the <b>'+nm+'</b> of the data?', visual:vis, choices:H.choices(H.C(''+ans,ans),cands,function(v){ return Number.isInteger(v)?''+v:null; }),
        check:function(v){ return v===[f[2],f[3]-f[1],f[4]-f[0]][T]; }, explain:(T===0?'The line inside the box: ':T===1?'Q3 − Q1 = '+f[3]+' − '+f[1]+' = ':'Max − min = '+f[4]+' − '+f[0]+' = ')+H.ans(''+ans)+'.' }; }
    var Qs=H.pick([['greater than '+f[3],25,'Q3'],['less than '+f[1],25,'Q1'],['between '+f[1]+' and '+f[3],50,'the box'],['greater than '+f[2],50,'the median'],['less than '+f[3],75,'Q3'],['greater than '+f[1],75,'Q1']]);
    function P(v){ return v+'%'; }
    var ch=[H.C(P(Qs[1]),Qs[1])]; [25,50,75,100].forEach(function(p){ if(p!==Qs[1]) ch.push(H.C(P(p),p,'Each part of a box plot (whisker or half-box) holds about 25% of the data.')); });
    return { prompt:'About what percent of the data is '+Qs[0]+'?', visual:vis, choices:ch, check:function(v){ return v===Qs[1]; },
      explain:'A box plot splits the data into four parts of about 25% each. '+H.ans(P(Qs[1]))+'.' }; },
  dataCompare:function(){ var lo=0, span=H.pick([20,40]); H.boxSpan=span; var a=five(lo,span), b=five(lo,span); if(!a||!b) return null;
    var st={ median:[a[2],b[2]], range:[a[4]-a[0],b[4]-b[0]], IQR:[a[3]-a[1],b[3]-b[1]] }; if(Object.keys(st).some(function(k){ return st[k][0]===st[k][1]; })) return null;
    var g=H.pick([['Class A','Class B'],['Team Red','Team Blue'],['7th grade','8th grade'],['Store 1','Store 2']]);
    var s=axis(lo,span,330)+boxRow(a,130,lo,C.c,g[0])+boxRow(b,240,lo,C.p,g[1]);
    var stmts=[]; Object.keys(st).forEach(function(k){ [0,1].forEach(function(w){ stmts.push({k:k,w:w,txt:g[w]+' has the greater '+k}); }); });
    function tru(x){ return st[x.k][x.w]>st[x.k][1-x.w]; }
    var T=stmts.filter(tru), Fz=stmts.filter(function(x){ return !tru(x); }), pick=H.pick(T);
    var ch=[H.C(pick.txt,pick)]; Fz.forEach(function(x){ ch.push(H.C(x.txt,x,g[1-x.w]+'’s '+x.k+' is '+st[x.k][1-x.w]+', and '+g[x.w]+'’s is '+st[x.k][x.w]+'.')); });
    return { prompt:'Which statement is true?', visual:H.svg(s,'Two box plots'), choices:ch, check:tru,
      explain:(pick.k==='IQR'?'IQR':pick.k.charAt(0).toUpperCase()+pick.k.slice(1))+': '+g[0]+' '+st[pick.k][0]+', '+g[1]+' '+st[pick.k][1]+'. '+H.ans(pick.txt)+'.' }; },
  dataSample:function(){ if(H.chance(0.6)){ var n=H.pick([20,25,40,50,60,80]), k=H.ri(3,n-3), N=H.pick([400,500,600,800,1200,1000,300]), ans=N*k/n; if(ans%1) return null;
      var it=H.pick([['students','prefer pizza for lunch'],['students','walk to school'],['fans','want a new mascot'],['shoppers','use the self-checkout']]);
      var cands=[[N-ans,'That’s the number who don’t. Use '+k+' out of '+n+'.'],[N*k/100,'The sample has '+n+' people, not 100.'],[k*(N/100),'Set up '+k+'/'+n+' = ?/'+H.num(N)+'.'],[ans+k,'Use the ratio '+k+'/'+n+'.']];
      return { prompt:'In a random sample of '+n+' '+it[0]+', '+k+' '+it[1]+'. There are '+H.num(N)+' '+it[0]+' in all. About how many '+it[1]+'?',
        choices:H.choices(H.C(H.num(ans),ans),cands,function(v){ return Number.isInteger(v)?H.num(v):null; },function(v){ return v>0; }), check:function(v){ return v*n===N*k; },
        explain:H.eq(k+'/'+n+' × '+H.num(N)+' = '+H.ans(H.num(ans)))+'.' }; }
    var S=H.pick([
      {q:'The principal wants to know what <b>all students</b> think about lunch. Which sample is random?', ok:'Names drawn from all students', bad:[['Students on the football team','Only one group: it leaves others out.'],['The first 30 in the lunch line','Only students who buy lunch, and only the early ones.'],['Students who volunteer online','Only students who choose to answer.']]},
      {q:'A city wants to know how <b>all residents</b> feel about a new park. Which sample is random?', ok:'Every 10th name on the city list',  bad:[['People at the dog park','They already use parks.'],['Residents who call in to a radio show','Only people who choose to call.'],['Members of the soccer club','Only one group of people.']]},
      {q:'A store wants to know what <b>all its customers</b> like. Which sample is random?', ok:'50 receipt numbers drawn at random', bad:[['Customers who fill out a survey','Only people who choose to answer.'],['Shoppers on Saturday morning','Only one time, so it leaves others out.'],['The store’s employees','They aren’t a fair picture of customers.']]} ]);
    var ch=[H.C(S.ok,'ok')]; S.bad.forEach(function(b,i){ ch.push(H.C(b[0],'b'+i,'That sample is biased. '+b[1])); });
    return { prompt:S.q, choices:ch, check:function(v){ return v==='ok'; }, explain:'Everyone has the same chance of being picked: '+H.ans(S.ok)+'.' }; }
  };
}

/* ---------------- the sets ----------------
   id: { name, teks, make, topics:[[topic id, topic name, [generator names], weight]] }
   Never reorder topics or sets once students have score codes: scorecode.js packs them by position. At most 15 sets, 4 topics each. */
function maker(G,id){ return function(PFX){ var H=helpers(PFX); return { build:builder(G(H),id) }; }; }
var SETS={
  rat:{ name:'Rational number operations', teks:'7.3A', make:maker(G_rat,'rat'), topics:[['add','Adding',['ratAdd']],['sub','Subtracting',['ratSub']],['mul','Multiplying',['ratMul']],['div','Dividing',['ratDiv']]] },
  wp:{ name:'Rational number problems', teks:'7.3B', make:maker(G_wp,'wp'), topics:[['int','Integers in context',['wpTemp','wpDiff','wpElev']],['money','Money & decimals',['wpBuy','wpBank','wpSplit']],['frac','Fractions in context',['wpRecipe','wpRope','wpTrail']]] },
  nums:{ name:'Sets of numbers', teks:'7.2', make:maker(G_nums,'nums'), topics:[['classify','Classify the number',['numClassify']],['find','Find the number',['numFind']],['venn','Venn diagram',['numVenn']]] },
  rate:{ name:'Rates & proportionality', teks:'7.4A–C', make:maker(G_rate,'rate'), topics:[['unit','Unit rates',['rateUnit','rateComplex']],['best','Best buy',['rateBest']],['k','Constant of proportionality',['rateKTable','rateKGraph']],['eq','Equations y = kx',['rateEq']]] },
  pct:{ name:'Percents', teks:'7.4D', make:maker(G_pct,'pct'), topics:[['of','Percent of a number',['pctOf','pctWhole']],['change','Percent change',['pctChange','pctApply']],['disc','Discounts & markups',['pctDisc','pctMarkup','pctDeal']],['tax','Tax & tip',['pctTax','pctTip']]] },
  conv:{ name:'Converting units', teks:'7.4E', make:maker(G_conv,'conv'), topics:[['len','Customary length',['convLen']],['wc','Weight & capacity',['convWC']],['met','Metric',['convMet']]] },
  scale:{ name:'Scale drawings & similar figures', teks:'7.5A, 7.5C', make:maker(G_scale,'scale'), topics:[['map','Scale drawings',['scaleActual','scaleDraw']],['sim','Similar figures',['scaleSimilar']],['factor','Scale factor',['scaleFactor']]] },
  circ:{ name:'Circles', teks:'7.5B, 7.9B', make:maker(G_circ,'circ'), topics:[['circ','Circumference',['circC']],['area','Area',['circA']],['back','Working backward',['circBack']]] },
  geo:{ name:'Area & volume', teks:'7.8A, 7.9A, 7.9C, 7.9D', make:maker(G_geo,'geo'), topics:[['prism','Volume of prisms',['geoPrism']],['pyr','Volume of pyramids',['geoPyr']],['comp','Composite figures',['geoComp']],['sa','Surface area',['geoSA']]] },
  eqin:{ name:'Equations & inequalities', teks:'7.10A–B, 7.11A–B', make:maker(G_eqin,'eqin'), topics:[['eq','Solve equations',['eqSolve']],['ineq','Solve inequalities',['ineqSolve']],['line','Number lines',['ineqLine']],['write','Write from words',['eqWrite']]] },
  angle:{ name:'Angle relationships', teks:'7.11C', make:maker(G_angle,'angle'), topics:[['comp','Complementary',['angComp']],['supp','Supplementary',['angSupp']],['vert','Vertical angles',['angVert']],['tri','Triangles',['angTri']]] },
  prob:{ name:'Probability', teks:'7.6A, C–E, H–I', make:maker(G_prob,'prob'), topics:[['simple','Simple events',['probSimple']],['comp','Compound events',['probComp']],['pred','Predictions',['probPred']],['exp','Experimental vs theoretical',['probExp']]] },
  lin:{ name:'Linear relationships', teks:'7.7A', make:maker(G_lin,'lin'), topics:[['table','From a table',['linTable']],['words','From words',['linWords']],['graph','From a graph',['linGraph']],['value','Find a value',['linValue']]] },
  fin:{ name:'Personal finance', teks:'7.13A–E', make:maker(G_fin,'fin'), topics:[['tax','Income & sales tax',['finTax']],['worth','Assets & net worth',['finWorth']],['int','Simple & compound interest',['finInterest']],['budget','Budgets',['finBudget']]] },
  data:{ name:'Data & samples', teks:'7.6G, 7.12A–C', make:maker(G_data,'data'), topics:[['dot','Dot plots',['dataDot']],['box','Box plots',['dataBox']],['comp','Compare two groups',['dataCompare']],['sample','Samples & predictions',['dataSample']]] }
};

function plain(h){ return String(h).replace(/<span class="[a-z]+-fr"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g,'$1/$2').replace(/<[^>]+>/g,''); }
function params(){ var qs={}; try{ (location.search||'').replace(/^\?/,'').split('&').forEach(function(kv){ var p=kv.split('='); if(p[0]) qs[decodeURIComponent(p[0])]=decodeURIComponent(p[1]||''); }); }catch(e){} return qs; }

/* Returns null when the link names no set, so a game opened on its own plays its own questions. */
function forGame(PFX){
  var qs=params(), id=qs.set; if(!SETS[id]) return null;
  var set=SETS[id], want=(qs.topics||'').split(','), picked=set.topics.filter(function(t){ return want.indexOf(t[0])>=0; });
  if(!picked.length) picked=set.topics;
  /* sentence-length prompts: the facts games set their prompt at 104px on one line, so give it room to wrap */
  try{ var st=document.createElement('style'); st.textContent='.'+PFX+'-prompt{ font:700 34px/1.3 var(--body) !important; height:auto !important; min-height:96px; white-space:normal !important; overflow:visible !important; text-align:left !important; }'; document.head.appendChild(st); }catch(e){}
  var Q=set.make(PFX), bag=[]; picked.forEach(function(t){ for(var i=0;i<(t[3]||1);i++) bag.push(t); });
  var topicBag=[], lastType='';
  function next(){ if(!topicBag.length) topicBag=bag.slice().sort(function(){ return Math.random()-0.5; });
    var t=topicBag.pop(), list=t[2], type; do{ type=list[Math.floor(Math.random()*list.length)]; }while(type===lastType&&list.length>1&&Math.random()<0.8); lastType=type;
    var q=Q.build(type); q.topic=t[1]; return q; }
  /* bonus waves print the answers on small targets: no pictures, short labels */
  function fits(q,max){ return !q.visual&&q.choices.every(function(c){ return plain(c.html).length<=max; }); }
  function short(max){ var q; for(var n=0;n<60;n++){ q=next(); if(fits(q,max)) return q; }
    var all=[]; set.topics.forEach(function(t){ all=all.concat(t[2]); });
    for(n=0;n<80;n++){ var b=Q.build(all[Math.floor(Math.random()*all.length)]); if(fits(b,max)){ b.topic=picked[0][1]; return b; } }
    return q; }
  return { set:id, name:set.name, custom:true, suffix:'_'+id+'_'+picked.map(function(t){ return t[0]; }).join('-'),
    topicTable:function(){ var o={}; picked.forEach(function(t){ o[t[1]]=[0,0]; }); return o; },
    next:next, short:short };
}

window.SpitzQ={ sets:SETS, forGame:forGame };
})();
