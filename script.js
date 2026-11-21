import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t;
const mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const mobile=matchMedia('(pointer:coarse)').matches||innerWidth<700, Q=mobile?.5:1, CY=.9;
let rs=7;const rnd=()=>{rs=rs+0x6D2B79F5|0;let t=Math.imul(rs^rs>>>15,1|rs);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
const U={uTime:{value:0},uScale:{value:600},uForm:{value:0},uForm2:{value:0},uBloom:{value:0},uDis:{value:0},uEmerge:{value:0},uBright:{value:1},
  uMouse:{value:new THREE.Vector3(99,99,0)},uRain:{value:0},uDust:{value:0},uOrbit:{value:0},uGather:{value:0},uPetals:{value:0},uGust:{value:0},uHeart:{value:0},uV:{value:new THREE.Vector2(5,3)}};
const S={t:0,mode:'intro',circle:0,heart:false,opened:false};
const tweens=[],timers=[];
const tw=(o,k,to,dur,cb)=>tweens.push({o,k,to,dur,t:0,from:null,cb});
const later=(ms,fn)=>timers.push(setTimeout(fn,ms));
const WA=$('wa').href;

try{main()}catch(e){console.error(e);document.body.classList.add('nogl')}

function main(){
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:false,powerPreference:'high-performance'});
renderer.setClearColor(0,1);
let pr=Math.min(devicePixelRatio,mobile?1.5:2);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,1,.1,60);
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.4,.5,.5);composer.addPass(bloom);composer.addPass(new OutputPass());
const disposables=[];
const mk=(geo,vs,fs,extra={},uni={})=>{const m=new THREE.ShaderMaterial({vertexShader:vs,fragmentShader:fs,uniforms:Object.assign({uTime:U.uTime,uScale:U.uScale},uni),...extra});const p=new THREE.Points(geo,m);p.frustumCulled=false;scene.add(p);disposables.push(geo,m);return p};
const ADD={transparent:true,depthWrite:false,blending:THREE.AdditiveBlending};
const attr=(g,n,a,s)=>g.setAttribute(n,new THREE.BufferAttribute(new Float32Array(a),s));
const BSOFT=`varying vec3 vC;varying float vA;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(vC,smoothstep(.5,.3,r)*vA);}`;
const SOFT=`varying vec3 vC;varying float vA;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float a=smoothstep(.5,.05,r);gl_FragColor=vec4(vC*(.6+.8*a),a*vA);}`;
const DISC=`varying vec3 vC;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(vC*(1.15-r),1.);}`;
const HDR=`uniform float uTime,uScale;const vec3 C=vec3(0.,${CY},0.);`;

/* ---------- ROSE ---------- */
const A={o:[],c:[],s:[],col:[],m:[],m2:[]};
const scat=()=>{const u=rnd()*6.283,z=rnd()*2-1,r=Math.sqrt(1-z*z),k=3.5+rnd()*3.5;return[r*Math.cos(u)*k*1.1,r*Math.sin(u)*k*.8+.8,z*k*.5]};
const add=(o,c,col,size,order,bs,delay,kind)=>{A.o.push(...o);A.c.push(...c);A.s.push(...scat());A.col.push(...col);A.m.push(size,rnd(),order,bs);A.m2.push(delay,kind)};
const layers=[
 {n:5,r:.03,y:.3,L:.42,W:.17,t:.05,b:.25,cup:2,rim:0,c:[[.22,0,.03],[.6,0,.08]]},
 {n:6,r:.06,y:.22,L:.62,W:.27,t:.12,b:.45,cup:1.6,rim:0,c:[[.35,0,.05],[.8,.02,.12]]},
 {n:7,r:.1,y:.12,L:.82,W:.38,t:.3,b:.6,cup:1.5,rim:.1,c:[[.45,0,.07],[.95,.05,.15]]},
 {n:8,r:.15,y:.02,L:1,W:.5,t:.5,b:.75,cup:1.15,rim:.3,c:[[.5,.01,.08],[1,.1,.2]]},
 {n:7,r:.2,y:-.1,L:1.1,W:.58,t:.8,b:.85,cup:.8,rim:.6,c:[[.55,.01,.09],[1,.28,.36]]}];
function petalPt(P,u,v,op){
 const th0=op?P.t:.05+P.li*.035,bd=op?P.b:.12,L=P.L*(op?1:.78),cup=P.cup*(op?1:1.25),r0=P.r*(op?1:.5);
 const th=th0+bd*u,rad=r0+L*(Math.cos(th0)-Math.cos(th))/bd,hy=P.y+L*(Math.sin(th)-Math.sin(th0))/bd;
 const w=P.W*(op?1:.85)*Math.pow(Math.sin(Math.PI*clamp(u*.92+.04)),.42)*(.35+.65*Math.min(1,u*3))*(1+.1*Math.sin(v*4+P.sd*9+u*5));
 const x=v*w,o=-cup*x*x+(op?P.rim*L*u*u*u*v*v:0)+(rnd()-.5)*.012,c=Math.cos(th),s=Math.sin(th),R=rad+o*c,Y=hy-o*s;
 return[Math.cos(P.phi)*R-Math.sin(P.phi)*x,CY+Y,Math.sin(P.phi)*R+Math.cos(P.phi)*x];
}
{const petals=[];let gi=0,tot=0;
 layers.forEach((l,li)=>{for(let k=0;k<l.n;k++)petals.push({...l,li,k,phi:gi++*2.39996+rnd()*.3,sd:rnd(),W:l.W*(.9+rnd()*.2),L:l.L*(.92+rnd()*.16),t:l.t+(rnd()-.5)*.2})});
 petals.forEach(p=>{p.a=p.L*p.W;tot+=p.a});
 const N=Math.floor(32000*Q);
 petals.forEach(p=>{const cnt=Math.round(N*p.a/tot);
  for(let i=0;i<cnt;i++){let u=Math.pow(rnd(),.75),v=rnd()*2-1,e=0;const q=rnd();
   if(q<.26){v=(v<0?-1:1)*(.94+rnd()*.06);e=1}else if(q<.31){u=.95+rnd()*.05;e=1}
   const c=mix3(p.c[0],p.c[1],clamp(u*.9+(rnd()-.5)*.15)),sh=(.4+.6*Math.pow(u,.6))*(e?1.3:1)*(.9+rnd()*.2);
   add(petalPt(p,u,v,true),petalPt(p,u,v,false),c.map(x=>x*sh),(e?.02:.0135)+rnd()*.004,(p.li+p.k/p.n*.9)/5,p.li*.14+p.k/p.n*.1,.05+p.li*.14+rnd()*.15,0)}});
 // stem
 const bez=t=>{const P=[[0,CY-.2,0],[.3,CY-1.1,0],[-.25,CY-1.8,0],[.12,CY-3,0]],m=1-t;return[0,1,2].map(i=>m*m*m*P[0][i]+3*m*m*t*P[1][i]+3*m*t*t*P[2][i]+t*t*t*P[3][i])};
 for(let i=0;i<1600*Q;i++){const t=rnd(),b=bez(t),a=rnd()*6.283,r=.035+.02*t,p=[b[0]+Math.cos(a)*r,b[1],b[2]+Math.sin(a)*r],sh=.7+rnd()*.5;
  add(p,p,[.03*sh,.5*sh,.2*sh],.016,.35,0,t*.6+rnd()*.15,1)}
 // leaves
 for(let li=0;li<5;li++){const t=[.22,.38,.55,.7,.83][li],side=li%2?1:-1,b=bez(t),d=[side,0,(rnd()-.5)*.5],dl=Math.hypot(d[0],d[2]);d[0]/=dl;d[2]/=dl;
  const e=.55,L=.75+rnd()*.25,W=.22+rnd()*.06,sx=d[2],sz=-d[0],dly=.5+li*.07;
  const h=u=>W*Math.pow(Math.sin(Math.PI*Math.pow(u,.85)),.9);
  const pt=(u,v)=>{const lat=v*h(u);return[b[0]+d[0]*Math.cos(e)*L*u+sx*lat,b[1]+Math.sin(e)*L*u-.55*L*u*u+.3*Math.abs(lat),b[2]+d[2]*Math.cos(e)*L*u+sz*lat]};
  for(let i=0;i<560*Q;i++){let u,v,k=0;const q=rnd();
   if(q<.12){u=rnd();v=0;k=1}else if(q<.4){const j=Math.floor(rnd()*6),s=rnd();u=Math.min(1,.12+.13*j+s*.3);v=(rnd()<.5?-1:1)*s*.97;k=1}
   else{u=rnd();v=(rnd()*2-1);if(rnd()<.2)v=v<0?-1:1;}
   const p=pt(u,v),c=k?[.45,1,.6]:mix3([.02,.45,.2],[.2,.9,.45],u),sh=.6+.5*rnd();
   add(p,[b[0]+(p[0]-b[0])*.1,b[1]+(p[1]-b[1])*.1,b[2]+(p[2]-b[2])*.1],c.map(x=>x*sh),k?.02:.016,.35,.3,dly+rnd()*.35,1)}}
}
const rg=new THREE.BufferGeometry();
[['aOpen',A.o,3],['aClosed',A.c,3],['aScatter',A.s,3],['aColor',A.col,3],['aMisc',A.m,4],['aMisc2',A.m2,2]].forEach(a=>attr(rg,a[0],a[1],a[2]));
attr(rg,'position',A.o,3);
mk(rg,HDR+`attribute vec3 aOpen,aClosed,aScatter,aColor;attribute vec4 aMisc;attribute vec2 aMisc2;
uniform float uForm,uForm2,uBloom,uDis,uEmerge,uBright;uniform vec3 uMouse;varying vec3 vC;
void main(){float sd=aMisc.y,kind=aMisc2.y;float f=kind<.5?uForm:uForm2;
 float p=smoothstep(aMisc2.x,aMisc2.x+.45,f*1.45);float ob=smoothstep(aMisc.w,aMisc.w+.45,uBloom*1.45);
 vec3 fm=mix(aClosed,aOpen,ob);fm.y+=sin(uTime*.8+sd*6.28)*.006;
 vec3 sc=aScatter+vec3(sin(uTime*.4+sd*40.),cos(uTime*.5+sd*30.),sin(uTime*.3+sd*20.))*.25;
 vec3 pos=mix(sc,fm,p*p*(3.-2.*p));
 float dl=(1.-aMisc.z)*.6;float d=smoothstep(dl,dl+.4,uDis);
 vec3 rel=pos-C;float an=d*(3.+sd*4.);float cs=cos(an),sn=sin(an);
 rel=vec3(rel.x*cs-rel.z*sn,rel.y,rel.x*sn+rel.z*cs)*(1.+d*(.8+sd*1.6));rel.y+=d*(sd-.35)*3.;pos=C+rel;
 vec2 dm=pos.xy-uMouse.xy;float inf=smoothstep(1.,0.,length(dm));
 pos.xy+=normalize(dm+1e-4)*inf*(sd>.75?-.25:.45);pos.z+=inf*.2*(sd-.5);
 vec4 mv=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;
 float sh=.75+.25*sin(uTime*3.+sd*60.);
 gl_PointSize=max(1.,aMisc.x*(.5+.5*p)*uEmerge*sh*(1.+d*.5)*uScale/-mv.z);
 vec3 col=mix(aColor,vec3(1.,.75,.25),(1.-p)*step(sd,.3)*.8);
 col=mix(col,.5+.5*cos(6.28*(sd+vec3(0.,.33,.67))),d*.5);
 vC=col*(.55+.45*sh)*uBright*(.35+.65*p)*uEmerge*(kind>.5?smoothstep(0.,.1,f):1.);}`,DISC,{},{uForm:U.uForm,uForm2:U.uForm2,uBloom:U.uBloom,uDis:U.uDis,uEmerge:U.uEmerge,uBright:U.uBright,uMouse:U.uMouse});

/* ---------- BUTTERFLIES ---------- */
const PAL=[[[.1,.45,1],[0,1,1],[.85,1,1]],[[1,.55,0],[1,.9,.2],[1,1,.8]],[[.5,.2,1],[.85,.6,1],[1,.9,1]],[[1,.1,.6],[1,.5,.8],[1,.85,.95]],[[.9,.95,1],[.4,.7,1],[.9,.6,1]]];
const wingR=(hind,a)=>hind?.8*(.55+.45*Math.sin(2.6*-a+.3)):1.1*(.6+.4*Math.sin(2*a));
const BF=[
 {c:[0,1.1,.6],a:[2.3,1.1,1.2],f:[.37,.51,.29],p:2},{c:[0,.9,-.8],a:[2.5,1,1.4],f:[.29,.43,.37],p:2},
 {c:[.3,1,.7],a:[1.5,.9,.8],f:[.55,.7,.43],p:4},{c:[0,1.1,0],a:[2,1.1,1.5],f:[.33,.47,.25],p:1},{c:[0,.5,.3],a:[2.3,1,1.2],f:[.41,.33,.53],p:5}];
BF.forEach((B,i)=>{const [c1,c2,c3]=PAL[i],P=[],C=[],I=[],Sc=[];
 const put=(p,c,s,part)=>{P.push(...p);C.push(...c);I.push(s,rnd(),part,0);const u=rnd()*6.283,z=rnd()*2-1,r=Math.sqrt(1-z*z)*2.2;Sc.push(r*Math.cos(u),r*Math.sin(u),z*1.5)};
 for(const side of[1,-1])for(const hind of[0,1]){const n=Math.floor((hind?380:520)*Q*1.9),[a0,a1]=hind?[-1.3,-.05]:[.1,1.55];
  for(let k=0;k<n;k++){const a=a0+rnd()*(a1-a0),R=wingR(hind,a),ed=rnd()<.25,r=R*(ed?.95+.05*rnd():Math.sqrt(rnd())),t=r/R;
   let col=mix3(c1,c2,hind?1-t:t);if(Math.abs(Math.sin(a*14))<.1)col=col.map(x=>x*.55);
   if(t>.7&&t<.85&&Math.abs(Math.sin(a*9))<.2)col=c3;if(ed)col=c3.map(x=>x*.8);
   put([side*r*Math.cos(a),r*Math.sin(a),0],col,ed?.03:.02,hind?2:1)}}
 for(let k=0;k<140;k++){const y=-.55+1.1*rnd(),rad=.05*Math.pow(Math.sin(Math.PI*(y+.55)/1.1),.6),a=rnd()*6.283;put([rad*Math.cos(a),y,rad*Math.sin(a)*.8],c2.map(x=>x*.35+.1),.026,0)}
 for(const side of[1,-1])for(let k=0;k<30;k++){const s=rnd();put([side*(.03+.28*s*s),.55+.5*s,0],c3,.018,0)}
 const g=new THREE.BufferGeometry();attr(g,'position',P,3);attr(g,'aCol',C,3);attr(g,'aScatter',Sc,3);attr(g,'aInfo',I,4);
 B.u={uAp:{value:0},uPh:{value:i*1.7},uSp:{value:11+i*.8}};
 B.mesh=mk(g,HDR+`attribute vec3 aCol,aScatter;attribute vec4 aInfo;uniform float uAp,uPh,uSp;varying vec3 vC;varying float vA;
 void main(){float ap=smoothstep(0.,1.,uAp);float fl=mix(1.4,.3+.75*sin(uTime*uSp+uPh-(aInfo.z>1.5?.5:0.)),smoothstep(.3,.9,uAp));
  vec3 q=position;if(aInfo.z>.5){float ax=abs(q.x);q.z=ax*sin(fl)+ax*ax*.12;q.x=sign(q.x)*ax*cos(fl);}
  q=mix(aScatter,q,ap);vec4 mv=modelViewMatrix*vec4(q,1.);gl_Position=projectionMatrix*mv;
  gl_PointSize=max(1.,aInfo.x*.62*uScale/-mv.z*1.6);vC=aCol;vA=clamp(uAp*3.,0.,1.);}`,BSOFT,{transparent:true,depthWrite:false},B.u);
 B.mesh.matrixAutoUpdate=false;B.pos=new THREE.Vector3();B.prev=new THREE.Vector3();B.col=[c1,c2,c3];
});
let AX=1;
const bpath=(B,i,t,out)=>{const p=B.p;const a=[B.c[0]+B.a[0]*AX*Math.sin(B.f[0]*t+p),B.c[1]+B.a[1]*Math.sin(B.f[1]*t+p*1.3),B.c[2]+B.a[2]*Math.cos(B.f[2]*t+p*.7)];
 const ang=t*1.1+i*1.25,r=1.9+.15*i,k=S.circle;return out.set(lerp(a[0],Math.cos(ang)*r,k),lerp(a[1],CY+Math.sin(ang*.7)*.5,k),lerp(a[2],Math.sin(ang)*r*.6,k))};

/* ---------- TRAILS ---------- */
const T=3000,tp=new Float32Array(T*3),tb=new Float32Array(T).fill(-99),tc=new Float32Array(T*3),ts=new Float32Array(T),td=new Float32Array(T);let ti=0;
const tg=new THREE.BufferGeometry();
const tA={position:new THREE.BufferAttribute(tp,3),aBirth:new THREE.BufferAttribute(tb,1),aCol:new THREE.BufferAttribute(tc,3),aSz:new THREE.BufferAttribute(ts,1),aSd:new THREE.BufferAttribute(td,1)};
for(const k in tA){tA[k].setUsage(THREE.DynamicDrawUsage);tg.setAttribute(k,tA[k])}
mk(tg,HDR+`attribute float aBirth,aSz,aSd;attribute vec3 aCol;varying vec3 vC;varying float vA;
void main(){float age=uTime-aBirth;float sp=aSz>.045?1.:0.;float k=clamp(age/mix(1.7,2.4,sp),0.,1.);
 vec3 p=position+vec3(sin(aSd*50.),cos(aSd*40.)+.3,sin(aSd*30.))*.12*age;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 float s=aSz*(1.-k)*mix(1.,.6+.8*abs(sin(uTime*14.+aSd*50.)),sp);if(age<0.||k>=1.)s=0.;gl_PointSize=s*uScale/-mv.z;vC=aCol;vA=pow(1.-k,1.4)*.7;}`,SOFT,ADD);
let now=0;
const emit=(p,c,s)=>{const i=ti++%T;tp[i*3]=p.x;tp[i*3+1]=p.y;tp[i*3+2]=p.z;tb[i]=now;tc.set(c,i*3);ts[i]=s;td[i]=rnd()};
const burst=()=>{for(let i=0;i<130;i++){const c=[[1,.8,.3],[1,.3,.5],[1,.1,.2]][i%3],a=rnd()*6.283,r=rnd()*.9;emit(new THREE.Vector3(Math.cos(a)*r,CY+(rnd()-.4)*1.2,Math.sin(a)*r),c,i%4?.03:.06)}};

/* ---------- FALLING PETALS ---------- */
{const L=[],P=[],Qa=[],C=[],NP=26,per=Math.floor(150*Q*1.5);
 for(let i=0;i<NP;i++){const x0=rnd()*10,y0=rnd()*7.4,sc=.55+rnd()*.9,sp=.3+rnd()*.7,ph=rnd()*6.283,spin=.4+rnd()*1.2,z=-2.5+rnd()*5.2,sh=.45+.55*(z+2.5)/5.2,cc=[[.9,.05,.2],[1,.35,.5],[.75,.03,.25]][i%3];
  for(let k=0;k<per;k++){const u=Math.pow(rnd(),.8),v=rnd()*2-1,w=.2*Math.pow(Math.sin(Math.PI*clamp(u*.9+.05)),.55)*(.4+.6*Math.min(1,u*3)),x=v*w,e=rnd()<.2;
   L.push(x,u*.3-.15,-.8*x*x+.05*u*u);P.push(x0,y0,sc,sp);Qa.push(ph,spin,z,sh);const b=e?1.3:.8+rnd()*.3;C.push(cc[0]*b,cc[1]*b,cc[2]*b)}}
 const g=new THREE.BufferGeometry();attr(g,'position',L,3);attr(g,'aP',P,4);attr(g,'aQ',Qa,4);attr(g,'aCol',C,3);
 mk(g,HDR+`attribute vec4 aP,aQ;attribute vec3 aCol;uniform float uPetals,uGust;uniform vec2 uV;varying vec3 vC;
 mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,s,0,-s,c);}mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0,-s,0,1,0,s,0,c);}mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0,-s,c,0,0,0,1);}
 void main(){float t=uTime;vec3 c;float W=uV.x*1.15,Hh=uV.y*1.1;c.x=mod(aP.x*.2*W+sin(t*.35+aQ.x)*.7+t*.18*(.5+aP.w)+W,2.*W)-W;c.y=Hh-mod(aP.y/7.4*2.*Hh+t*aP.w*.32,2.*Hh)+uGust*aP.w*2.5;c.z=aQ.z;
  vec3 l=rz(aQ.x*6.)*ry(t*aQ.y)*rx(t*aQ.y*.7+aQ.x)*(position*aP.z);vec4 mv=modelViewMatrix*vec4(c+l,1.);gl_Position=projectionMatrix*mv;
  gl_PointSize=max(1.,.022*uScale/-mv.z);vC=aCol*aQ.w*(1.+.9*pow(max(0.,sin(t*2.+aQ.x*9.)),10.))*uPetals;}`,DISC,{},{uPetals:U.uPetals,uGust:U.uGust,uV:U.uV})}

/* ---------- RAIN, DUST/ORBIT, SEED GLOW, HEART ---------- */

{const a=[],k=[],nd=Math.floor(500*Q),no=Math.floor(260*Q+60);
 for(let i=0;i<nd;i++){a.push(-7+rnd()*14,rnd()*5-2.5,-3.5+rnd()*5,rnd());k.push(0)}
 for(let i=0;i<no;i++){a.push(.9+rnd()*1.6,rnd()*6.283,rnd()*2.4-1.1,rnd());k.push(1)}
 const g=new THREE.BufferGeometry();attr(g,'position',new Array(k.length*3).fill(0),3);attr(g,'aA',a,4);attr(g,'aB',k,1);
 mk(g,HDR+`attribute vec4 aA;attribute float aB;uniform float uDust,uOrbit,uGather;uniform vec3 uMouse;uniform vec2 uV;varying vec3 vC;varying float vA;
 void main(){float sd=aA.w;vec3 p;float al;
  if(aB>.5){float an=aA.y+uTime*(.35+sd*.4);float r=aA.x*(1.-uGather*.35);p=vec3(cos(an)*r,C.y+aA.z+sin(uTime+sd*9.)*.2,sin(an)*r*.7);vC=vec3(1.,.8,.3);al=uOrbit;}
  else{float W=uV.x*1.1,Hh=uV.y*1.1;p=vec3(aA.x/7.*W+sin(uTime*.2+sd*30.)*.4,mod((aA.z/5.+.5)*2.*Hh+uTime*.05*(sd+.2),2.*Hh)-Hh,aA.y);vec2 dm=p.xy-uMouse.xy;p.xy+=normalize(dm+1e-4)*smoothstep(1.3,0.,length(dm))*.5*(sd>.5?-1.:1.);vC=mix(vec3(1.,.2,.3),vec3(1.,.8,.3),sd);al=uDust*.5;}
  vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(aB>.5?.04:.03)*(.6+.8*fract(sd*7.))*uScale/-mv.z;vA=al;}`,SOFT,ADD,{uDust:U.uDust,uOrbit:U.uOrbit,uGather:U.uGather,uMouse:U.uMouse,uV:U.uV})}
const glow=mk(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([0,CY,0],3)),HDR+`uniform float uA;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(.35+.08*sin(uTime*6.))*uScale/-mv.z;vA=uA;}`,
 `varying float vA;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=pow(1.-r,2.);gl_FragColor=vec4(1.,.25,.25,a*vA);}`,ADD,{uA:{value:0}});
{const a=[],s=[],m=[],HN=Math.floor(2400*Q+400),sc=.12;
 for(let i=0;i<HN;i++){const t=rnd()*6.283,k=rnd()<.35?1:Math.sqrt(rnd()),hx=16*Math.pow(Math.sin(t),3),hy=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
  a.push(hx*k*sc,CY+.4+(hy*k+2.5)*sc,-.9+(rnd()-.5)*.3);s.push(...scat());m.push(.025+rnd()*.02,rnd(),0)}
 for(let i=0;i<Math.floor(300*Q+60);i++){a.push(0,0,0);s.push(...scat());m.push(.03,rnd(),1)}
 const g=new THREE.BufferGeometry();attr(g,'position',a,3);attr(g,'aS',s,3);attr(g,'aM',m,3);
 mk(g,HDR+`attribute vec3 aS,aM;uniform float uHeart;varying vec3 vC;varying float vA;
 void main(){float p=smoothstep(0.,1.,uHeart);float pl=1.+.07*sin(uTime*4.5)*p;vec3 H=vec3(0.,C.y+.4,-.9);vec3 f=H+(position-H)*pl;
  if(aM.z>.5){float an=aM.y*6.283+uTime*(.8+aM.y);float r=2.3+aM.y*.9;f=H+vec3(cos(an)*r,sin(an)*r*.8,sin(an*1.7)*.3);}
  vec3 pos=mix(aS,f,p);vec4 mv=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aM.x*uScale/-mv.z;
  vC=mix(vec3(1.,.08,.2),vec3(1.,.75,.25),aM.z>.5?1.:smoothstep(.6,1.,aM.y));vA=p*.9;}`,SOFT,ADD,{uHeart:U.uHeart})}

/* ---------- INTERACTION ---------- */
const ray=new THREE.Ray(),sph=new THREE.Sphere(new THREE.Vector3(0,CY,0),1.5),nd=new THREE.Vector3(),hit=new THREE.Vector3();
const toRay=e=>{const r=$('c').getBoundingClientRect();nd.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1,.5).unproject(camera).sub(camera.position).normalize();ray.set(camera.position,nd);return[((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1]};
const mouse={x:0,y:0,tx:0,ty:0};
const move=e=>{const [x,y]=toRay(e);mouse.tx=x;mouse.ty=y;const k=-camera.position.z/nd.z;U.uMouse.value.set(camera.position.x+nd.x*k,camera.position.y+nd.y*k,0)};
$('c').addEventListener('pointermove',move);$('c').addEventListener('pointerleave',()=>{U.uMouse.value.set(99,99,0);mouse.tx=mouse.ty=0});
const clicks=[];
$('c').addEventListener('pointerdown',e=>{move(e);if(S.t<8||!ray.intersectsSphere(sph))return;const n=performance.now();clicks.push(n);while(clicks[0]<n-1800)clicks.shift();
 burst();U.uGust.value=1;tw(U.uGust,'value',0,2.5);
 if(clicks.length>=3&&!S.heart){clicks.length=0;S.heart=true;tw(U.uHeart,'value',1,1.6);later(5600,()=>tw(U.uHeart,'value',0,1.4,()=>S.heart=false))}});

const el={wish:$('wish'),wa:$('wa'),re:$('replay'),veil:$('veil')};
const on=(e,v)=>e.classList.toggle('show',v);
const openWA=()=>{if(S.opened)return;S.opened=true;const w=window.open(WA,'_blank');if(w)w.opener=null};
el.wa.addEventListener('click',()=>{S.opened=true});
el.wish.addEventListener('click',()=>{if(S.mode!=='idle')return;S.mode='wish';on(el.wish,false);on(el.re,false);el.veil.classList.add('on');
 tw(U.uBright,'value',1.45,1.4);tw(S,'circle',1,1.6);tw(U.uGather,'value',1,2.2);burst();
 later(2600,()=>tw(U.uDis,'value',1,3.4));later(6900,()=>tw(U.uDis,'value',0,4.8));
 later(11800,()=>{el.veil.classList.remove('on');tw(U.uBright,'value',1,2);tw(S,'circle',0,2.5);tw(U.uGather,'value',0,2.5)});
 later(13800,()=>{S.mode='done';on(el.wa,true);on(el.re,true)});later(16500,openWA)});
el.re.addEventListener('click',()=>{timers.forEach(clearTimeout);timers.length=0;tweens.length=0;
 Object.assign(S,{mode:'intro',circle:0,heart:false,opened:false});['uDis','uBright','uHeart','uGather','uGust'].forEach(k=>U[k].value=k==='uBright'?1:0);
 tb.fill(-99);el.veil.classList.remove('on');[el.wish,el.wa,el.re].forEach(e=>on(e,false));t0=performance.now()});

/* ---------- RESIZE / LOOP ---------- */
const th=Math.tan(22.5*Math.PI/180);
function resize(){const st=$('stage'),w=st.clientWidth,h=st.clientHeight;renderer.setPixelRatio(pr);composer.setPixelRatio(pr);renderer.setSize(w,h,false);composer.setSize(w,h);
 camera.aspect=w/h;camera.position.z=Math.max(7.4,2.1/(th*camera.aspect));AX=clamp(camera.aspect/1.1,.55,1.7);U.uV.value.set(camera.position.z*th*camera.aspect,camera.position.z*th);camera.updateProjectionMatrix();U.uScale.value=h*pr/(2*th)}
addEventListener('resize',resize);new ResizeObserver(resize).observe($('stage'));resize();
let t0=performance.now(),last=t0,raf,slow=0,fr=0;
const f1=new THREE.Vector3(),f2=new THREE.Vector3(),nn=new THREE.Vector3(),rt=new THREE.Vector3(),bm=new THREE.Matrix4(),rm=new THREE.Matrix4();
function loop(ts){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(ts-last)/1000);last=ts;if(document.hidden)return;
 now=ts/1000;U.uTime.value=now;const t=S.t=(ts-t0)/1000;
 for(let i=tweens.length-1;i>=0;i--){const w=tweens[i];if(w.from===null)w.from=w.o[w.k];w.t+=dt;const u=clamp(w.t/w.dur);w.o[w.k]=lerp(w.from,w.to,ease(u));if(u>=1){tweens.splice(i,1);w.cb&&w.cb()}}
 U.uEmerge.value=clamp(t/2.2);U.uForm.value=clamp((t-2)/3);U.uForm2.value=clamp((t-5)/3.6);U.uBloom.value=clamp((t-4.6)/4.4);
 U.uRain.value=t<2?t/2:Math.max(.3,1-(t-2)*.12);U.uDust.value=clamp(t/2);U.uOrbit.value=clamp((t-12)/3)*(1+S.circle*.6);U.uPetals.value=clamp((t-12)/2);
 glow.material.uniforms.uA.value=Math.min(t,1)*(1-clamp((t-3.5)/1.3));
 if(S.mode==='intro'||S.mode==='idle'){on(el.wish,t>13);if(t>13)S.mode='idle'}
 BF.forEach((B,i)=>{const ap=clamp((t-(9+i*.55))/1.6);B.u.uAp.value=ap;if(ap<=0)return;const bt=now;
  bpath(B,i,bt,B.pos);bpath(B,i,bt+.05,f2);bpath(B,i,bt-.05,f1);f2.sub(f1).normalize();
  nn.set(0,.35,1);nn.addScaledVector(f2,-nn.dot(f2)).normalize();rt.crossVectors(f2,nn);
  bm.makeBasis(rt,f2,nn);rm.makeRotationAxis(f2,.45*Math.sin(bt*.9+i));bm.premultiply(rm);bm.scale(new THREE.Vector3(.62,.62,.62));bm.setPosition(B.pos);
  B.mesh.matrix.copy(bm);B.mesh.matrixWorldNeedsUpdate=true;
  if(ap>.6){const c=i%5;for(let k=0;k<2;k++){const p=f1.copy(B.prev).lerp(B.pos,k/2);emit(p,B.col[rnd()<.5?0:1],.034);}
   if(rnd()<.08)emit(B.pos,B.col[2],.06)}B.prev.copy(B.pos)});
 Object.values(tA).forEach(a=>a.needsUpdate=true);
 mouse.x+=(mouse.tx-mouse.x)*.05;mouse.y+=(mouse.ty-mouse.y)*.05;camera.position.x=mouse.x*.5;camera.position.y=-.05+mouse.y*.3;camera.lookAt(0,-.05,0);
 composer.render();
 if(t>3&&t<6){fr++;if(dt>.026)slow++;if(fr>120){if(slow>fr*.5&&pr>1){pr=Math.max(1,pr-.5);resize()}fr=-9999}}}
raf=requestAnimationFrame(loop);
addEventListener('pagehide',()=>{cancelAnimationFrame(raf);disposables.forEach(d=>d.dispose());composer.dispose();renderer.dispose()});
}