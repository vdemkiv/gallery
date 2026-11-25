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
.rm-back{white-space:nowrap}.rm-short{display:none}@media (max-width:520px){.rm-long{display:none}.rm-short{display:inline}}.rm-links{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.rm-back{display:inline-block;margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);text-decoration:none;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:6px 12px;text-shadow:none;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
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
  const top=el('div','rm-top',`<div class="rm-mark"><div class="rm-links"><a class="rm-back" href="https://volodymyrdemkiv.com">‹ <span class="rm-long">volodymyrdemkiv.com</span><span class="rm-short">Main site</span></a>${cfg.back?`<a class="rm-back" href="${cfg.back}">All rooms</a>`:''}</div><h1>${cfg.title}</h1><p>${cfg.subtitle||''}</p></div><div class="rm-views"></div>`);root.appendChild(top);
  const views=top.querySelector('.rm-views');
  const hint=el('div','rm-hint',cfg.hint||'Drag to look around · tap a print to step closer · scroll or pinch to move');root.appendChild(hint);
  const card=el('div','rm-card',`<button class="nav" type="button" aria-label="Previous print">‹</button><div class="txt"><h2></h2><p class="meta"></p><p class="inq">Available · inquire</p></div><button class="nav" type="button" aria-label="Next print">›</button>`);card.hidden=true;root.appendChild(card);
  const loading=el('div','rm-loading','<p>Entering the room</p>');root.appendChild(loading);

  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,logarithmicDepthBuffer:!!cfg.logDepth});}
  catch(e){stage.innerHTML='<div class="rm-nogl">This browser could not open the 3D room. Try a recent Chrome, Safari or Firefox.</div>';loading.classList.add('done');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
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
  const MOODQ=()=>{try{const q=new URLSearchParams(location.search).get('mood');if(q!=null)return q!=='0';}catch(e){}return true;};
  // painted light for the moody rooms: the soft oval a ceiling head aimed at 30 degrees throws on the wall (no real lights, so it stays fast)
  const rectPool=tex(256,256,(g,w,h)=>{const q=g.createRadialGradient(w/2,h*.44,0,w/2,h*.44,w*.5);q.addColorStop(0,'rgba(255,240,220,.62)');q.addColorStop(.55,'rgba(255,240,220,.42)');q.addColorStop(.8,'rgba(255,240,220,.14)');q.addColorStop(1,'rgba(255,240,220,0)');
    g.save();g.translate(w/2,h*.44);g.scale(1,1.08);g.translate(-w/2,-h*.44);g.fillStyle=q;g.fillRect(0,0,w,h);g.restore();});
  const pool=tex(256,256,(g,w,h)=>{const r=g.createRadialGradient(w/2,h*.45,0,w/2,h*.45,w/2);r.addColorStop(0,'rgba(255,236,210,.55)');r.addColorStop(.6,'rgba(255,230,200,.18)');r.addColorStop(1,'rgba(255,230,200,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});

  // ---- frames: one shared builder for every room ----
  // A classic moulding with eased edges and mitred corners, an 8-ply museum mat with a 45 degree bevel, the paper
  // showing a little around the image, and painted (baked) shadows: the frame on the wall, the moulding on the mat,
  // the mat edge on the print. No extra lights: the shadows are a few transparent quads over one shared texture.
  const FRAME=ROOMS.frame=ROOMS.frame||{};
  const FQ=(()=>{try{return new URLSearchParams(location.search).get('frame');}catch(e){return null;}})();
  // shared shading atlas: left half a soft edge falloff (dark at s=0), right half the same falloff around a corner
  const shade=tex(256,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const f=s=>{s=Math.min(1,Math.max(0,s));const k=1-s*s*(3-2*s);return Math.pow(k,1.35);};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const a=x<128?f(y/(h-1)):f(Math.hypot(x-128,y)/(h-1));d[i]=d[i+1]=d[i+2]=8;d[i+3]=Math.round(a*255);}
    g.putImageData(id,0,0);},null,false);
  shade.wrapS=shade.wrapT=THREE.ClampToEdgeWrapping;shade.anisotropy=1;shade.generateMipmaps=false;shade.minFilter=THREE.LinearFilter;
  const shadeMats={};
  const shadeMat=(op)=>shadeMats[op]||(shadeMats[op]=new THREE.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false,opacity:op,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  // quads for one overlay: edge(x0,y0,x1,y1, side, s0) with the dark side named, corner(cx,cy, r, quadrant)
  function Overlay(){const P=[],U=[];
    const tri=(a,b,c)=>{P.push(...a,...b,...c);};
    this.quad=(p,uv)=>{tri(p[0],p[1],p[2]);tri(p[0],p[2],p[3]);U.push(...uv[0],...uv[1],...uv[2],...uv[0],...uv[2],...uv[3]);};
    // rectangle x0..x1, y0..y1 at depth z; the dark edge is 'top' | 'bottom' | 'left' | 'right'; s0..1 is how far into the falloff it starts
    this.edge=(x0,y0,x1,y1,z,dark,s0)=>{const v=s=>1-s*.992,u=.25;s0=s0||0;
      const a=v(s0),b=v(1);let uv;
      if(dark==='top')uv=[[u,b],[u,b],[u,a],[u,a]];else if(dark==='bottom')uv=[[u,a],[u,a],[u,b],[u,b]];
      else if(dark==='left')uv=[[u,a],[u,b],[u,b],[u,a]];else uv=[[u,b],[u,a],[u,a],[u,b]];
      this.quad([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],uv);};
    // a corner of radius r whose centre (darkest) is at cx,cy and that grows toward sx,sy (each +1 or -1)
    this.corner=(cx,cy,r,sx,sy,z)=>{const U0=.5+.5/256,U1=1,V0=1,V1=1-.992;
      const x1=cx+sx*r,y1=cy+sy*r;
      this.quad([[cx,cy,z],[x1,cy,z],[x1,y1,z],[cx,y1,z]],[[U0,V0],[U1,V0],[U1,V1],[U0,V1]]);};
    // a soft rectangle: solid inside x0..x1,y0..y1 shrunk by r/2, fading out over r
    this.soft=(x0,y0,x1,y1,r,z)=>{const h=r/2;x0+=h;x1-=h;y0+=h;y1-=h;
      this.quad([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],[[.25,1],[.25,1],[.25,1],[.25,1]]);
      this.edge(x0,y1,x1,y1+r,z,'bottom',0);this.edge(x0,y0-r,x1,y0,z,'top',0);
      this.edge(x0-r,y0,x0,y1,z,'right',0);this.edge(x1,y0,x1+r,y1,z,'left',0);
      this.corner(x0,y0,r,-1,-1,z);this.corner(x1,y0,r,1,-1,z);this.corner(x1,y1,r,1,1,z);this.corner(x0,y1,r,-1,1,z);};
    this.mesh=(op)=>{const g=new THREE.BufferGeometry();
      // keep every triangle facing the room
      for(let i=0;i<P.length;i+=9){const ax=P[i+3]-P[i],ay=P[i+4]-P[i+1],bx=P[i+6]-P[i],by=P[i+7]-P[i+1];if(ax*by-ay*bx<0){
        for(let k=0;k<3;k++){const t=P[i+3+k];P[i+3+k]=P[i+6+k];P[i+6+k]=t;}const j=i/9*6;for(let k=0;k<2;k++){const t=U[j+2+k];U[j+2+k]=U[j+4+k];U[j+4+k]=t;}}}
      g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
      const m=new THREE.Mesh(g,shadeMat(op));m.renderOrder=1;m.raycast=()=>{};return m;};}
  function merge(geos){const pos=[],nor=[],uv=[];geos.forEach(g=>{g=g.index?g.toNonIndexed():g;pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);
      if(g.attributes.uv)uv.push(...g.attributes.uv.array);else for(let i=0;i<g.attributes.position.count;i++)uv.push(0,0);g.dispose();});
    const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));m.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));m.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return m;}
  // moulding finishes
  const grainTex=(base,dark,lines)=>tex(512,128,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);
    for(let i=0;i<lines;i++){const y=rnd(0,h),a=rnd(.05,.22);g.strokeStyle=`rgba(${dark},${a})`;g.lineWidth=rnd(.6,2.2);g.beginPath();g.moveTo(0,y);
      for(let x=0;x<=w;x+=32)g.lineTo(x,y+Math.sin(x/w*Math.PI*2*rnd(.5,1.5))*rnd(0,3));g.stroke();}grain(g,w,h,10);},[1,1]);
  const STYLES={
    black:()=>new THREE.MeshStandardMaterial({color:0x0e0d0c,roughness:.42}),
    white:()=>new THREE.MeshStandardMaterial({color:0xeeebe5,roughness:.6}),
    oak:()=>new THREE.MeshStandardMaterial({map:grainTex('#b89a72','92,66,38',70),roughness:.62}),
    walnut:()=>new THREE.MeshStandardMaterial({map:grainTex('#5a4232','28,18,10',70),roughness:.5}),
    // older look, kept for rooms that ask for it: a flat black box
    flat:()=>new THREE.MeshStandardMaterial({color:0x090807,roughness:.55})};
  const styleMats={};
  const mouldMat=(s)=>styleMats[s]||(styleMats[s]=(STYLES[s]||STYLES.black)());
  // baked shading lives in vertex colours; the patch lets it darken the soft glow (emissive) too, so the shadows hold in every room
  const shadeEmissive=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_COLOR\ntotalEmissiveRadiance*=vColor.rgb;\n#endif');};
  const baked=(o)=>{const m=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true},o));m.onBeforeCompile=shadeEmissive;return m;};
  const matMats={};
  const matMat=baked({color:cfg.matColor||0xf1ece2,roughness:1});matMats[cfg.matColor||0xf1ece2]=matMat;
  const matFor=(c)=>c==null?matMat:(matMats[c]||(matMats[c]=baked({color:c,roughness:1})));
  const paperMat=baked({color:cfg.paperColor||0xece7dc,roughness:.95});
  const falloff=s=>{if(s>=1)return 0;s=Math.max(0,s);const k=1-s*s*(3-2*s);return Math.pow(k,1.35);};
  // shadow bands: [edge, band width, strength]; edge is {top:y}|{bottom:y}|{left:x}|{right:x}
  const shadeAt=(x,y,B)=>B.reduce((v,b)=>{const d=b.top!=null?b.top-y:b.bottom!=null?y-b.bottom:b.left!=null?x-b.left:b.right-x;return v*(1-b.k*falloff(d/b.w));},1);
  const steps=(a,b,n)=>{const r=[];for(let i=0;i<=n;i++)r.push(a+(b-a)*i/n);return r;};
  // a flat grid over x0..x1, y0..y1 split at the given breaks, leaving out cells inside the hole, coloured by the shadow bands
  function shadedGrid(xs,ys,z,B,hole,extra){const X=[...new Set(xs.map(v=>+v.toFixed(6)))].sort((a,b)=>a-b),Y=[...new Set(ys.map(v=>+v.toFixed(6)))].sort((a,b)=>a-b);
    const P=[],C=[];const put=(x,y,zz,f)=>{P.push(x,y,zz);const c=shadeAt(x,y,B)*(f||1);C.push(c,c,c);};
    for(let i=0;i+1<X.length;i++)for(let j=0;j+1<Y.length;j++){const x0=X[i],x1=X[i+1],y0=Y[j],y1=Y[j+1];
      if(hole&&(x0+x1)/2>hole[0]&&(x0+x1)/2<hole[1]&&(y0+y1)/2>hole[2]&&(y0+y1)/2<hole[3])continue;
      put(x0,y0,z);put(x1,y0,z);put(x1,y1,z);put(x0,y0,z);put(x1,y1,z);put(x0,y1,z);}
    if(extra)extra(put);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();return g;}
  const mouldCache={};
  // one side of the moulding, built as the top piece (outer edge at y=+c) then turned into place
  function mouldSide(L,c,M,D,e,rot){const s=new THREE.Shape();s.moveTo(-L/2+e,c-e);s.lineTo(L/2-e,c-e);s.lineTo(L/2-M+e*.41,c-M+e);s.lineTo(-L/2+M-e*.41,c-M+e);s.closePath();
    const g=new THREE.ExtrudeGeometry(s,{depth:D-2*e,bevelEnabled:e>0,bevelThickness:e,bevelSize:e,bevelSegments:2,curveSegments:1});g.translate(0,0,e);
    const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++){uv.setXY(i,p.getX(i)/.35+rot,(p.getY(i)-p.getZ(i))/.06);}
    g.rotateZ(rot);return g;}
  function moulding(FW,FH,M,D,style){const key=[FW,FH,M,D].map(v=>v.toFixed(4)).join('/')+style;if(mouldCache[key])return mouldCache[key];
    const e=style==='flat'?0:Math.min(M*.12,.06*IN*2);
    return mouldCache[key]=merge([mouldSide(FW,FH/2,M,D,e,0),mouldSide(FW,FH/2,M,D,e,Math.PI),mouldSide(FH,FW/2,M,D,e,-Math.PI/2),mouldSide(FH,FW/2,M,D,e,Math.PI/2)]);}
  // mat face plus the four bevel faces, one mesh; iw,ih = inside the moulding, ow,oh = the window at the back of the bevel, oy = window offset (bottom weighting), t = board thickness
  function matGeo(iw,ih,ow,oh,oy,t,z,B){const X=iw/2,Y=ih/2,fx=ow/2+t,fy0=oy-oh/2-t,fy1=oy+oh/2+t,bx=ow/2,by0=oy-oh/2,by1=oy+oh/2,zb=z-t;
    const xs=[-X,X,-fx,fx],ys=[-Y,Y,fy0,fy1];B.forEach(b=>{const n=b.top!=null||b.bottom!=null?10:6;
      if(b.top!=null)ys.push(...steps(b.top,Math.max(-Y,b.top-b.w),n));if(b.bottom!=null)ys.push(...steps(b.bottom,Math.min(Y,b.bottom+b.w),n));
      if(b.left!=null)xs.push(...steps(b.left,Math.min(X,b.left+b.w),n));if(b.right!=null)xs.push(...steps(b.right,Math.max(-X,b.right-b.w),n));});
    return shadedGrid(xs.filter(v=>v>=-X&&v<=X),ys.filter(v=>v>=-Y&&v<=Y),z,B,[-fx,fx,fy0,fy1],put=>{
      const q=(a,b,c,d,f)=>{[a,b,c,a,c,d].forEach(p=>put(p[0],p[1],p[2],f));};
      q([-bx,by1,zb],[bx,by1,zb],[fx,fy1,z],[-fx,fy1,z],.78);   // top bevel, faces down a little: in its own shade
      q([-fx,fy0,z],[fx,fy0,z],[bx,by0,zb],[-bx,by0,zb],1.04);  // bottom bevel, faces up: it catches the light
      q([-fx,fy0,z],[-bx,by0,zb],[-bx,by1,zb],[-fx,fy1,z],.93); // left
      q([bx,by0,zb],[fx,fy0,z],[fx,fy1,z],[bx,by1,zb],.93);});}  // right
  FRAME.styles=Object.keys(STYLES);
  // the finish that suits each space: dark wood for the old rooms, light oak with the larch of the Alps, white in the bright Miami gallery, black elsewhere
  const CITY_FRAME=FRAME.byCity=Object.assign({paris:'walnut',bilbao:'walnut',alps:'oak',miami:'white'},FRAME.byCity||{});

  function framed(o){
    // o: w, h (print, inches), mat, mould (inches), style, lip (inches from the moulding face down to the mat), matColor
    const g=new THREE.Group();
    const style=FQ||o.style||cfg.frameStyle||CITY_FRAME[cfg.city]||'black';
    const mould=o.mould||(Math.max(o.w,o.h)>30?1.25:.6), mat=o.mat!=null?o.mat:Math.max(2,Math.round(Math.max(o.w,o.h)*.12));
    const FW=(o.w+2*mat+2*mould)*IN, FH=(o.h+2*mat+2*mould)*IN, M=mould*IN, D=(o.depth||(mould>1?1.75:1.25))*IN;
    const lip=(o.lip!=null?o.lip:(mould>1?.45:.3))*IN, t=(o.ply===4?1/16:1/8)*IN;
    const reveal=(o.reveal!=null?o.reveal:.25)*IN;
    const iw=FW-2*M, ih=FH-2*M, ow=o.w*IN+2*reveal, oh=o.h*IN+2*reveal;
    const oy=Math.min(.375*IN,Math.max(0,(ih-oh)/2-t)*.12);           // a touch more mat below than above
    const zM=D-lip, zP=zM-t-.002;
    // the wall: a soft shadow below and a little around the frame, plus a tight contact shadow
    const wall=new Overlay();const off=D*1.15,r=Math.max(D*1.6,.05);
    wall.soft(-FW/2-D*.25,-FH/2-off,FW/2+D*.25,FH/2-off*.6,r,.008);
    const wm=wall.mesh(.42);g.add(wm);
    const ct=new Overlay();ct.soft(-FW/2,-FH/2-D*.2,FW/2,FH/2,Math.max(.012,D*.45),.009);g.add(ct.mesh(.4));
    // moulding
    const fm=new THREE.Mesh(moulding(FW,FH,M,D,style),mouldMat(style));g.add(fm);
    // mat and bevel, with the moulding's shadow baked in: a soft band under the top (light from above, about 30 degrees off the wall), a little at the sides, a touch at the bottom
    const X=iw/2,Y=ih/2,band=lip*1.75+.2*IN,side=lip*.5+.12*IN,ao=.14*IN;
    const MB=[{top:Y,w:band,k:.62},{left:-X,w:side,k:.26},{right:X,w:side,k:.26},{bottom:-Y,w:ao,k:.12}];
    const mm=new THREE.Mesh(matGeo(iw,ih,ow,oh,oy,t,zM,MB),matFor(o.matColor));g.add(mm);
    // the paper behind the window, with the thin shadow of the mat's top edge, then the image
    const bx=ow/2,by0=oy-oh/2,by1=oy+oh/2,pb=t*1.75+.08*IN,pw=bx+2*t,ph0=by0-2*t,ph1=by1+2*t;
    const PB=[{top:by1,w:pb,k:.45},{left:-bx,w:t*1.2,k:.2},{right:bx,w:t*1.2,k:.2}];
    const paper=new THREE.Mesh(shadedGrid([-pw,pw,-bx,bx,...steps(-bx,-bx+t*1.2,3),...steps(bx,bx-t*1.2,3)],[ph0,ph1,by0,by1,...steps(by1,by1-pb,6)],zP,PB),paperMat);g.add(paper);
    const img=new THREE.Mesh(new THREE.PlaneGeometry(o.w*IN,o.h*IN),new THREE.MeshBasicMaterial({color:cfg.printTint||0xdcd8d0}));img.position.set(0,oy,zM-t+.001);g.add(img);
    // once the image is in, size it to the picture and let the mat's shadow touch its top edge where it reaches
    const fit=(a)=>{let w=o.w*IN,h=w/a;if(h>o.h*IN){h=o.h*IN;w=h*a;}const ys=[-h/2,h/2,...steps(by1-oy,by1-oy-pb,6)].filter(v=>v>=-h/2&&v<=h/2);
      const geo=shadedGrid([-w/2,w/2],ys,0,PB.map(b=>Object.assign({},b,b.top!=null?{top:b.top-oy}:{})));
      const uv=[],p=geo.attributes.position;for(let i=0;i<p.count;i++)uv.push(p.getX(i)/w+.5,p.getY(i)/h+.5);geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
      img.geometry.dispose();img.geometry=geo;img.material.vertexColors=true;img.material.needsUpdate=true;};
    return {g,img,fit,FW,FH,D};
  }
  FRAME.build=framed;

  const loader=new THREE.TextureLoader();
  const works=[];let pending=0,started=false;
  function done(){if(--pending<=0&&!started)start();}
  function addWork(o){
    // o: {title, file, w, h (print, inches), mat (inches), mould (inches), style, asIs (true: the image already includes its own frame), pos:Vector3, normal:Vector3, meta, light}
    let g,img,FW,FH,f;
    if(o.asIs){
      g=new THREE.Group();FW=o.w*IN;FH=o.h*IN;const D=2*IN;
      const wall=new Overlay();wall.soft(-FW/2-D*.25,-FH/2-D*1.15,FW/2+D*.25,FH/2-D*.7,Math.max(D*1.6,.05),.008);g.add(wall.mesh(.42));
      const box=new THREE.Mesh(new THREE.BoxGeometry(FW,FH,D),mouldMat('flat'));box.position.z=D/2;g.add(box);
      img=new THREE.Mesh(new THREE.PlaneGeometry(FW,FH),new THREE.MeshBasicMaterial({color:cfg.printTint||0xdcd8d0}));img.position.z=D+.001;g.add(img);
    }else{f=framed(o);g=f.g;img=f.img;FW=f.FW;FH=f.FH;}
    if(o.light!==false&&cfg.pools!==false){const moody=cfg.mood!==false&&MOODQ();const p=new THREE.Mesh(moody?new THREE.PlaneGeometry(Math.max(FW,FH*.8)*1.75,FH*1.95):new THREE.PlaneGeometry(FW*2.4,FH*2.6),new THREE.MeshBasicMaterial({map:moody?rectPool:pool,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:(cfg.mood===false?(cfg.poolStrength||.35):(cfg.poolStrength||.35)*2.2)}));p.position.set(0,moody?FH*.1:FH*.15,.001);p.raycast=()=>{};g.add(p);}
    pending++;
    loader.load(o.file,t=>{t.encoding=THREE.sRGBEncoding;t.anisotropy=ANISO;img.material.map=t;img.material.needsUpdate=true;
      if(f)f.fit(t.image.width/t.image.height);done();},undefined,done);
    g.position.copy(o.pos);g.lookAt(o.pos.clone().add(o.normal));
    g.traverse(c=>{c.userData.art=g;if(c.isMesh&&!c.material.transparent){c.castShadow=true;}});
    scene.add(g);
    works.push({g,title:o.title,meta:o.meta||cfg.meta||'',normal:o.normal.clone(),center:o.pos.clone(),size:Math.max(FW,FH*1.25),half:Math.hypot(FW,FH)/2,FW,FH});
    return g;
  }
  function bench(x,z,rotY,material,len){
    const b=new THREE.Group(),L=len||1.8;
    const t=new THREE.Mesh(new THREE.BoxGeometry(L,.06,.46),material);t.position.y=.43;b.add(t);
    [-(L/2-.08),(L/2-.08)].forEach(px=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.06,.4,.42),material);l.position.set(px,.2,0);b.add(l);});
    const s=new THREE.Mesh(new THREE.PlaneGeometry(L+.5,.95),new THREE.MeshBasicMaterial({map:blob,transparent:true,depthWrite:false}));s.rotation.x=-Math.PI/2;s.position.y=.004;b.add(s);
    b.position.set(x,0,z);b.rotation.y=rotY||0;scene.add(b);return b;
  }

  const ctx={THREE,scene,renderer,camera,IN,tex,grain,rnd,blob,softShadow,addWork,bench,framed};
  // moody gallery light: dim the room, then a ceiling spot on every print
  const MOOD=(()=>{try{const q=new URLSearchParams(location.search).get('mood');if(q!=null)return q!=='0';}catch(e){}return cfg.mood!==false;})();
  const TEXQ=(()=>{try{const q=new URLSearchParams(location.search).get('tex');if(q!=null)return q!=='0';}catch(e){}return cfg.textile!==false;})();
  window.__TEXTILE=MOOD&&TEXQ?cfg.city:null;
  const room=cfg.build(ctx);
  if(MOOD){
    Object.values(matMats).concat(paperMat).forEach(m=>{m.emissive=new THREE.Color(0xfff2e2);m.emissiveIntensity=.42;});
    scene.traverse(o=>{if(!o.isLight||o.userData.spot)return;
      o.intensity*=o.isHemisphereLight?.42:o.isAmbientLight?.42:o.isDirectionalLight?.34:.26;});
    scene.traverse(o=>{if(o.userData.pano)o.traverse(m=>{if(m.material&&m.material.color)m.material.color.multiplyScalar(.85);});});
    const can=new THREE.MeshStandardMaterial({color:0x161616,roughness:.45,metalness:.5});
    const ray=new THREE.Raycaster();const solids=[];scene.traverse(o=>{if(o.isMesh&&!o.material.transparent&&!o.userData.art)solids.push(o);});
    // art lighting after the usual rule: track heads on the ceiling, aimed about 30 degrees from vertical, warm white (about 3000K),
    // even edge to edge with little spill; one head for squarish prints, two for wide ones
    const T30=Math.tan(30*Math.PI/180),up=new THREE.Vector3(0,1,0);
    works.forEach(w=>{const c=w.center,n=w.normal;const side=new THREE.Vector3().crossVectors(up,n).normalize();
      const probe=c.clone().addScaledVector(n,1.0);ray.set(probe,up);ray.far=8;const hit=ray.intersectObjects(solids,false)[0];
      const ceil=hit?hit.point.y:c.y+2.2;const fy=Math.min(ceil-.12,c.y+2.6);const out=Math.max(.6,(fy-c.y)*T30);
      const heads=(w.FW/w.FH>1.3)?[-w.FW/4,w.FW/4]:[0];
      heads.forEach(dx=>{const tgtP=c.clone().addScaledVector(side,dx);
        const lp=tgtP.clone().addScaledVector(n,out);lp.y=fy;

        const f=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.15,16),can);body.rotation.x=Math.PI/2;f.add(body);
        const lens=new THREE.Mesh(new THREE.CircleGeometry(.036,16),new THREE.MeshBasicMaterial({color:0xfff6e6}));lens.position.z=.076;f.add(lens);
        f.position.copy(lp);f.lookAt(tgtP);scene.add(f);
        const sl=Math.max(.02,ceil-fy);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,sl,6),can);stem.position.set(lp.x,fy+sl/2,lp.z);scene.add(stem);
        const plate=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.012,12),can);plate.position.set(lp.x,ceil-.006,lp.z);scene.add(plate);});});
  }   // returns {bounds:{x0,x1,z0,z1}, eye, start:{pos,look}, views:[{label,pos,look}]}
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
  // walking: stay inside the union of floor areas; slide along walls; route through doorways
  const inA=(a,x,z)=>x>=a.x0-1e-6&&x<=a.x1+1e-6&&z>=a.z0-1e-6&&z<=a.z1+1e-6;
  const areaAt=(x,z)=>AREAS.findIndex(a=>inA(a,x,z));
  function tryMove(p,dx,dz){if(areaAt(p.x,p.z)<0)clamp(p);
    if(areaAt(p.x+dx,p.z+dz)>=0){p.x+=dx;p.z+=dz;}else if(areaAt(p.x+dx,p.z)>=0)p.x+=dx;else if(areaAt(p.x,p.z+dz)>=0)p.z+=dz;}
  const ovl=(a,b)=>{const x0=Math.max(a.x0,b.x0),x1=Math.min(a.x1,b.x1),z0=Math.max(a.z0,b.z0),z1=Math.min(a.z1,b.z1);return x0<=x1&&z0<=z1?[(x0+x1)/2,(z0+z1)/2]:null;};
  let route=[];
  function routeTo(dest){route=[];const from=cur.pos;let s=areaAt(from.x,from.z);if(s<0){const q=clamp(from.clone());s=areaAt(q.x,q.z);}
    const d=clamp(dest.clone()),e=areaAt(d.x,d.z);
    if(s<0||e<0||s===e){tgt.pos.copy(d);return;}
    const prev=new Array(AREAS.length).fill(-2);prev[s]=-1;const qu=[s];
    while(qu.length){const i=qu.shift();if(i===e)break;AREAS.forEach((b,j)=>{if(prev[j]===-2&&ovl(AREAS[i],b)){prev[j]=i;qu.push(j);}});}
    if(prev[e]===-2){tgt.pos.copy(d);return;}
    const chain=[];for(let i=e;i!==-1;i=prev[i])chain.unshift(i);
    for(let k=0;k+1<chain.length;k++){const c=ovl(AREAS[chain[k]],AREAS[chain[k+1]]);route.push(new THREE.Vector3(c[0],EYE,c[1]));}
    route.push(d);tgt.pos.copy(route.shift());}
  function setYaw(y){let d=y-tgt.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));tgt.yaw+=d;}
  function goPose(pos,look,slow){routeTo(pos.clone());const fin=route.length?route[route.length-1]:tgt.pos;const a=yawPitchTo(new THREE.Vector3(fin.x,EYE,fin.z),look);setYaw(a.yaw);tgt.pitch=a.pitch;posRate=slow?1.6:2.2;lookRate=slow?2.0:2.6;}
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

  ROOMS.jump=(p,l)=>{route=[];tgt.pos.set(p[0],EYE,p[2]);cur.pos.copy(tgt.pos);const a=yawPitchTo(cur.pos,new THREE.Vector3(...l));cur.yaw=tgt.yaw=a.yaw;cur.pitch=tgt.pitch=a.pitch;unfocus();hint.classList.add('gone');};
  ROOMS.camera=camera;ROOMS.works=works;
  function forward(){return new THREE.Vector3(-Math.sin(tgt.yaw),0,-Math.cos(tgt.yaw));}
  function nudge(f,s){route=[];const fw=forward(),sd=new THREE.Vector3(-fw.z,0,fw.x);const dx=fw.x*f+sd.x*s,dz=fw.z*f+sd.z*s;const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.25));for(let i=0;i<n;i++)tryMove(tgt.pos,dx/n,dz/n);tgt.pos.y=EYE;posRate=3.2;}

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
    if(hit.object.name==='floor'){unfocus();routeTo(new THREE.Vector3(hit.point.x,EYE,hit.point.z));posRate=1.8;hint.classList.add('gone');}
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
    if(route.length&&cur.pos.distanceTo(tgt.pos)<.45)tgt.pos.copy(route.shift());
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
