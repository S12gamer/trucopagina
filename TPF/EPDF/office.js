"use strict";
/* ===== HTML → páginas: layout real en iframe + estilos calculados inline + foreignObject; si falla, texto plano ===== */
function textPages(txt){const pages=[],cap=49,cpl=88;let cur=[],n=0;const flush=()=>{if(cur.length){const pg=newPg('cv');pg.items.push({id:nid(),t:'text',x:54,y:54,w:504,h:684,txt:cur.join('\n'),fs:11,b:false,i:false,col:'#111111',al:'left'});pages.push(pg);cur=[];n=0}};
 for(const l of txt.split('\n'))for(const s of(l.match(/.{1,3000}/g)||[''])){const k=Math.max(1,Math.ceil(s.length/cpl));if(n+k>cap)flush();cur.push(s);n+=k}flush();return pages}
/* se ejecuta DENTRO del iframe aislado: expande áreas con scroll, inlinea estilos calculados y envía el resultado */
function rep(){let S=0;const ce=console.error;console.error=function(){if(/SecurityError|sandbox/i.test([].join.call(arguments,' ')))S=1;return ce.apply(console,arguments)};addEventListener('error',e=>{if(/SecurityError|sandbox/i.test(e.message||''))S=1},true);
 const W=794,d=document,w=window,fail=e=>parent.postMessage({h2p:1,err:String(e),ss:S},'*'),go=()=>{try{
 d.querySelectorAll('*').forEach(e=>{const cs=w.getComputedStyle(e);if(e!==d.body&&e!==d.documentElement&&/(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+4){['height','max-height'].forEach(p=>e.style.setProperty(p,'auto','important'));e.style.setProperty('overflow','visible','important')}});
 [d.documentElement,d.body].forEach(e=>{e.style.setProperty('height','auto','important');e.style.setProperty('overflow','visible','important')});
 setTimeout(()=>{try{const els=[d.body,...d.body.querySelectorAll('*')],Hh=Math.min(Math.max(Math.ceil(Math.max(...els.map(e=>e.getBoundingClientRect().bottom))+w.scrollY),200),30000),cl=d.body.cloneNode(true),B=[cl,...cl.querySelectorAll('*')];
  els.forEach((e,i)=>{const cs=w.getComputedStyle(e);B[i].setAttribute('style',[...cs].map(p=>p+':'+cs.getPropertyValue(p)).join(';'))});
  cl.querySelectorAll('script,style,link,iframe,noscript').forEach(e=>e.remove());cl.querySelectorAll('img').forEach(e=>{if(!/^data:/.test(e.getAttribute('src')||''))e.removeAttribute('src')});
  const bs=w.getComputedStyle(d.body),bgc=[d.body,d.documentElement].map(e=>w.getComputedStyle(e).backgroundColor).find(c=>c&&c!='rgba(0, 0, 0, 0)')||'#fff',mw=W-(parseFloat(bs.marginLeft)||0)-(parseFloat(bs.marginRight)||0),root=d.createElement('div');
  root.setAttribute('style',cl.getAttribute('style')+`;width:${mw}px;height:auto;box-sizing:border-box;position:static;display:block`);while(cl.firstChild)root.appendChild(cl.firstChild);
  const wr=d.createElement('div');wr.setAttribute('style',`width:${W}px;height:${Hh}px;overflow:hidden;background:${bgc}`);wr.appendChild(root);
  parent.postMessage({h2p:1,xml:new XMLSerializer().serializeToString(wr),Hh,txt:d.body.innerText,ss:S},'*')}catch(e){fail(e)}},200)}catch(e){fail(e)}};
 addEventListener('load',()=>setTimeout(go,2500))}
async function svgPages(xml,W,Hh){const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}"><foreignObject x="0" y="0" width="${W}" height="${Hh}">${xml}</foreignObject></svg>`);await im.decode();
 const S=2,ph=Math.floor(792*W/612),pages=[];let blank=true;
 for(let y=0;y<Hh;y+=ph){const hh=Math.min(ph,Hh-y),cv=document.createElement('canvas');cv.width=W*S;cv.height=ph*S;const c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);c.drawImage(im,0,y,W,hh,0,0,W*S,hh*S);
  const px=c.getImageData(0,0,cv.width,hh*S).data;for(let j=0;j<px.length&&blank;j+=388)if(px[j]<245||px[j+1]<245||px[j+2]<245)blank=false;pages.push({w:612,h:792,bg:await addAsset(await canvasAJpeg(cv)),items:[]});cv.width=0}
 if(blank)throw new Error('lienzo en blanco');return pages}
async function htmlPages(src,scripts=true){const W=794,mkf=()=>{const f=document.createElement('iframe');f.style.cssText=`position:fixed;left:-9999px;top:0;width:${W}px;height:1123px;border:0`;return f},clean=src.replace(/<(link|object|embed)\b[^>]*>/gi,'');
 if(scripts){const tag=`<script>(${rep})()<\/script>`,doc=/<head[^>]*>/i.test(clean)?clean.replace(/<head[^>]*>/i,m=>m+tag):tag+clean,
  runF=async tr=>{const fr=mkf();fr.setAttribute('sandbox',tr?'allow-scripts allow-same-origin':'allow-scripts');fr.srcdoc=doc;document.body.appendChild(fr);
   try{return await new Promise(res=>{const h=e=>{if(e.source===fr.contentWindow&&e.data&&e.data.h2p){removeEventListener('message',h);res(e.data)}};addEventListener('message',h);setTimeout(()=>{removeEventListener('message',h);res(null)},20000)})}finally{fr.remove()}};
  let got=await runF(false);if(got&&got.ss&&confirm('Esta página necesita acceder al almacenamiento local para mostrarse.\n¿Ejecutarla con acceso al almacenamiento de este sitio? Hazlo solo si confías en el archivo.'))got=(await runF(true))||got;
  if(got&&got.xml){try{return await svgPages(got.xml,W,got.Hh)}catch(e){console.warn('HTML con scripts:',e)}}else console.warn('HTML con scripts sin respuesta',got&&got.err)}
 const fr=mkf();fr.setAttribute('sandbox','allow-same-origin');fr.srcdoc=clean.replace(/<script[\s\S]*?<\/script>/gi,'');document.body.appendChild(fr);
 try{await new Promise(r=>{fr.onload=r;setTimeout(r,4000)});const d=fr.contentDocument,w=fr.contentWindow;try{await d.fonts.ready}catch(e){}await sleep(150);
  const els=[d.body,...d.body.querySelectorAll('*')],Hh=Math.min(Math.max(Math.ceil(Math.max(...els.map(e=>e.getBoundingClientRect().bottom)))+(parseFloat(w.getComputedStyle(d.body).marginBottom)||0),200),30000);fr.style.height=Hh+'px';await sleep(60);
  const cl=d.body.cloneNode(true),B=[cl,...cl.querySelectorAll('*')];els.forEach((e,i)=>{const cs=w.getComputedStyle(e);B[i].setAttribute('style',[...cs].map(p=>p+':'+cs.getPropertyValue(p)).join(';'))});
  cl.querySelectorAll('script,style,link,iframe').forEach(e=>e.remove());cl.querySelectorAll('img').forEach(e=>{if(!/^data:/.test(e.getAttribute('src')||''))e.removeAttribute('src')});
  const bs=w.getComputedStyle(d.body),bgc=[d.body,d.documentElement].map(e=>w.getComputedStyle(e).backgroundColor).find(c=>c&&c!='rgba(0, 0, 0, 0)')||'#fff',mw=W-(parseFloat(bs.marginLeft)||0)-(parseFloat(bs.marginRight)||0),root=document.createElement('div');
  root.setAttribute('style',cl.getAttribute('style')+`;width:${mw}px;height:auto;box-sizing:border-box;position:static;display:block`);while(cl.firstChild)root.appendChild(cl.firstChild);
  const wr=document.createElement('div');wr.setAttribute('style',`width:${W}px;height:${Hh}px;overflow:hidden;background:${bgc}`);wr.appendChild(root);return await svgPages(new XMLSerializer().serializeToString(wr),W,Hh)}
 catch(e){console.warn('HTML: vista simplificada',e);let t='';try{t=fr.contentDocument.body.innerText}catch(_){t=src.replace(/<[^>]*>/g,' ')}if(!t.trim())throw new Error('El HTML no tiene contenido visible');msg('Se usó vista simplificada (solo texto): el navegador no pudo dibujar el diseño','err');return textPages(t)}
 finally{fr.remove()}}
/* ===== Excel/ODS/CSV → páginas: anchos reales, celdas combinadas, ajuste al ancho de hoja ===== */
async function hojas(f){const wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true,cellStyles:true}),out=[];
 for(const nm of wb.SheetNames){const ws=wb.Sheets[nm];if(!ws['!ref'])continue;const rg=XLSX.utils.decode_range(ws['!ref']),rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false,defval:'',blankrows:true});
  while(rows.length&&rows[rows.length-1].every(c=>c===''))rows.pop();if(!rows.length)continue;
  const nc=Math.max(1,...rows.map(r=>{let k=r.length;while(k&&r[k-1]==='')k--;return k})),cols=ws['!cols']||[],rws=ws['!rows']||[],vc=[],vr=[];
  for(let j=0;j<nc;j++)if(!(cols[rg.s.c+j]||{}).hidden)vc.push(j);for(let i=0;i<rows.length;i++)if(!(rws[rg.s.r+i]||{}).hidden)vr.push(i);
  const cw=vc.map(j=>{const c=cols[rg.s.c+j]||{};return(c.wpx||(c.wch?c.wch*7+5:64))*.75}),rh=vr.map(i=>{const r=rws[rg.s.r+i]||{};return r.hpt||(r.hpx?r.hpx*.75:15)}),tw=cw.reduce((a,b)=>a+b,0);
  const mg=(ws['!merges']||[]).map(m=>({r:vr.indexOf(m.s.r-rg.s.r),c:vc.indexOf(m.s.c-rg.s.c),rs:vr.filter(i=>i>=m.s.r-rg.s.r&&i<=m.e.r-rg.s.r).length,cs:vc.filter(j=>j>=m.s.c-rg.s.c&&j<=m.e.c-rg.s.c).length})).filter(m=>m.r>=0&&m.c>=0&&(m.rs>1||m.cs>1));
  const M=36,land=tw>540,[PW,PH]=land?[792,612]:[612,792],UW=PW-2*M,UH=PH-2*M,cells=vr.map(i=>vc.map(j=>String(rows[i][j]??''))),groups=[];
  if(tw<=UW*1.12)groups.push([0,vc.length]);else{let s0=0,acc=0;for(let j=0;j<vc.length;j++){if(acc+cw[j]>UW&&j>s0){groups.push([s0,j]);s0=j;acc=0}acc+=cw[j]}groups.push([s0,vc.length])}
  for(const[c0,c1]of groups){const gw=cw.slice(c0,c1).reduce((x,y)=>x+y,0),k=Math.min(1,UW/gw);let a=0;
   while(a<vr.length){let b=a,hh=0;while(b<vr.length&&(hh+rh[b]*k<=UH||b==a)){hh+=rh[b]*k;b++}
    out.push({w:PW,h:PH,bg:null,items:[{id:nid(),t:'table',x:M,y:M,w:gw*k,h:hh,cells:cells.slice(a,b).map(r=>r.slice(c0,c1)),cw:cw.slice(c0,c1).map(v=>v*k),rh:rh.slice(a,b).map(v=>v*k),mg:mg.filter(m=>m.r>=a&&m.r<b&&m.c>=c0&&m.c<c1).map(m=>({r:m.r-a,c:m.c-c0,rs:Math.min(m.r+m.rs,b)-m.r,cs:Math.min(m.c+m.cs,c1)-m.c})).filter(m=>m.rs>1||m.cs>1),fs:Math.max(4,10*k),col:'#111111',st:'#d0d0d0',hd:false,rn:true}]});a=b}}}
 if(!out.length)throw new Error('el libro está vacío');return out}
/* ===== PowerPoint → páginas (herencia plantilla/maestro/tema, grupos con giro y volteo, transparencias, degradados, formas, texto con formatos mixtos) ===== */
const FONTK=n=>/times|georgia|cambria|garamond|palatino|serif|book|minion/i.test(n||'')?'serif':/courier|consolas|mono|menlo/i.test(n||'')?'mono':'';
function runsH(runs,w,lhf){const c=runsH.c||(runsH.c=document.createElement('canvas').getContext('2d'));let cw=0,mx=0,tot=0,has=0;const brk=()=>{tot+=(mx||runs[0].fs)*lhf;cw=0;mx=0;has=0};
 for(const r of runs){c.font=`${r.i?'italic ':''}${r.b?'bold ':''}${r.fs}px ${fam(r.ff)}`;for(const tk of r.t.split(/(\n|[ \t]+)/)){if(!tk)continue;if(tk=='\n'){mx=mx||r.fs;brk();continue}const ws=/^\s+$/.test(tk),m=c.measureText(tk).width;if(!ws&&cw+m>w&&has)brk();if(ws&&!has)continue;cw+=m;has=1;mx=Math.max(mx,r.fs)}}brk();return tot}
const poly=p=>[...p.map((q,i)=>[i?'L':'M',q[0],q[1]]),['Z']];
function preset(n,g,w,h){const av={};g&&XT(g,'a:gd').forEach(d=>av[d.getAttribute('name')]=+d.getAttribute('fmla').replace('val ','')/1e5);const a1=(d)=>av.adj1??av.adj??d,a2=d=>av.adj2??d,r=h/w;
 switch(n){case'triangle':return poly([[a1(.5),0],[1,1],[0,1]]);case'rtTriangle':return poly([[0,0],[1,1],[0,1]]);case'diamond':return poly([[.5,0],[1,.5],[.5,1],[0,.5]]);
 case'parallelogram':{const s=Math.min(.5,a1(.25)*r);return poly([[s,0],[1,0],[1-s,1],[0,1]])}case'trapezoid':{const s=Math.min(.5,a1(.25)*r);return poly([[s,0],[1-s,0],[1,1],[0,1]])}
 case'hexagon':return poly([[.25,0],[.75,0],[1,.5],[.75,1],[.25,1],[0,.5]]);case'octagon':return poly([[.29,0],[.71,0],[1,.29],[1,.71],[.71,1],[.29,1],[0,.71],[0,.29]]);
 case'pentagon':return poly([[.5,0],[1,.38],[.81,1],[.19,1],[0,.38]]);case'homePlate':{const s=1-Math.min(1,a1(.5)*r);return poly([[0,0],[s,0],[1,.5],[s,1],[0,1]])}
 case'chevron':{const s=Math.min(.9,a1(.5)*r);return poly([[0,0],[1-s,0],[1,.5],[1-s,1],[0,1],[s,.5]])}
 case'rightArrow':case'leftArrow':{const k=a1(.5),x0=1-Math.min(1,a2(.5)*r),p=[[0,.5-k/2],[x0,.5-k/2],[x0,0],[1,.5],[x0,1],[x0,.5+k/2],[0,.5+k/2]];return poly(n=='leftArrow'?p.map(q=>[1-q[0],q[1]]):p)}
 case'upArrow':case'downArrow':{const k=a1(.5),y0=Math.min(1,a2(.5)/r),p=[[.5-k/2,1],[.5-k/2,y0],[0,y0],[.5,0],[1,y0],[.5+k/2,y0],[.5+k/2,1]];return poly(n=='downArrow'?p.map(q=>[q[0],1-q[1]]):p)}
 case'star5':{const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,R=i%2?.19:.5;p.push([.5+R*Math.cos(a)*(R==.5?1:2.6)/(R==.5?1:2.6)*1,.5+R*Math.sin(a)])}return poly(p.map((q,i)=>{const a=-Math.PI/2+i*Math.PI/5,R=i%2?.2:.5;return[.5+R*Math.cos(a)*1.05,.5+R*Math.sin(a)*1.05+.03]}))}
 case'plus':case'mathPlus':{const k=a1(.25);return poly([[k,0],[1-k,0],[1-k,k],[1,k],[1,1-k],[1-k,1-k],[1-k,1],[k,1],[k,1-k],[0,1-k],[0,k],[k,k]])}
 case'roundRect':{const q=Math.min(.5,a1(.16667)),rx=q*Math.min(w,h)/w,ry=q*Math.min(w,h)/h,k=.5523;return[['M',rx,0],['L',1-rx,0],['C',1-rx+rx*k,0,1,ry-ry*k,1,ry],['L',1,1-ry],['C',1,1-ry+ry*k,1-rx+rx*k,1,1-rx,1],['L',rx,1],['C',rx-rx*k,1,0,1-ry+ry*k,0,1-ry],['L',0,ry],['C',0,ry-ry*k,rx-rx*k,0,rx,0],['Z']]}}
 return null}
function cust(g){const out=[];for(const ph of XT(g,'a:path')){const pw=+ph.getAttribute('w')||0,pH=+ph.getAttribute('h')||0;if(!pw||!pH)continue;const pt=e=>[+e.getAttribute('x')/pw,+e.getAttribute('y')/pH];
 for(const c of ph.children){const n=c.localName,P=XT(c,'a:pt').map(pt).flat();if(n=='moveTo')out.push(['M',...P]);else if(n=='lnTo')out.push(['L',...P]);else if(n=='cubicBezTo')out.push(['C',...P]);else if(n=='quadBezTo')out.push(['Q',...P]);else if(n=='close')out.push(['Z'])}}return out.length?out:null}
async function pptx(f){const z=await JSZip.loadAsync(f),rd=async p=>z.file(p)?z.file(p).async('string'):'',E=12700,dir=p=>p.replace(/[^/]*$/,''),
 res=(b,t)=>{const o=[];(t[0]=='/'?t.slice(1):dir(b)+t).split('/').forEach(s=>s=='..'?o.pop():s!='.'&&o.push(s));return o.join('/')},
 rels=async p=>{const m={};XT(XD(await rd(dir(p)+'_rels/'+p.split('/').pop()+'.rels')),'Relationship').forEach(r=>m[r.getAttribute('Id')]={t:res(p,r.getAttribute('Target')),y:r.getAttribute('Type').split('/').pop()});return m},
 pr=XD(await rd('ppt/presentation.xml')),sz=XT(pr,'p:sldSz')[0],W=+sz.getAttribute('cx')/E,Hh=+sz.getAttribute('cy')/E,pRel=await rels('ppt/presentation.xml'),out=[],TC={},MAP={tx1:'dk1',bg1:'lt1',tx2:'dk2',bg2:'lt2'};
 const th=XD(await rd('ppt/theme/theme1.xml')),cs0=XT(th,'a:clrScheme')[0];if(cs0)[...cs0.children].forEach(e=>{const c=e.firstElementChild;if(c)TC[e.localName]=c.getAttribute('lastClr')||c.getAttribute('val')});
 const adj=(hx,mod,off)=>{let r=parseInt(hx.slice(0,2),16)/255,g=parseInt(hx.slice(2,4),16)/255,b=parseInt(hx.slice(4,6),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let l=(mx+mn)/2,s=0,h=0;if(mx!=mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx==r?(g-b)/d+(g<b?6:0):mx==g?(b-r)/d+2:(r-g)/d+4;h/=6}
  l=Math.min(1,Math.max(0,l*mod+off));const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t%1+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p};return[s?f(h+1/3):l,s?f(h):l,s?f(h-1/3):l].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')};
 const clr=el=>{if(!el)return null;const c=[...el.children].find(e=>/Clr$/.test(e.localName));if(!c)return null;const v=c.getAttribute('val');let hx=c.localName=='srgbClr'?v:c.localName=='sysClr'?c.getAttribute('lastClr'):TC[MAP[v]||v];if(!hx||hx.length!=6)return null;
  const m=n=>{const e=XT(c,'a:'+n)[0];return e?+e.getAttribute('val')/1e5:null},lm=m('lumMod'),lo=m('lumOff'),tn=m('tint');if(lm!=null||lo!=null)hx=adj(hx,lm??1,lo??0);else if(tn!=null)hx=adj(hx,tn,1-tn);return'#'+hx},
  alphaOf=e=>{const a=e&&XT(e,'a:alpha')[0];return a?+a.getAttribute('val')/1e5:null},
  fillOf=sp=>{if(!sp)return null;for(const e of sp.children){if(e.localName=='solidFill')return clr(e);if(e.localName=='gradFill'){const g=XT(e,'a:gs')[0];return g?clr(g):null}if(e.localName=='noFill')return''}return null},
  lnClr=l=>{const s=l&&[...l.children].find(e=>e.localName=='solidFill');return s?clr(s):null},phOf=el=>XT(el,'p:ph')[0],norm=t=>t=='ctrTitle'?'title':t,
  phFind=(doc,ph)=>{if(!ph)return null;const ix=ph.getAttribute('idx'),ty=norm(ph.getAttribute('type')||'body'),L=XT(doc,'p:sp');return L.find(s=>{const q=phOf(s);return q&&ix!=null&&q.getAttribute('idx')==ix})||L.find(s=>{const q=phOf(s);return q&&norm(q.getAttribute('type')||'body')==ty})},
  xfOf=sp=>{const x=XT(sp,'a:xfrm')[0]||XT(sp,'p:xfrm')[0];if(!x)return null;const o=XT(x,'a:off')[0],e=XT(x,'a:ext')[0];return o&&e?{x:+o.getAttribute('x'),y:+o.getAttribute('y'),w:+e.getAttribute('cx'),h:+e.getAttribute('cy'),rot:+(x.getAttribute('rot')||0)/6e4,fh:x.getAttribute('flipH')=='1',fv:x.getAttribute('flipV')=='1'}:null},
  defs=(ch,lv)=>ch.map(n=>{const l=XT(n,'a:lvl'+lv+'pPr')[0];return l&&XT(l,'a:defRPr')[0]}).filter(Boolean),
  fin=(b,g)=>{let cx=b.x+b.w/2,cy=b.y+b.h/2,a=0;for(let i=g.length-1;i>=0;i--){const q=g[i],r=q.a*Math.PI/180,dx=cx-q.cx,dy=cy-q.cy;cx=q.cx+dx*Math.cos(r)-dy*Math.sin(r);cy=q.cy+dx*Math.sin(r)+dy*Math.cos(r);a+=q.a}a=(a%360+360)%360;return{x:cx-b.w/2,y:cy-b.h/2,w:b.w,h:b.h,...(a?{rot:a}:{})}},
  crop=sr=>{const c=sr?['l','t','r','b'].map(k=>Math.max(0,+(sr.getAttribute(k)||0)/1e5)):null;return c&&c.some(v=>v)?{cr:c}:{}},
  dash=(l,lw)=>{const pd=l&&XT(l,'a:prstDash')[0],v=pd&&pd.getAttribute('val');return v&&v!='solid'?{ds:({dot:[1,2],sysDot:[1,1],dash:[4,3],sysDash:[3,1],lgDash:[8,3],dashDot:[4,2,1,2],lgDashDot:[8,3,1,3]}[v]||[4,3]).map(q=>q*Math.max(lw,.75))}:{}};
 const walk=async(nodes,tf,cx,items,own)=>{for(const el of nodes){const ln=el.localName,cn=XT(el,'p:cNvPr')[0];if(cn&&cn.getAttribute('hidden')=='1')continue;
  if(ln=='grpSp'){const x=XT(el,'a:xfrm')[0];if(!x)continue;const o=XT(x,'a:off')[0],e=XT(x,'a:ext')[0],co=XT(x,'a:chOff')[0],ce=XT(x,'a:chExt')[0],at=(n,a)=>+n.getAttribute(a),sg=at(e,'cx')/(at(ce,'cx')||1),sy=at(e,'cy')/(at(ce,'cy')||1),fx=x.getAttribute('flipH')=='1',fy=x.getAttribute('flipV')=='1',gr=+(x.getAttribute('rot')||0)/6e4;
   await walk([...el.children],{sx:fx?-tf.sx*sg:tf.sx*sg,sy:fy?-tf.sy*sy:tf.sy*sy,tx:fx?tf.tx+tf.sx*(at(o,'x')+at(e,'cx')+at(co,'x')*sg):tf.tx+tf.sx*(at(o,'x')-at(co,'x')*sg),ty:fy?tf.ty+tf.sy*(at(o,'y')+at(e,'cy')+at(co,'y')*sy):tf.ty+tf.sy*(at(o,'y')-at(co,'y')*sy),
    g:gr?[...tf.g,{a:gr,cx:(tf.tx+tf.sx*(at(o,'x')+at(e,'cx')/2))/E,cy:(tf.ty+tf.sy*(at(o,'y')+at(e,'cy')/2))/E}]:tf.g},cx,items,own);continue}
  if(!['sp','pic','cxnSp','graphicFrame'].includes(ln))continue;const ph=phOf(el);if(ph&&own)continue;
  let xf=xfOf(el),lay=null,mas=null;if(ph){lay=phFind(cx.ly,ph);mas=phFind(cx.ms,ph);xf=xf||(lay&&xfOf(lay))||(mas&&xfOf(mas))}if(!xf)continue;
  const x1=tf.tx+xf.x*tf.sx,x2=tf.tx+(xf.x+xf.w)*tf.sx,y1=tf.ty+xf.y*tf.sy,y2=tf.ty+(xf.y+xf.h)*tf.sy,X=Math.min(x1,x2)/E,Y=Math.min(y1,y2)/E,Wd=Math.abs(x2-x1)/E,Ht=Math.abs(y2-y1)/E,bx={x:X,y:Y,w:Wd,h:Ht},
   mir=(tf.sx<0)!=(tf.sy<0),rot=mir?-xf.rot:xf.rot,gs=rot?[...tf.g,{a:rot,cx:X+Wd/2,cy:Y+Ht/2}]:tf.g,FB=b=>fin(b,gs),fh=xf.fh!=(tf.sx<0),fv=xf.fv!=(tf.sy<0),fl2={...(fh?{fh:1}:{}),...(fv?{fv:1}:{})};
  const sp=XT(el,'p:spPr')[0],l=sp&&XT(sp,'a:ln')[0],lw=l&&l.getAttribute('w')?+l.getAttribute('w')/E:1,st=XT(el,'p:style')[0];
  if(ln=='pic'){const bl=XT(el,'a:blip')[0],r=bl&&cx.rel[bl.getAttribute('r:embed')],fl=r&&z.file(r.t),am=bl&&XT(bl,'a:alphaModFix')[0],g=sp&&XT(sp,'a:prstGeom')[0];
   if(fl)try{items.push({id:nid(),t:'img',a:await addAsset(await fl.async('uint8array')),...FB(bx),...fl2,...crop(XT(el,'a:srcRect')[0]),...(am?{op:+am.getAttribute('amt')/1e5}:{}),...(g&&g.getAttribute('prst')=='ellipse'?{cl:'ell'}:{})})}catch(e){}
   const pc=lnClr(l);if(pc&&!(l&&XT(l,'a:noFill')[0]))items.push({id:nid(),t:g&&g.getAttribute('prst')=='ellipse'?'ell':'rect',...FB(bx),fill:'',st:pc,sw:lw,...dash(l,lw)});continue}
  if(ln=='cxnSp'){items.push({id:nid(),t:'line',...FB(bx),...fl2,st:lnClr(l)||(st&&clr(XT(st,'a:lnRef')[0]))||'#000000',sw:lw,...dash(l,lw)});continue}
  if(ln=='graphicFrame'){const tb=XT(el,'a:tbl')[0];if(!tb)continue;const trs=XT(tb,'a:tr'),mg=[],tp=XT(tb,'a:tblPr')[0],fr=tp&&tp.getAttribute('firstRow')=='1',bd=tp&&tp.getAttribute('bandRow')=='1',ac=TC.accent1||'4472C4';let anyF=false;
   const cells=trs.map((tr,ri)=>XT(tr,'a:tc').map((tc,ci)=>{const gs2=+(tc.getAttribute('gridSpan')||1),rs=+(tc.getAttribute('rowSpan')||1);if(gs2>1||rs>1)mg.push({r:ri,c:ci,rs,cs:gs2});return XT(tc,'a:p').map(p=>XT(p,'a:t').map(t=>t.textContent).join('')).join('\n')})),
   cf=trs.map((tr,ri)=>XT(tr,'a:tc').map(tc=>{const tp2=XT(tc,'a:tcPr')[0],c0=tp2&&fillOf(tp2);if(c0){anyF=true;return c0}if(c0==='')return'';if(fr&&ri==0)return'#'+ac;if(bd)return'#'+adj(ac,ri%2?.4:.2,ri%2?.6:.8);return''})),rp=XT(tb,'a:rPr')[0];
   items.push({id:nid(),t:'table',...FB(bx),cells,cw:XT(tb,'a:gridCol').map(g=>+g.getAttribute('w')),rh:trs.map(t=>+t.getAttribute('h')),mg,cf,hdc:fr?'#ffffff':undefined,fs:(rp&&rp.getAttribute('sz')?+rp.getAttribute('sz'):1400)/100*.9,col:'#000000',st:'#9a9490',hd:!!fr,rn:true});continue}
  let fl=fillOf(sp),lc=l&&XT(l,'a:noFill')[0]?'':lnClr(l),gr=null,op=null;const fe=sp&&[...sp.children].find(e=>e.localName=='solidFill'||e.localName=='gradFill');
  if(fe){if(fe.localName=='gradFill'){const gg=XT(fe,'a:gs'),lin=XT(fe,'a:lin')[0];gr={st:gg.map(q=>[+q.getAttribute('pos')/1e5,clr(q)||'#808080']),ang:lin?+lin.getAttribute('ang')/6e4:90};op=alphaOf(gg[0]&&gg[0].firstElementChild)}else op=alphaOf(fe.firstElementChild)}if(op!=null&&op>=1)op=null;
  if(fl==null&&st){const fr=XT(st,'a:fillRef')[0];if(fr&&fr.getAttribute('idx')!='0')fl=clr(fr)}if(lc==null&&st){const lr=XT(st,'a:lnRef')[0];if(lr&&lr.getAttribute('idx')!='0')lc=clr(lr)}
  const g=sp&&XT(sp,'a:prstGeom')[0],cg=sp&&XT(sp,'a:custGeom')[0],pn=g?g.getAttribute('prst'):'rect';let sh={t:'rect'};
  if(cg){const pa=cust(cg);if(pa)sh={t:'path',pa}}else if(pn=='ellipse')sh={t:'ell'};else if(pn=='line'||pn=='straightConnector1')sh={t:'line'};else{const pa=preset(pn,g,Wd,Ht);if(pa)sh={t:'path',pa}}
  if(sh.t=='line')items.push({id:nid(),t:'line',...FB(bx),...fl2,st:lc||fl||'#000000',sw:lw,...dash(l,lw)});
  else if(fl||lc||gr)items.push({id:nid(),t:sh.t,...(sh.pa?{pa:sh.pa}:{}),...FB(bx),...fl2,fill:gr?'':fl||'',...(gr?{gr}:{}),st:lc||fl||'#000000',sw:lc?lw:0,...dash(l,lw),...(op!=null?{op}:{})});
  const bf=sp&&[...sp.children].find(e=>e.localName=='blipFill');if(bf){const bl=XT(bf,'a:blip')[0],r=bl&&cx.rel[bl.getAttribute('r:embed')],f3=r&&z.file(r.t);if(f3)try{items.push({id:nid(),t:'img',a:await addAsset(await f3.async('uint8array')),...FB(bx),...fl2,...crop(XT(bf,'a:srcRect')[0])})}catch(e){}}
  const tb=XT(el,'p:txBody')[0];if(!tb)continue;const kind=ph?(norm(ph.getAttribute('type')||'body')=='title'?'titleStyle':['sldNum','dt','ftr'].includes(ph.getAttribute('type'))?'otherStyle':'bodyStyle'):'otherStyle',
   ch=[tb,lay,mas,XT(cx.ms,'p:'+kind)[0]].filter(Boolean),bp=[XT(tb,'a:bodyPr')[0],lay&&XT(lay,'a:bodyPr')[0],mas&&XT(mas,'a:bodyPr')[0]].filter(Boolean),bpa=n=>{const b=bp.find(b=>b.getAttribute(n)!=null);return b&&b.getAttribute(n)},
   af=XT(tb,'a:normAutofit')[0],sc=af&&af.getAttribute('fontScale')?+af.getAttribute('fontScale')/1e5:1,iL=+(bpa('lIns')??91440)/E,iR=+(bpa('rIns')??91440)/E,iT=+(bpa('tIns')??45720)/E,iB=+(bpa('bIns')??45720)/E,anc=bpa('anchor')||'t',
   vt=bpa('vert'),vert=vt=='vert'||vt=='vert270'||vt=='eaVert',bw=vert?Ht:Wd,bh=vert?Wd:Ht,bx0=vert?X+Wd/2-bw/2:X,by0=vert?Y+Ht/2-bh/2:Y,gsT=vert?[...gs,{a:vt=='vert270'?-90:90,cx:X+Wd/2,cy:Y+Ht/2}]:gs,aw0=Math.max(10,bw-iL-iR),ps=[],cnt={},fcol=(st&&clr(XT(st,'a:fontRef')[0]))||'#'+(TC.dk1||'000000');
  for(const p of [...tb.children].filter(e=>e.localName=='p')){const pp=XT(p,'a:pPr')[0],lv=+((pp&&pp.getAttribute('lvl'))||0)+1,ds=defs(ch,lv),L=[pp,...ch.map(n=>XT(n,'a:lvl'+lv+'pPr')[0])].filter(Boolean),pAt=a=>{const n=L.find(q=>q.getAttribute(a)!=null);return n&&n.getAttribute(a)};
   const mk=rp=>{const at=a=>{const e=[rp,...ds].find(d=>d&&d.getAttribute(a)!=null);return e&&e.getAttribute(a)},sf=d=>d&&[...d.children].find(c=>c.localName=='solidFill'),ce=[rp,...defs(ch.slice(0,-1),lv)].find(sf),me=ds.find(sf),lt=[rp,...ds].map(d=>d&&XT(d,'a:latin')[0]).find(Boolean);
    return{fs:+(at('sz')||1800)/100*sc,b:at('b')=='1',i:at('i')=='1',u:(at('u')||'none')!='none',col:(ce&&clr(sf(ce)))||(st&&clr(XT(st,'a:fontRef')[0]))||(me&&clr(sf(me)))||fcol,ff:FONTK(lt&&lt.getAttribute('typeface'))}},
    runs=[];for(const r of [...p.children].filter(e=>['r','br','fld'].includes(e.localName))){const rp=XT(r,'a:rPr')[0];runs.push({...mk(rp),t:r.localName=='br'?'\n':XT(r,'a:t').map(t=>t.textContent).join('')})}
   const txt=runs.map(r=>r.t).join('');if(!txt.trim()){const e0=XT(p,'a:endParaRPr')[0],f0=mk(e0).fs;ps.push({gap:1,fs:f0});continue}
   let bu=null;for(const n of L){if(XT(n,'a:buNone')[0]){bu=null;break}const c=XT(n,'a:buChar')[0],a=XT(n,'a:buAutoNum')[0];if(c){bu=c.getAttribute('char');break}if(a){bu='#';break}}
   if(bu){cnt[lv]=(cnt[lv]||0)+1;runs.unshift({...runs[0],t:(bu=='#'?cnt[lv]+'. ':bu+' '),u:false})}else cnt[lv]=0;
   const marL=+(pAt('marL')||0)/E,ind=+(pAt('indent')||0)/E,off=bu?Math.max(0,marL+ind):Math.max(0,marL),al=pAt('algn')||'l',fs=Math.max(...runs.map(r=>r.fs)),
   lnv=(()=>{for(const n of L){const q=XT(n,'a:lnSpc')[0],e=q&&q.firstElementChild;if(e)return e.localName=='spcPct'?1.2*+e.getAttribute('val')/1e5:+e.getAttribute('val')/100/fs}return 1.2})(),
   sp2=nm=>{for(const n of L){const q=XT(n,'a:'+nm)[0],e=q&&q.firstElementChild;if(e)return e.localName=='spcPts'?+e.getAttribute('val')/100:+e.getAttribute('val')/1e5*fs*1.2}return 0},
   same=runs.every(r=>r.fs==runs[0].fs&&r.b==runs[0].b&&r.i==runs[0].i&&r.col==runs[0].col&&r.ff==runs[0].ff&&!r.u),aw=aw0-off;
   ps.push({txt:runs.map(r=>r.t).join(''),runs:same?null:runs,r0:runs[0],fs,al,off,aw,lh:lnv,h:runsH(runs,aw,lnv),sb:sp2('spcBef'),sa:sp2('spcAft')})}
  const tot=ps.reduce((s,p)=>s+(p.gap?p.fs*.8:p.sb+p.h+p.sa),0);let yy=anc=='ctr'?by0+(bh-tot)/2:anc=='b'?by0+bh-tot-iB:by0+iT;
  for(const p of ps){if(p.gap){yy+=p.fs*.8;continue}yy+=p.sb;items.push({id:nid(),t:'text',...fin({x:bx0+iL+p.off,y:yy,w:p.aw,h:p.h},gsT),txt:p.txt,fs:p.fs,b:p.r0.b,i:p.r0.i,col:p.r0.col,ff:p.r0.ff,lh:p.lh,...(p.runs?{rr:p.runs}:{}),al:p.al=='ctr'?'center':p.al=='r'?'right':'left'});yy+=p.h+p.sa}}};
 for(const s of XT(pr,'p:sldId')){const sp=pRel[s.getAttribute('r:id')].t,sd=XD(await rd(sp)),srl=await rels(sp),lp=Object.values(srl).find(r=>r.y=='slideLayout').t,ly=XD(await rd(lp)),lrl=await rels(lp),mp=Object.values(lrl).find(r=>r.y=='slideMaster').t,ms=XD(await rd(mp)),mrl=await rels(mp),items=[],pg={w:W,h:Hh,bg:null,items},
  I={sx:1,sy:1,tx:0,ty:0,g:[]},tree=d=>[...XT(d,'p:spTree')[0].children],hide=sd.documentElement.getAttribute('showMasterSp')=='0',hideM=ly.documentElement.getAttribute('showMasterSp')=='0';
  for(const[d,rl]of[[sd,srl],[ly,lrl],[ms,mrl]]){const b=XT(d,'p:bg')[0];if(!b)continue;const q=XT(b,'p:bgPr')[0],bf=q&&XT(q,'a:blipFill')[0],c0=q?fillOf(q):(XT(b,'p:bgRef')[0]?clr(XT(b,'p:bgRef')[0]):null);
   if(bf){const bl=XT(bf,'a:blip')[0],r=bl&&rl[bl.getAttribute('r:embed')],f4=r&&z.file(r.t);if(f4)try{items.push({id:nid(),t:'img',a:await addAsset(await f4.async('uint8array')),x:0,y:0,w:W,h:Hh})}catch(e){}}else if(c0)items.push({id:nid(),t:'rect',x:0,y:0,w:W,h:Hh,fill:c0,st:c0,sw:0});break}
  if(!hide&&!hideM)await walk(tree(ms),I,{ly,ms,rel:mrl},items,1);if(!hide)await walk(tree(ly),I,{ly,ms,rel:lrl},items,1);await walk(tree(sd),I,{ly,ms,rel:srl},items,0);out.push(pg)}
 return out}
