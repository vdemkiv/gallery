/* Shared engine for Volodymyr Demkiv's 3D rooms.
   Each page loads three.js r128, then this file, then calls ROOMS.run(config).
   Everything is at true scale (metres); print sizes are given in inches. */
(function(){
const IN=0.0254;
const css=`
:root{--ink:#f4ece1;--muted:#cdbfae;--panel:rgba(38,31,25,.5);--line:rgba(244,236,225,.16);--focus:#e2c9a3;--sans:"Jost","Helvetica Neue",Arial,sans-serif;color-scheme:dark}
html,body{height:100%}
body{background:var(--room,#222);color:var(--ink);font-family:var(--sans);overflow:hidden;-webkit-font-smoothing:antialiased}
#stage{position:fixed;inset:0;touch-action:none;cursor:grab}
#stage.dragging{cursor:grabbing}
canvas{display:block}
[hidden]{display:none!important}
.rm-top{position:fixed;top:calc(env(safe-area-inset-top,0px) + 14px);left:max(16px,env(safe-area-inset-left,0px));right:max(16px,env(safe-area-inset-right,0px));display:flex;justify-content:space-between;align-items:flex-start;gap:12px;pointer-events:none}
.rm-mark{pointer-events:auto;text-shadow:0 1px 8px rgba(0,0,0,.35)}
.rm-back{display:inline-block;margin:0 0 10px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);text-decoration:none;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:6px 12px;text-shadow:none;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.rm-back:hover{border-color:rgba(244,236,225,.4)}
.rm-back:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.rm-mark h1{margin:0;white-space:nowrap;font-weight:500;font-size:13px;letter-spacing:.22em;text-transform:uppercase}
.rm-mark p{margin:4px 0 0;font-weight:300;font-size:13px;color:var(--ink);opacity:.85;letter-spacing:.02em}
.rm-views{display:flex;gap:6px;pointer-events:auto;flex-wrap:wrap;justify-content:flex-end}
.rm button{font:inherit;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:8px 14px;cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.rm button:hover{border-color:rgba(244,236,225,.4)}
.rm button:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.rm-hint{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 18px);font-size:13px;font-weight:300;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:8px 16px;white-space:nowrap;transition:opacity .8s;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.rm-hint.gone{opacity:0;pointer-events:none}
.rm-card{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 14px);width:min(540px,calc(100% - 32px));background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 16px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.rm-card .nav{width:38px;height:38px;padding:0;border-radius:50%;font-size:16px;letter-spacing:0;display:grid;place-items:center}
.rm-card .txt{min-width:0}
.rm-card h2{margin:0;font-weight:400;font-size:19px;letter-spacing:.02em}
.rm-card .meta{margin:3px 0 0;font-weight:300;font-size:13px;color:var(--muted);line-height:1.45}
.rm-card .inq{margin:6px 0 0;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
.rm-loading{position:fixed;inset:0;display:grid;place-items:center;background:var(--room,#222);transition:opacity 1.2s}
.rm-loading.done{opacity:0;pointer-events:none}
.rm-loading p{font-weight:300;font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.rm-nogl{position:fixed;inset:0;display:grid;place-items:center;padding:24px;text-align:center;font-weight:300;color:var(--muted)}
@media (max-width:520px){.rm-mark p{display:none}.rm-hint{font-size:12px;white-space:normal;text-align:center;width:max-content;max-width:calc(100% - 32px);border-radius:16px}}`;

function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}

function run(cfg){
  if(!document.body){document.addEventListener('DOMContentLoaded',()=>run(cfg));return;}
  document.documentElement.style.setProperty('--room',cfg.bg||'#2a221b');
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const root=el('div','rm');document.body.appendChild(root);
  const stage=el('div');stage.id='stage';stage.setAttribute('aria-label',cfg.label||'Walkable 3D room');root.appendChild(stage);
  const top=el('div','rm-top',`<div class="rm-mark">${cfg.back?`<a class="rm-back" href="${cfg.back}">‹ All rooms</a>`:''}<h1>${cfg.title}</h1><p>${cfg.subtitle||''}</p></div><div class="rm-views"></div>`);root.appendChild(top);
  const views=top.querySelector('.rm-views');
  const hint=el('div','rm-hint',cfg.hint||'Drag to look around · tap a print to step closer · scroll or pinch to move');root.appendChild(hint);
  const card=el('div','rm-card',`<button class="nav" type="button" aria-label="Previous print">‹</button><div class="txt"><h2></h2><p class="meta"></p><p class="inq">Available · inquire</p></div><button class="nav" type="button" aria-label="Next print">›</button>`);card.hidden=true;root.appendChild(card);
  const loading=el('div','rm-loading','<p>Entering the room</p>');root.appendChild(loading);

  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,logarithmicDepthBuffer:!!cfg.logDepth});}
  catch(e){stage.innerHTML='<div class="rm-nogl">This browser could not open the 3D room. Try a recent Chrome, Safari or Firefox.</div>';loading.classList.add('done');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=cfg.exposure||.8;
  if(cfg.shadows){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;}
  stage.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color(cfg.bg||'#2a221b');
  const camera=new THREE.PerspectiveCamera(55,1,.05,cfg.far||400);camera.rotation.order='YXZ';
  const ANISO=renderer.capabilities.getMaxAnisotropy();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- texture helpers ----
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function tex(w,h,draw,rep,srgb=true){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
    const t=new THREE.CanvasTexture(c);if(srgb)t.encoding=THREE.sRGBEncoding;t.anisotropy=ANISO;
    if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;}
  function grain(g,w,h,amt){const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}g.putImageData(id,0,0);}
  const softShadow=tex(256,256,(g,w,h)=>{g.filter='blur(16px)';g.fillStyle='rgba(30,22,14,.6)';g.fillRect(44,52,w-88,h-92);});
  const blob=tex(256,256,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(25,18,10,.55)');r.addColorStop(1,'rgba(25,18,10,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
  const pool=tex(256,256,(g,w,h)=>{const r=g.createRadialGradient(w/2,h*.45,0,w/2,h*.45,w/2);r.addColorStop(0,'rgba(255,236,210,.55)');r.addColorStop(.6,'rgba(255,230,200,.18)');r.addColorStop(1,'rgba(255,230,200,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});

  // ---- classic frame: thin black moulding, white mat ----
  const frameMat=new THREE.MeshStandardMaterial({color:0x090807,roughness:.55});
  const matMat=new THREE.MeshStandardMaterial({color:cfg.matColor||0xf1ece2,roughness:1});
  const loader=new THREE.TextureLoader();
  const works=[];let pending=0,started=false;
  function done(){if(--pending<=0&&!started)start();}
  function addWork(o){
    // o: {title, file, w, h (print, inches), mat (inches), mould (inches), asIs (true: the image already includes its own frame), pos:Vector3, normal:Vector3, meta, light}
    const g=new THREE.Group();
    const mould=o.asIs?0:(o.mould||(Math.max(o.w,o.h)>30?1.25:.6)), mat=o.asIs?0:(o.mat!=null?o.mat:Math.max(2,Math.round(Math.max(o.w,o.h)*.12)));
    const FW=(o.w+2*mat+2*mould)*IN, FH=(o.h+2*mat+2*mould)*IN, M=mould*IN, D=(o.asIs?2:1.5)*IN;
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(FW*1.4,FH*1.45),new THREE.MeshBasicMaterial({map:softShadow,transparent:true,depthWrite:false,opacity:.65}));
    sh.position.set(FW*.04,-FH*.05,.002);g.add(sh);
    if(o.light!==false&&cfg.pools!==false){const p=new THREE.Mesh(new THREE.PlaneGeometry(FW*2.4,FH*2.6),new THREE.MeshBasicMaterial({map:pool,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:cfg.poolStrength||.35}));p.position.set(0,FH*.15,.001);g.add(p);}
    let img;
    if(o.asIs){
      const box=new THREE.Mesh(new THREE.BoxGeometry(FW,FH,D),frameMat);box.position.z=D/2;g.add(box);
      img=new THREE.Mesh(new THREE.PlaneGeometry(FW,FH),new THREE.MeshBasicMaterial({color:cfg.printTint||0xdcd8d0}));img.position.z=D+.001;g.add(img);
    }else{
      const back=new THREE.Mesh(new THREE.BoxGeometry(FW-2*M,FH-2*M,D*.6),matMat);back.position.z=D*.3;g.add(back);
      [[FW,M,0,(FH-M)/2],[FW,M,0,-(FH-M)/2],[M,FH-2*M,-(FW-M)/2,0],[M,FH-2*M,(FW-M)/2,0]].forEach(b=>{const m=new THREE.Mesh(new THREE.BoxGeometry(b[0],b[1],D),frameMat);m.position.set(b[2],b[3],D/2);g.add(m);});
      img=new THREE.Mesh(new THREE.PlaneGeometry(o.w*IN,o.h*IN),new THREE.MeshBasicMaterial({color:cfg.printTint||0xdcd8d0}));img.position.z=D*.6+.0015;g.add(img);
    }
    pending++;
    loader.load(o.file,t=>{t.encoding=THREE.sRGBEncoding;t.anisotropy=ANISO;img.material.map=t;img.material.needsUpdate=true;
      if(!o.asIs){const a=t.image.width/t.image.height;let w=o.w*IN,h=w/a;if(h>o.h*IN){h=o.h*IN;w=h*a;}img.scale.set(w/(o.w*IN),h/(o.h*IN),1);}done();},undefined,done);
    g.position.copy(o.pos);g.lookAt(o.pos.clone().add(o.normal));
    g.traverse(c=>{c.userData.art=g;if(c.isMesh&&!c.material.transparent){c.castShadow=true;}});
    scene.add(g);
    works.push({g,title:o.title,meta:o.meta||cfg.meta||'',normal:o.normal.clone(),center:o.pos.clone(),size:Math.max(FW,FH*1.25)});
    return g;
  }
  function bench(x,z,rotY,material,len){
    const b=new THREE.Group(),L=len||1.8;
    const t=new THREE.Mesh(new THREE.BoxGeometry(L,.06,.46),material);t.position.y=.43;b.add(t);
    [-(L/2-.08),(L/2-.08)].forEach(px=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.06,.4,.42),material);l.position.set(px,.2,0);b.add(l);});
    const s=new THREE.Mesh(new THREE.PlaneGeometry(L+.5,.95),new THREE.MeshBasicMaterial({map:blob,transparent:true,depthWrite:false}));s.rotation.x=-Math.PI/2;s.position.y=.004;b.add(s);
    b.position.set(x,0,z);b.rotation.y=rotY||0;scene.add(b);return b;
  }

  const ctx={THREE,scene,renderer,camera,IN,tex,grain,rnd,blob,softShadow,addWork,bench};
  const room=cfg.build(ctx);   // returns {bounds:{x0,x1,z0,z1}, eye, start:{pos,look}, views:[{label,pos,look}]}
  const EYE=room.eye||1.6;

  // ---- smooth camera: everything eases toward a target ----
  const cur={pos:room.start.pos.clone(),yaw:0,pitch:0}, tgt={pos:room.start.pos.clone(),yaw:0,pitch:0};
  const yawPitchTo=(from,to)=>{const d=to.clone().sub(from);return {yaw:Math.atan2(-d.x,-d.z),pitch:Math.atan2(d.y,Math.hypot(d.x,d.z))};};
  {const a=yawPitchTo(cur.pos,room.start.look);cur.yaw=tgt.yaw=a.yaw;cur.pitch=tgt.pitch=a.pitch;}
  let focused=-1, posRate=2.6, lookRate=3.2;
  const B=room.bounds;
  const AREAS=room.areas||[B];
  function clamp(p){let best=null,bd=1e9;for(const a of AREAS){const x=Math.max(a.x0,Math.min(a.x1,p.x)),z=Math.max(a.z0,Math.min(a.z1,p.z)),d=(x-p.x)**2+(z-p.z)**2;if(d<bd){bd=d;best=[x,z];}if(d===0)break;}
    p.x=best[0];p.z=best[1];p.y=EYE;return p;}
  function setYaw(y){let d=y-tgt.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));tgt.yaw+=d;}
  function goPose(pos,look,slow){tgt.pos.copy(clamp(pos.clone()));const a=yawPitchTo(new THREE.Vector3(tgt.pos.x,EYE,tgt.pos.z),look);setYaw(a.yaw);tgt.pitch=a.pitch;posRate=slow?1.6:2.2;lookRate=slow?2.0:2.6;}
  function viewWork(i){
    const w=works[i];focused=i;
    const vf=THREE.MathUtils.degToRad(camera.fov)/2,hf=Math.atan(Math.tan(vf)*camera.aspect);
    const dist=Math.max(.9,(w.size*1.1)/Math.tan(Math.min(vf,hf)));
    goPose(w.center.clone().addScaledVector(w.normal,dist),w.center,true);
    card.querySelector('h2').textContent=w.title;card.querySelector('.meta').innerHTML=w.meta;card.hidden=false;hint.classList.add('gone');
  }
  function unfocus(){focused=-1;card.hidden=true;}
  const [prevB,nextB]=card.querySelectorAll('.nav');
  prevB.onclick=()=>viewWork((focused+works.length-1)%works.length);
  nextB.onclick=()=>viewWork((focused+1)%works.length);
  if(works.length<2){prevB.hidden=true;nextB.hidden=true;}
  (room.views||[]).forEach(v=>{const b=el('button',null,v.label);b.type='button';b.onclick=()=>{unfocus();const p=typeof v.pos==='function'?v.pos(camera):v.pos;goPose(p,v.look,true);};views.appendChild(b);});

  ROOMS.jump=(p,l)=>{tgt.pos.set(p[0],EYE,p[2]);cur.pos.copy(tgt.pos);const a=yawPitchTo(cur.pos,new THREE.Vector3(...l));cur.yaw=tgt.yaw=a.yaw;cur.pitch=tgt.pitch=a.pitch;unfocus();hint.classList.add('gone');};
  ROOMS.camera=camera;
  function forward(){return new THREE.Vector3(-Math.sin(tgt.yaw),0,-Math.cos(tgt.yaw));}
  function nudge(f,s){const fw=forward(),sd=new THREE.Vector3(-fw.z,0,fw.x);tgt.pos.addScaledVector(fw,f).addScaledVector(sd,s);clamp(tgt.pos);posRate=3.2;}

  // ---- input: drag to look, tap to go, wheel and pinch to move (all damped) ----
  const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
  const pts=new Map();let drag=null,pinch=null;
  stage.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});stage.setPointerCapture(e.pointerId);
    if(pts.size===1)drag={x:e.clientX,y:e.clientY,yaw:tgt.yaw,pitch:tgt.pitch,moved:false};
    if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)};drag=null;}});
  stage.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);nudge((d-pinch.d)*.006,0);pinch.d=d;if(focused>=0)unfocus();hint.classList.add('gone');return;}
    if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)>6){drag.moved=true;stage.classList.add('dragging');}
    if(drag.moved){const k=(e.pointerType==='touch'?1.5:1)*Math.PI/innerHeight*.85;tgt.yaw=drag.yaw+dx*k;tgt.pitch=Math.max(-.6,Math.min(.5,drag.pitch+dy*k));lookRate=9;hint.classList.add('gone');}});
  function endPointer(e,tapOk){pts.delete(e.pointerId);stage.classList.remove('dragging');
    if(tapOk&&drag&&!drag.moved&&!pinch)tap(e.clientX,e.clientY);
    if(pts.size<2)pinch=null;if(pts.size===0)drag=null;}
  stage.addEventListener('pointerup',e=>endPointer(e,true));
  stage.addEventListener('pointercancel',e=>endPointer(e,false));
  function tap(x,y){
    const r=renderer.domElement.getBoundingClientRect();ndc.set(((x-r.left)/r.width)*2-1,-((y-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);
    const hit=ray.intersectObjects(scene.children,true).filter(h=>h.object.visible&&h.object.material&&!h.object.material.transparent)[0];if(!hit)return;
    const art=hit.object.userData.art;if(art){const i=works.findIndex(w=>w.g===art);if(i>=0){viewWork(i);return;}}
    if(hit.object.name==='floor'){unfocus();tgt.pos.copy(clamp(new THREE.Vector3(hit.point.x,EYE,hit.point.z)));posRate=1.8;hint.classList.add('gone');}
  }
  let wheelAcc=0;
  stage.addEventListener('wheel',e=>{e.preventDefault();const d=e.deltaMode===1?e.deltaY*30:e.deltaY;wheelAcc+=Math.max(-120,Math.min(120,d));if(focused>=0)unfocus();hint.classList.add('gone');},{passive:false});
  const keys={};
  addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON'&&(e.key===' '||e.key==='Enter'))return;keys[e.key.toLowerCase()]=true;
    if(e.key==='Escape')unfocus();
    if(focused>=0&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();viewWork((focused+(e.key==='ArrowRight'?1:works.length-1))%works.length);keys[e.key.toLowerCase()]=false;}});
  addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});

  function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<h?70:55;camera.updateProjectionMatrix();}
  addEventListener('resize',resize);resize();

  let last=performance.now();
  function frame(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    if(wheelAcc){const step=wheelAcc*.0022;nudge(-step,0);wheelAcc*=.0;}
    const sp=1.4*dt;let f=0,s=0;
    if(keys['w']||(focused<0&&keys['arrowup']))f+=sp;if(keys['s']||(focused<0&&keys['arrowdown']))f-=sp;if(keys['a'])s-=sp;if(keys['d'])s+=sp;
    if(focused<0){if(keys['arrowleft']){tgt.yaw+=1.2*dt;lookRate=6;}if(keys['arrowright']){tgt.yaw-=1.2*dt;lookRate=6;}}
    if(f||s){if(focused>=0)unfocus();nudge(f*2,s*2);hint.classList.add('gone');}
    const kp=reduce?1:1-Math.exp(-dt*posRate), kl=reduce?1:1-Math.exp(-dt*lookRate);
    cur.pos.lerp(tgt.pos,kp);cur.yaw+=(tgt.yaw-cur.yaw)*kl;cur.pitch+=(tgt.pitch-cur.pitch)*kl;
    camera.position.copy(cur.pos);camera.rotation.set(cur.pitch,cur.yaw,0);
    if(room.tick)room.tick(dt,camera);
    renderer.render(scene,camera);requestAnimationFrame(frame);
  }
  function start(){started=true;loading.classList.add('done');setTimeout(()=>hint.classList.add('gone'),9000);}
  if(pending===0)start();
  setTimeout(()=>{if(!started)start();},8000);
  requestAnimationFrame(frame);
}
window.ROOMS={run,IN};
})();
