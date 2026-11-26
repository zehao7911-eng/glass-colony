// Pair-force kernel and damped velocity integration adapted from Hunar Ahmad,
// particle-life/particle_life_3d.html (MIT). Coordinates use terrarium units.
function swarmStep(atoms,goal,pull,dt){
 for(const a of atoms){let fx=0,fy=0,fz=0;
  for(const b of atoms){let dx=a.x-b.x,dy=a.y-b.y,dz=a.z-b.z,d=dx*dx+dy*dy+dz*dz;
   if(d>0&&d<.40){const g=d<.045?.042:a.kind===b.kind?-.005:-.002;const f=g/Math.sqrt(d);fx+=f*dx;fy+=f*dy;fz+=f*dz}}
  const target=pull?goal:a.home, force=pull?.055:.006;
  a.vx=.84*a.vx+fx+(target.x-a.x)*force;a.vy=.84*a.vy+fy+(target.y-a.y)*force;a.vz=.84*a.vz+fz+(target.z-a.z)*force;
 }for(const a of atoms){a.x+=a.vx*dt;a.y+=a.vy*dt;a.z+=a.vz*dt}
}
const $=id=>document.getElementById(id),names=['Honey Sail','Ribbon Ray','Coral Finch','Moon Jelly','Glass Moth','Aurora Crown'],colors=[0xffcb67,0x69e1ed,0xff977c,0xbca5ff,0xa1eb9b,0xffb9e6];
let profile={done:0,rewards:{}},key='glass-colony-v1';
function merge(value){profile.done=Math.max(profile.done,Math.max(0,Math.min(6,Number(value?.done)|0)));profile.rewards={...profile.rewards,...value?.rewards};try{localStorage.setItem(key,JSON.stringify(profile))}catch{}}
try{merge(JSON.parse(localStorage.getItem(key)))}catch{}
const sdk=bridge({read:()=>profile,write:merge,changed:()=>{$('tank').textContent='Tank · '+profile.done}});sdk.connect();addEventListener('pagehide',()=>sdk.stop(),{once:true});
const panel=document.querySelector('main'),scene=new THREE.Scene(),cam=new THREE.OrthographicCamera(-3,3,5,-5,.1,50),render=new THREE.WebGLRenderer({alpha:true,antialias:true});panel.prepend(render.domElement);render.setPixelRatio(Math.min(devicePixelRatio,2));cam.position.set(0,1.4,10);cam.lookAt(0,0,0);
scene.add(new THREE.HemisphereLight(0xd7fff8,0x415161,1.6));const sun=new THREE.DirectionalLight(0xffe6bc,1.8);sun.position.set(-4,5,6);scene.add(sun);
function mesh(geo,color,parent=scene){let m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.32,metalness:.19}));parent.add(m);return m}
const orb=new THREE.SphereGeometry(1,24,16),fin=new THREE.SphereGeometry(1,14,8);
function oval(parent,color,x,y,z,a,b,c){let m=mesh(fin,color,parent);m.position.set(x,y,z);m.scale.set(a,b,c);return m}
const display=new THREE.Group();scene.add(display);
function animal(index){let g=new THREE.Group(),c=colors[index];oval(g,c,0,0,0,.37,.22,.21);oval(g,0x1a3c42,.22,.055,.166,.048,.048,.033);oval(g,0xfffeed,.23,.068,.196,.014,.014,.012);
 for(let k of [-1,1]){let wing=oval(g,c,-.06,.02,k*.23,.33,.055,.31+index*.028);wing.rotation.z=.27;wing.userData.flap=k}
 for(let j=0;j<=index%3;j++){let tail=oval(g,c,-.43,.10-j*.09,0,.22,.064,.06);tail.rotation.z=(j-1)*.45}return g}
let glass=mesh(orb,0xd4ffee);glass.scale.set(2.4,2.65,1.65);glass.material.transparent=true;glass.material.opacity=.065;glass.material.depthWrite=false;
for(let y of [-2.04,2.04]){let rim=mesh(new THREE.TorusGeometry(1.53,.047,8,96),0xc9ad84);rim.rotation.x=Math.PI/2;rim.position.y=y}
let base=mesh(new THREE.CylinderGeometry(1.56,1.37,.28,64),0x477077);base.position.y=-2.18;
for(let n=0;n<19;n++){let a=n*2.4,r=.8+.5*Math.sin(n);let stem=oval(scene,n%2?0x3d9c90:0x72bba1,Math.cos(a)*r,-1.85,Math.sin(a)*r,.07,.28+(n%4)*.08,.05);stem.rotation.z=Math.sin(n)*.48}
let egg=mesh(orb,colors[0]);egg.scale.set(.39,.54,.39);
let particles=new THREE.InstancedMesh(fin,new THREE.MeshStandardMaterial({roughness:.32}),84);scene.add(particles);
let atoms=[],dummy=new THREE.Object3D(),goal=new THREE.Vector3(),level,phase,holding,charge,step,low,high,time=0,prev=0,started=false,critters=[],context,prior;
function sound(f){try{context??=new AudioContext();context.resume();let o=context.createOscillator(),g=context.createGain();o.frequency.setValueAtTime(f,context.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.4,context.currentTime+.18);g.gain.setValueAtTime(.065,context.currentTime);g.gain.exponentialRampToValueAtTime(.001,context.currentTime+.42);o.connect(g);g.connect(context.destination);o.start();o.stop(context.currentTime+.43)}catch{}}
function band(){low=.38+.10*((level+step)%4);high=low+.30-level*.018;$('zone').style.left=low*100+'%';$('zone').style.width=(high-low)*100+'%'}
function clearAnimals(){for(let g of critters){display.remove(g);g.traverse(o=>o.material?.dispose())}critters=[]}
function load(n){clearAnimals();level=n;phase='play';started=holding=false;step=charge=0;sdk.prepare();egg.visible=true;egg.material.color.setHex(colors[n]);particles.visible=true;band();$('rail').hidden=false;$('serial').textContent='GLASS COLONY  /  '+(n+1)+' OF 6';$('title').textContent=names[n];$('act').textContent='Gather';$('tank').textContent='Tank · '+profile.done;$('hint').textContent='Hold to gather. Release in the green band.';
 atoms=Array.from({length:84},(_,i)=>{let y=1-2*i/84,a=i*2.4,r=Math.sqrt(1-y*y);let home={x:1.85*r*Math.cos(a),y:y*1.68,z:r*Math.sin(a)};particles.setColorAt(i,new THREE.Color(i%3?colors[n]:0xb1f8f4));return {...home,home,kind:i%3,vx:0,vy:0,vz:0}});particles.instanceColor.needsUpdate=true}
function hatch(){phase='won';egg.visible=false;let g=animal(level);display.add(g);critters.push(g);merge({done:level+1});sdk.end();sdk.save();$('tank').textContent='Tank · '+profile.done;$('rail').hidden=true;$('hint').textContent=names[level]+' hatched and joined your tank.';$('act').textContent=level===5?'Visit tank':'Next egg';sound(740)}
function down(){if(phase!=='play'||holding)return;if(!started){sdk.start();started=true}holding=true;charge=0;sound(240)}
function release(){if(!holding)return;holding=false;if(charge>=low&&charge<=high){step++;sound(420+step*80);if(step>=1+Math.floor(level/2)){hatch();return}band();$('hint').textContent='Shell layer sealed. Gather the next swarm.'}else{$('hint').textContent=charge<low?'A little longer. Let the swarm gather.':'Too dense. Release earlier.'}charge=0}
for(const el of [render.domElement,$('act')]){el.onpointerdown=e=>{if(phase!=='play')return;el.setPointerCapture(e.pointerId);down()};el.onpointerup=release;el.onpointercancel=()=>{holding=false;charge=0}}
function tank(){if(phase==='tank')return;prior=phase;phase='tank';holding=false;charge=0;clearAnimals();egg.visible=particles.visible=false;
 for(let i=0;i<profile.done;i++){let g=animal(i);display.add(g);critters.push(g)}$('title').textContent='Living collection';$('serial').textContent='GLASS COLONY';$('hint').textContent=profile.done+' of 6 species hatched';$('act').textContent='Back to eggs';$('rail').hidden=true}
$('tank').onclick=tank;$('act').onclick=e=>{if(phase==='tank'){if(prior==='play'){clearAnimals();egg.visible=particles.visible=true;phase='play';$('title').textContent=names[level];$('rail').hidden=false;$('act').textContent='Gather';$('hint').textContent='Hold and release in the green band.'}else load((level+1)%6)}else if(phase==='won'&&!justWon){level===5?tank():load(level+1)}};
let justWon=false;const physicalRelease=()=>{let old=phase;release();if(old==='play'&&phase==='won'){justWon=true;setTimeout(()=>justWon=false,400)}};
for(const el of [render.domElement,$('act')])el.onpointerup=physicalRelease;
function resize(){let ratio=panel.clientWidth/panel.clientHeight;let half=Math.max(3.6,2.68/ratio);cam.top=half;cam.bottom=-half;cam.left=-half*ratio;cam.right=half*ratio;cam.updateProjectionMatrix();render.setSize(panel.clientWidth,panel.clientHeight,false)}new ResizeObserver(resize).observe(panel);resize();load(Math.min(5,profile.done));
function frame(t){requestAnimationFrame(frame);let dt=Math.min(.04,(t-prev)/1000);prev=t;time+=dt;if(holding)charge=Math.min(1,charge+dt*.56);$('dot').style.left=charge*100+'%';
 if(phase!=='tank'){goal.set(.19*Math.sin(time*2),.07*Math.cos(time),0);swarmStep(atoms,goal,holding,dt*35);for(let i=0;i<atoms.length;i++){let a=atoms[i];dummy.position.set(a.x,a.y+.04*Math.sin(time*2+i),a.z);dummy.scale.setScalar(.035+(i%5)*.006);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix)}particles.instanceMatrix.needsUpdate=true;egg.scale.set(.39+charge*.09,.54-charge*.05,.39+charge*.09);egg.rotation.z=.08*Math.sin(time*2)}
 critters.forEach((g,i)=>{let a=time*.65+i*2.4;g.position.set(Math.sin(a)*(phase==='tank'?1.23:.65),Math.cos(a*.8+i)*(phase==='tank'?1.1:.31),Math.cos(a)*.45);g.rotation.y=-a;g.children.forEach(o=>{if(o.userData.flap)o.rotation.x=o.userData.flap*Math.sin(time*5)*.48})});render.render(scene,cam)}requestAnimationFrame(frame)
