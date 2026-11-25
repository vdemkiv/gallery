/* Spaces (v2): multi-room galleries in different cities, built with kit.js.
   ROOMS.space({city, title, subtitle, meta, works:[{t,f,a}], back}) */
(function(){
const K=window.KIT,P=K.paint,R=window.ROOMS;
const rnd=K.rnd;
function dims(a,L){return a>=1?[L,Math.round(L/a)]:[Math.round(L*a),L];}
function sized(w,L){const [pw,ph]=dims(w.a,L||60);return Object.assign({},w,{size:{w:pw,h:ph,mat:5,mould:1.25}});}

/* ---------- shared materials ---------- */
const M={
  whitePaint:()=>K.mat({tile:3,rough:.92,bump:.0015,draw:(g,w,h)=>{g.fillStyle='#efeeea';g.fillRect(0,0,w,h);K.blots(g,w,h,40,['#f4f3f0','#e7e5e0'],60,220,.18);K.noise(g,w,h,5);}}),
  greyConcreteFloor:(base)=>K.mat({tile:6,rough:.3,metal:.02,bump:.001,draw:(g,w,h)=>{g.fillStyle=base||'#8d8983';g.fillRect(0,0,w,h);
    K.blots(g,w,h,160,['#9b978f','#7f7b75','#87837c','#a29d95'],30,180,.12);for(let i=0;i<40;i++){g.globalAlpha=.06;g.strokeStyle='#5f5b56';g.lineWidth=1;g.beginPath();g.moveTo(rnd(0,w),rnd(0,h));g.lineTo(rnd(0,w),rnd(0,h));g.stroke();}
    g.globalAlpha=.55;g.fillStyle='#5a5651';g.fillRect(0,0,w,2);g.fillRect(0,0,2,h);g.fillRect(0,h/2,w,1.5);g.fillRect(w/2,0,1.5,h);g.globalAlpha=1;K.noise(g,w,h,10);}}),
};

/* ---------- New York: a Chelsea gallery, storefront onto a street of brick walk-ups ---------- */
P.nyFacades=()=>K.canvas(4096,1024,(g,w,h)=>{ // 100 m x 25 m, 41 px per metre
  const pm=w/100;g.clearRect(0,0,w,h);let x=0;
  while(x<w){const bw=rnd(7,13)*pm,fl=Math.round(rnd(4,6)),fh=3.2*pm,top=h-fl*fh-1.2*pm;
    const hue=rnd(8,24),sat=rnd(16,30),lit=rnd(34,48);g.fillStyle=`hsl(${hue},${sat}%,${lit}%)`;g.fillRect(x,top,bw,h-top);
    // brick texture
    g.globalAlpha=.12;for(let y=top;y<h;y+=3){g.fillStyle=Math.random()<.5?'#000':'#fff';g.fillRect(x,y,bw,1);}g.globalAlpha=1;
    // cornice
    g.fillStyle=`hsl(${hue},10%,${lit-12}%)`;g.fillRect(x-4,top-10,bw+8,14);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-4,top+4,bw+8,5);
    // windows with stone lintels
    const nw=Math.max(3,Math.round(bw/(2.6*pm)));const ww=1.0*pm,wh=1.7*pm;
    for(let f=0;f<fl-1;f++)for(let k=0;k<nw;k++){const wx=x+(k+.5)*bw/nw-ww/2,wy=top+f*fh+fh*.35;
      g.fillStyle='#d8d0c2';g.fillRect(wx-4,wy-8,ww+8,8);g.fillRect(wx-3,wy+wh,ww+6,5);
      const sky=Math.random();g.fillStyle=sky<.25?'#9aa6ae':`rgb(${rnd(25,45)|0},${rnd(28,46)|0},${rnd(30,50)|0})`;g.fillRect(wx,wy,ww,wh);
      g.fillStyle='rgba(235,235,225,.55)';g.fillRect(wx+ww/2-1,wy,2,wh);g.fillRect(wx,wy+wh/2-1,ww,2);
      if(Math.random()<.35){g.fillStyle='rgba(240,236,225,.85)';g.fillRect(wx+2,wy+2,ww-4,wh*rnd(.2,.6));}}
    // fire escape on some buildings
    if(Math.random()<.6){const fx=x+bw*rnd(.2,.4),fw=bw*.42;g.strokeStyle='#1c1b1a';g.fillStyle='#1c1b1a';
      for(let f=1;f<fl-1;f++){const fy=top+f*fh+fh*.35+1.75*pm;g.fillRect(fx,fy,fw,4);g.lineWidth=1.5;for(let k=0;k<fw;k+=6){g.beginPath();g.moveTo(fx+k,fy);g.lineTo(fx+k,fy-0.9*pm);g.stroke();}g.fillRect(fx,fy-0.9*pm,fw,2);
        g.lineWidth=3;g.beginPath();g.moveTo(fx+fw*.1,fy);g.lineTo(fx+fw*.9,fy+fh-6);g.stroke();}}
    // ground floor shop: dark glass, awning
    const gy=h-1.2*pm-fh*.95;g.fillStyle='#2a2b2c';g.fillRect(x+6,gy,bw-12,h-gy);g.fillStyle='rgba(160,170,175,.25)';g.fillRect(x+10,gy+8,bw-20,fh*.55);
    if(Math.random()<.5){g.fillStyle=['#2f3b33','#3a2a26','#26303a','#1e1e1e'][Math.random()*4|0];g.beginPath();g.moveTo(x+4,gy);g.lineTo(x+bw-4,gy);g.lineTo(x+bw-4+10,gy+0.7*pm);g.lineTo(x-6,gy+0.7*pm);g.fill();}
    // water tower
    if(Math.random()<.35){const tx=x+bw*rnd(.3,.7),ty=top-10;g.strokeStyle='#2a2522';g.lineWidth=3;g.beginPath();g.moveTo(tx-30,ty);g.lineTo(tx-24,ty-60);g.moveTo(tx+30,ty);g.lineTo(tx+24,ty-60);g.stroke();
      g.fillStyle='#5b4a3c';g.fillRect(tx-34,ty-150,68,92);g.globalAlpha=.25;g.fillStyle='#000';for(let k=0;k<5;k++)g.fillRect(tx-34,ty-140+k*18,68,2);g.globalAlpha=1;
      g.fillStyle='#3d332c';g.beginPath();g.moveTo(tx-38,ty-150);g.lineTo(tx,ty-185);g.lineTo(tx+38,ty-150);g.fill();}
    x+=bw;}
  // sidewalk base, then daylight haze
  g.fillStyle='#8f8a83';g.fillRect(0,h-1.2*pm,w,1.2*pm);K.noise(g,w,h,10);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(225,230,235,.16)';g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';});
P.nySkyline=()=>K.canvas(4096,1024,(g,w,h)=>{g.clearRect(0,0,w,h);let x=0;while(x<w){const bw=rnd(40,140),bh=rnd(.25,.95)*h;g.fillStyle=`rgba(${rnd(150,175)|0},${rnd(160,182)|0},${rnd(172,192)|0},1)`;g.fillRect(x,h-bh,bw,bh);
  if(Math.random()<.3){g.fillRect(x+bw*.3,h-bh-40,bw*.4,40);}g.globalAlpha=.15;g.fillStyle='#fff';for(let y=h-bh+6;y<h;y+=10)g.fillRect(x+3,y,bw-6,2);g.globalAlpha=1;x+=bw+rnd(-10,20);}});

function newYork(ctx,cfg){
  const THREE=ctx.THREE,scene=ctx.scene;
  const wall=M.whitePaint(),floor=M.greyConcreteFloor(),ceilM=K.mat({tile:2,color:0xf3f2ef,rough:1});
  const frameM=new THREE.MeshStandardMaterial({color:0x202122,roughness:.45,metalness:.3});
  const S=K.space(ctx,{frameMat:frameM,cells:[
    {id:'A',x0:-7,x1:7,z0:0,z1:10,h:4.6,wall,floor,ceil:ceilM,
      walls:{N:{open:[{at:0,w:3.2,y0:0,y1:3.6,kind:'door'}]},S:{open:[{at:-4.5,w:3.8,y0:.3,y1:3.9,kind:'window',cols:2,rows:1,sill:frameM},{at:4.5,w:3.8,y0:.3,y1:3.9,kind:'window',cols:2,sill:frameM},{at:0,w:2.0,y0:0,y1:3.9,kind:'glass',rows:1}]}}},
    {id:'B',x0:-6.5,x1:6.5,z0:-11,z1:-.3,h:5.4,wall,floor,ceil:ceilM,
      walls:{S:{open:[{at:0,w:3.2,y0:0,y1:3.6,kind:'door'}]}},
      dress:(ctx,c)=>{ // two long skylights
        [-2.6,2.6].forEach(x=>{const well=new THREE.Mesh(new THREE.BoxGeometry(2.2,.6,8.6),new THREE.MeshStandardMaterial({color:0xf1f0ec,roughness:1,side:THREE.BackSide}));well.position.set(x,c.h+.3,(c.z0+c.z1)/2);scene.add(well);
          const glow=new THREE.Mesh(new THREE.PlaneGeometry(2.2,8.6),new THREE.MeshBasicMaterial({color:0xf6f7f6}));glow.rotation.x=Math.PI/2;glow.position.set(x,c.h+.58,(c.z0+c.z1)/2);scene.add(glow);
          const diff=new THREE.Mesh(new THREE.PlaneGeometry(2.2,8.6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55}));diff.rotation.x=Math.PI/2;diff.position.set(x,c.h+.02,(c.z0+c.z1)/2);scene.add(diff);
          for(let z=c.z0+2;z<c.z1-1;z+=3){const p=new THREE.PointLight(0xf4f6f8,.32,8,2);p.position.set(x,c.h-.6,z);scene.add(p);}});}}
  ]});
  // track lights in the front room
  const blk=new THREE.MeshStandardMaterial({color:0x161616,roughness:.5});
  [-3.5,3.5].forEach(x=>{const r=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,8.4),blk);r.position.set(x,4.3,5);scene.add(r);
    for(let z=1.6;z<9.6;z+=1.6){const c=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.15,14),blk);c.position.set(x+(x<0?-.06:.06),4.2,z);c.rotation.z=x<0?.45:-.45;scene.add(c);}});
  scene.add(new THREE.HemisphereLight(0xffffff,0xb7b2aa,.55));
  [[0,4.2,5],[-4,4.2,3],[4,4.2,3]].forEach(p=>{const l=new THREE.PointLight(0xfff4e8,.25,9,2);l.position.set(...p);scene.add(l);});
  K.sun(ctx,{from:[-14,18,34],to:[0,0,4],intensity:1.25,size:14});
  // outside: sidewalk, street, the far side of the block, and midtown in the haze
  const out=K.outside(ctx,{dir:'S',at:[0,0,10]});
  out.ground(K.canvas(512,256,(g,w,h)=>{g.fillStyle='#a19c94';g.fillRect(0,0,w,h);g.strokeStyle='rgba(60,58,54,.5)';for(let x=0;x<w;x+=34){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}K.noise(g,w,h,14);}),.3,4.2,90,-.005,1.05);
  out.ground(K.canvas(1024,256,(g,w,h)=>{g.fillStyle='#4a4a4a';g.fillRect(0,0,w,h);K.noise(g,w,h,22);g.fillStyle='#d9cf9e';for(let x=0;x<w;x+=60)g.fillRect(x,h*.48,32,4);g.fillStyle='#6b6862';g.fillRect(0,0,w,6);g.fillRect(0,h-6,w,6);}),4.2,14.5,90,-.15,1.0);
  out.ground(K.canvas(512,256,(g,w,h)=>{g.fillStyle='#9e998f';g.fillRect(0,0,w,h);K.noise(g,w,h,14);}),14.5,19,90,-.005,1.0);
  out.wall(P.nyFacades(),19,100,25,0,0,1.3);
  out.wall(P.nySkyline(),220,500,90,-2,0,1.02);
  out.wall(P.sky(2048,1024,{stops:[[0,'#9db7cf'],[.7,'#dbe3e8'],[1,'#eef0ee']],clouds:'thin'}),420,1400,500,-20,0,1.12,false);
  [-9.5,-1.2,7.8].forEach(x=>out.wall(P.leafy(),3.4,5.5,8.2,0,x,1.15));
  // hang: front room W and E walls, N wall either side of the door; back room N, W, E
  const ws=cfg.works.map(w=>sized(w,60));let i=0;const next=()=>ws[(i++)%ws.length];const Y=1.72;
  [[2.2],[5],[7.8]].forEach(([z])=>S.hang('A','W',z,Y,next()));
  [[7.8],[5],[2.2]].forEach(([z])=>S.hang('A','E',z,Y,next()));
  [-4.6,4.6].forEach(x=>S.hang('A','N',x,Y,next()));
  [-4.2,0,4.2].forEach(x=>S.hang('B','N',x,Y,next()));
  [-8.2,-3.2].forEach(z=>S.hang('B','W',z,Y,next()));
  [-3.2,-8.2].forEach(z=>S.hang('B','E',z,Y,next()));
  const bench=new THREE.MeshStandardMaterial({color:0x2f2924,roughness:.55});ctx.bench(0,-5.6,0,bench,2.2);ctx.bench(0,4.8,0,bench,2.0);
  return {areas:S.areas(.7).concat([{x0:-1.2,x1:1.2,z0:-1.2,z1:.8}]),eye:1.6,
    start:{pos:new THREE.Vector3(2.4,1.6,8.8),look:new THREE.Vector3(-.6,1.6,-6)},
    views:[{label:'Front room',pos:new THREE.Vector3(2.4,1.6,8.8),look:new THREE.Vector3(-.6,1.6,-6)},
           {label:'Back room',pos:new THREE.Vector3(0,1.6,-1.6),look:new THREE.Vector3(0,1.7,-11)},
           {label:'Street',pos:new THREE.Vector3(-3,1.6,3),look:new THREE.Vector3(2,2,14)}]};
}

const CITIES={newYork};
R.space=function(cfg){const fn=CITIES[cfg.city];
  R.run({title:cfg.title,subtitle:cfg.subtitle||'Volodymyr Demkiv',meta:cfg.meta,back:cfg.back,shadows:true,far:60000,logDepth:true,
    label:cfg.label||`A gallery showing ${cfg.title}`,bg:cfg.bg||'#1d1c1b',exposure:cfg.exposure||.9,poolStrength:cfg.pool||.22,
    build(ctx){return fn(ctx,cfg);}});
};
R.CITIES=CITIES;R.M=M;R.sized=sized;
})();
