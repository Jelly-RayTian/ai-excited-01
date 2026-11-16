// Oceanfall: original deterministic raster illustration. Node standard library only.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
const W=1024, S=2, N=W*S;
const pix=new Uint8Array(N*N*3);
type P=[number,number];
type C=[number,number,number];
let seed=738192;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function blend(x:number,y:number,c:C,a=1){if(x<0||y<0||x>=N||y>=N)return;const i=(y*N+x)*3;for(let k=0;k<3;k++)pix[i+k]=Math.round(pix[i+k]*(1-a)+c[k]*a);}
for(let y=0;y<N;y++)for(let x=0;x<N;x++){
 const u=x/S,v=y/S, g=Math.exp(-((u-400)**2+(v-610)**2)/180000),h=Math.exp(-((u-790)**2+(v-250)**2)/90000);
 const i=(y*N+x)*3;pix[i]=5+15*g+10*h;pix[i+1]=7+12*g+7*h;pix[i+2]=22+34*g+24*h;
}
function disk(x:number,y:number,r:number,c:C,a=1){x*=S;y*=S;r*=S;for(let j=Math.max(0,Math.floor(y-r));j<=Math.min(N-1,y+r);j++)for(let i=Math.max(0,Math.floor(x-r));i<=Math.min(N-1,x+r);i++){const d=Math.hypot(i-x,j-y);if(d<r)blend(i,j,c,a*Math.min(1,r-d));}}
function glow(x:number,y:number,r:number,c:C,a:number){for(let k=12;k>0;k--)disk(x,y,r*k/12,c,a*(1-k/13)/12);}
function poly(p:P[],c:C,a=1){const pts=p.map(([x,y])=>[x*S,y*S]);let lo=Math.max(0,Math.floor(Math.min(...pts.map(p=>p[1])))),hi=Math.min(N-1,Math.ceil(Math.max(...pts.map(p=>p[1]))));for(let y=lo;y<=hi;y++){const hits:number[]=[];for(let i=0,j=pts.length-1;i<pts.length;j=i++){const A=pts[j],B=pts[i];if((A[1]>y)!=(B[1]>y))hits.push(A[0]+(y-A[1])*(B[0]-A[0])/(B[1]-A[1]));}hits.sort((a,b)=>a-b);for(let k=0;k<hits.length;k+=2)for(let x=Math.max(0,Math.ceil(hits[k]));x<Math.min(N,hits[k+1]);x++)blend(x,y,c,a);}}
function line(p:P[],width:number,c:C,a=1){for(let i=1;i<p.length;i++){const [x,y]=p[i-1],[xx,yy]=p[i];const d=Math.hypot(xx-x,yy-y),n=Math.ceil(d*S);for(let k=0;k<=n;k++)disk(x+(xx-x)*k/n,y+(yy-y)*k/n,width/2,c,a);}}
function curve(start:P,segments:number[][]):P[]{const p:P[]=[start];let [x,y]=start;for(const v of segments){for(let i=1;i<=32;i++){const t=i/32,s=1-t;p.push([s*s*s*x+3*s*s*t*v[0]+3*s*t*t*v[2]+t*t*t*v[4],s*s*s*y+3*s*s*t*v[1]+3*s*t*t*v[3]+t*t*t*v[5]]);}x=v[4];y=v[5];}return p;}
function ellipse(cx:number,cy:number,rx:number,ry:number,rot:number,start=0,end=Math.PI*2):P[]{const p:P[]=[];for(let i=0;i<=240;i++){const t=start+(end-start)*i/240,x=rx*Math.cos(t),y=ry*Math.sin(t);p.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return p;}
// Sparse stars leave generous negative space around the silhouette.
for(let i=0;i<420;i++){const x=rand()*1024,y=rand()*1024,r=rand();disk(x,y,r>.97?1.8:.45+rand()*.6,[105+rand()*100,145+rand()*85,220],.3+rand()*.6);}
for(const [x,y] of [[143,172],[869,119],[949,587],[555,106]]){glow(x,y,25,[73,183,255],.5);line([[x-6,y],[x+6,y]],1,[193,243,255]);line([[x,y-6],[x,y+6]],1,[193,243,255]);}
// Distant moon, and orbital streaks following the launch direction.
disk(151,263,35,[52,56,90]);disk(141,255,32,[16,22,47]);
for(let i=0;i<22;i++){let x=rand()*850,y=480+rand()*520;line([[x,y],[x+30+rand()*90,y-20-rand()*65]],.7,[56,109,154],.25);}
glow(351,760,310,[255,86,56],1.5);
const ring=ellipse(359,773,306,104,-.4);
line(ring,34,[90,28,61]);line(ring,14,[255,72,71]);line(ring,4,[255,191,112]);
// Ocean planet is an ink-blue globe with sharp illuminated crescents.
disk(339,877,224,[8,38,66]);
for(let i=0;i<10;i++)line(ellipse(339,877,222-i*3,222-i*3,0,3.45,5.9),2,[17,116-i*5,151-i*5]);
for(let j=0;j<13;j++){const y=772+j*18;const p: P[]=[];for(let x=190;x<510;x+=5){const yy=y+Math.sin(x/44+j)*7;if(Math.hypot(x-339,yy-877)<207)p.push([x,yy]);}if(p.length>1)line(p,1.3,[24,94,118],.55);}
// Huge curling ribbons of water connect the world to the animal.
for(let j=0;j<12;j++){const p=curve([190+j*16,870+j*3],[[140+j*13,730,490+j*8,668,446+j*9,572]]);line(p,14-j*.6,[10,71+j*7,111+j*8],.8);line(p,2,[65,203,230],.7);}
// Whale silhouette: tail at lower left, round head thrown toward upper right.
const body=curve([330,657],[[366,585,404,528,472,465],[537,402,614,330,718,283],[801,247,901,251,925,299],[950,345,903,397,833,415],[743,439,660,477,588,537],[500,614,446,670,393,690],[372,708,343,696,330,657]]);
glow(714,361,205,[0,178,236],.3);
poly(body,[21,157,190]);
const belly=curve([365,671],[[474,611,517,515,653,441],[746,386,867,391,927,316],[947,361,893,405,819,421],[660,459,565,570,441,678],[402,708,379,703,365,671]]);poly(belly,[132,239,233]);
const top=curve([349,636],[[490,458,648,306,767,285],[831,270,884,278,901,292],[770,281,668,369,566,452],[471,532,405,624,349,636]]);poly(top,[37,204,224]);
line(body.slice(0,110),3,[101,247,255]);
// Sculptural tail flukes and a sweeping foreground pectoral fin.
const tail=curve([369,666],[[312,628,275,593,220,595],[230,638,254,676,309,687],[252,716,216,755,211,798],[285,795,345,752,387,691]]);poly(tail,[20,161,190]);line(tail.slice(0,65),3,[98,238,244]);
// Ventral pleats follow the chin, never crossing the eye.
for(let k=0;k<7;k++)line(curve([894-k*12,387+k*3],[[823-k*9,424+k*6,695-k*7,443+k*10,601-k*6,525+k*7]]),1.4,[31,148,173],.7);
const fin=curve([652,449],[[673,486,673,574,578,648],[564,652,556,649,563,635],[599,564,586,526,581,504],[599,477,623,459,652,449]]);poly(fin,[5,67,110]);line(fin.slice(0,65),4,[55,205,230]);
const dorsal=curve([544,406],[[515,398,510,369,514,341],[542,351,566,369,583,376]]);poly(dorsal,[33,197,216]);
line(curve([925,326],[[918,359,872,372,825,375]]),2.5,[7,70,100]);
glow(856,321,18,[255,211,105],.8);disk(856,321,5,[4,31,55]);disk(857,320,2,[255,229,147]);
// Bioluminescent flecks taper toward the tail.
for(let i=0;i<105;i++){const t=rand(),x=420+t*355,y=585-t*280+(rand()-.5)*34;disk(x,y,.7+rand()*1.8,[144,255,243],.6);}
// Tiny boat: an impossible passenger, legible as a single gold sail.
const boat: P[]=[[648,311],[682,300],[676,314],[659,319]];poly(boat,[255,177,70]);
line([[666,307],[650,251]],2,[255,225,156]);poly([[650,252],[659,300],[625,309]],[255,242,184]);poly([[655,257],[664,298],[681,292]],[255,169,68]);
glow(651,290,65,[255,176,61],.7);
// Droplets suspended at the moment of escape.
for(let i=0;i<125;i++){const a=rand()*Math.PI*2,r=rand();const x=362+Math.cos(a)*(160+r*150),y=695+Math.sin(a)*(70+r*90);if(x>550&&y<680)continue;line([[x,y],[x+3+rand()*4,y-6-rand()*11]],1+rand()*2,[91,229,245],.7);}
for(let j=0;j<5;j++){
 const arc=curve([115+j*22,708-j*15],[[120+j*22,622-j*19,200+j*27,549-j*17,291+j*30,519-j*20]]);
 line(arc,1.8,[52,175,213],.55);
 const end=arc[arc.length-1];disk(end[0],end[1],2.5,[167,250,255],.9);
}
// Foreground ring closes across the ocean, behind the escaping tail.
const front=ellipse(359,773,306,104,-.4,0,Math.PI);line(front,14,[250,74,72]);line(front,4,[255,198,125]);
// Encode a complete RGB PNG. Sub filter improves compression of smooth fields.
const raw=Buffer.alloc((W*3+1)*W);let sum=[0,0,0],bright=0;
for(let y=0;y<W;y++){const row=y*(W*3+1);raw[row]=1;let prev=[0,0,0];for(let x=0;x<W;x++)for(let c=0;c<3;c++){let v=0;for(let dy=0;dy<S;dy++)for(let dx=0;dx<S;dx++)v+=pix[(((y*S+dy)*N+x*S+dx)*3)+c];v=Math.round(v/(S*S));sum[c]+=v;if(c===0&&v>180)bright++;raw[row+1+x*3+c]=(v-prev[c]+256)&255;prev[c]=v;}}
function crc32(b:Buffer){let c=0xffffffff;for(const n of b){c^=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(name:string,b:Buffer){const t=Buffer.from(name),o=Buffer.alloc(b.length+12);o.writeUInt32BE(b.length);t.copy(o,4);b.copy(o,8);o.writeUInt32BE(crc32(Buffer.concat([t,b])),b.length+8);return o;}
const header=Buffer.alloc(13);header.writeUInt32BE(W);header.writeUInt32BE(W,4);header[8]=8;header[9]=2;
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
const out=process.env.MAKEFUN_OUTPUT_DIR??'/output';mkdirSync(out,{recursive:true});writeFileSync(join(out,'entry.png'),png);
console.log(JSON.stringify({bytes:png.length,width:W,height:W,meanRGB:sum.map(v=>+(v/W/W).toFixed(2)),warmBrightPixels:bright}));
