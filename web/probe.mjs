import { spawn } from "node:child_process";
import WebSocket from "ws";
const url = "http://localhost:3000/maptest";
const proc = spawn("/usr/bin/google-chrome", ["--headless=new","--disable-gpu","--no-sandbox","--no-first-run","--remote-debugging-port=9223","--user-data-dir=/tmp/cprofile3","--window-size=1400,900","about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2000);
const targets = await (await fetch("http://localhost:9223/json")).json();
const t = targets.find((x) => x.type === "page");
const ws = new WebSocket(t.webSocketDebuggerUrl, { perMessageDeflate: false });
let id=0; const pending=new Map();
const send=(m,p={})=>new Promise((res)=>{const i=++id;pending.set(i,res);ws.send(JSON.stringify({id:i,method:m,params:p}));});
ws.on("message",(d)=>{const m=JSON.parse(d);if(m.id&&pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id);}});
await new Promise((r)=>ws.on("open",r));
await send("Page.enable"); await send("Page.navigate",{url}); await sleep(4000);
const evalJs=async(e)=>(await send("Runtime.evaluate",{expression:e,returnByValue:true})).result?.value;
console.log("REPORT", JSON.stringify(await evalJs(`(()=>{
  const panel=document.querySelector('section:last-child');
  const mapDiv=document.querySelector('[class*="map"]');
  const c=document.querySelector('.leaflet-container');
  const tiles=[...document.querySelectorAll('img.leaflet-tile')];
  const r=(el)=>el?el.getBoundingClientRect().width+'x'+el.getBoundingClientRect().height:'none';
  return {bodyDisplay:getComputedStyle(document.querySelector('main')).display,
    panelRect:r(panel), panelHeightCss:panel?getComputedStyle(panel).height:'',
    leafletContainerRect:r(c), tiles:tiles.length, tilesLoaded:tiles.filter(t=>t.complete&&t.naturalWidth>0).length};
})()`),null,2));
ws.close(); proc.kill();
