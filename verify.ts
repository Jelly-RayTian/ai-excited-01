// Independent structural check, inverse PNG filtering, and repeated-run comparison.
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const a=readFileSync('entry.png'),b=readFileSync('out/entry.png');
assert.deepEqual(a,b,'Two program runs must emit identical bytes');
assert(a.length<=1048576);
assert.equal(a.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
let offset=8,w=0,h=0;const chunks:string[]=[],payload:Buffer[]=[];
while(offset<a.length){
 const n=a.readUInt32BE(offset),type=a.toString('ascii',offset+4,offset+8);
 assert(offset+n+12<=a.length);const data=a.subarray(offset+8,offset+8+n);
 let crc=0xffffffff;
 for(const value of a.subarray(offset+4,offset+8+n)){
  crc^=value;for(let bit=0;bit<8;bit++)crc=(crc&1)?(crc>>>1)^0xedb88320:crc>>>1;
 }
 assert.equal((crc^0xffffffff)>>>0,a.readUInt32BE(offset+8+n),type+' CRC');
 if(type==='IHDR'){assert.equal(n,13);w=data.readUInt32BE(0);h=data.readUInt32BE(4);assert.deepEqual([...data.subarray(8)],[8,2,0,0,0]);}
 if(type==='IDAT')payload.push(data);
 if(type==='IEND'){assert.equal(n,0);assert.equal(offset+12,a.length);}
 chunks.push(type);offset+=n+12;
}
assert.deepEqual(chunks,['IHDR','IDAT','IEND']);assert(w>0&&w<=1024&&h>0&&h<=1024);
const raw=inflateSync(Buffer.concat(payload));assert.equal(raw.length,h*(w*3+1));
const sums=[0,0,0];let dark=0,warm=0;
for(let y=0;y<h;y++){
 const pos=y*(w*3+1);assert.equal(raw[pos],1);const left=[0,0,0];
 for(let x=0;x<w;x++){const rgb=[0,0,0];for(let c=0;c<3;c++){const v=(raw[pos+1+x*3+c]+left[c])&255;left[c]=v;rgb[c]=v;sums[c]+=v;}if(Math.max(...rgb)<80)dark++;if(rgb[0]>180)warm++;}
}
console.log(JSON.stringify({valid:true,bytes:a.length,dimensions:[w,h],chunks,allCRCsValid:true,decodedBytes:raw.length,byteIdentical:true,sha256:createHash('sha256').update(a).digest('hex'),meanRGB:sums.map(s=>+(s/w/h).toFixed(2)),darkPercent:+(dark/w/h*100).toFixed(2),warmBrightPercent:+(warm/w/h*100).toFixed(2)},null,2));
