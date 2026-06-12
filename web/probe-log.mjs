import { spawn } from "node:child_process";
import WebSocket from "ws";
const url = process.env.PROBE_URL ?? "http://localhost:3000/log";
const proc = spawn("/usr/bin/google-chrome", ["--headless=new","--disable-gpu","--no-sandbox","--no-first-run","--remote-debugging-port=9224","--user-data-dir=/tmp/cprofile4","--window-size=1400,900","about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2000);
const targets = await (await fetch("http://localhost:9224/json")).json();
const t = targets.find((x) => x.type === "page");
const ws = new WebSocket(t.webSocketDebuggerUrl, { perMessageDeflate: false });
let id=0; const pending=new Map(); const events=[];
const send=(m,p={})=>new Promise((res)=>{const i=++id;pending.set(i,res);ws.send(JSON.stringify({id:i,method:m,params:p}));});
ws.on("message",(d)=>{const m=JSON.parse(d);
  if(m.id&&pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id);return;}
  if(m.method==="Log.entryAdded")events.push(["log",m.params.entry.level,m.params.entry.text]);
  if(m.method==="Runtime.consoleAPICalled")events.push(["console",m.params.type,m.params.args.map(a=>a.value??a.description).join(" ")]);
  if(m.method==="Runtime.exceptionThrown")events.push(["exception",m.params.exceptionDetails.text,m.params.exceptionDetails.exception?.description]);
  if(m.method==="Fetch.requestPaused"){
    const req=m.params; const u=req.request.url;
    const reply=(body)=>send("Fetch.fulfillRequest",{requestId:req.requestId,responseCode:200,
      responseHeaders:[{name:"Content-Type",value:"application/json"}],
      body:Buffer.from(JSON.stringify(body)).toString("base64")});
    if(u.endsWith("/api/me")) reply({id:1,email:"probe@test.dev"});
    else if(u.endsWith("/api/categories")) reply([{id:1,name:"Park"},{id:2,name:"Cafe"}]);
    else send("Fetch.continueRequest",{requestId:req.requestId});
  }
});
await new Promise((r)=>ws.on("open",r));
await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
await send("Fetch.enable",{patterns:[{urlPattern:"*/api/*"}]});
await send("Page.navigate",{url}); await sleep(6000);
const evalJs=async(e)=>(await send("Runtime.evaluate",{expression:e,returnByValue:true})).result?.value;
console.log("REPORT", JSON.stringify(await evalJs(`(()=>{
  const main=document.querySelector('main');
  const panel=document.querySelector('section:last-of-type');
  const c=document.querySelector('.leaflet-container');
  const tiles=[...document.querySelectorAll('img.leaflet-tile')];
  const r=(el)=>el?Math.round(el.getBoundingClientRect().width)+'x'+Math.round(el.getBoundingClientRect().height):'none';
  return {urlNow:location.pathname, bodyText:document.body.innerText.slice(0,200),
    mainPresent:!!main, panelRect:r(panel),
    leafletContainerRect:r(c), tiles:tiles.length,
    tilesLoaded:tiles.filter(t=>t.complete&&t.naturalWidth>0).length};
})()`),null,2));
console.log("EVENTS", JSON.stringify(events,null,1));
ws.close(); proc.kill();
