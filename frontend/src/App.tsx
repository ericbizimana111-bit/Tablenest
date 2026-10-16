import { useState, useEffect } from "react";
export default function App() {
  const [daysLeft,setDaysLeft]=useState(7);
  useEffect(()=>{
    const s=localStorage.getItem("tn_gold");
    if(!s){localStorage.setItem("tn_gold",Date.now().toString());return;}
    const left=7-Math.floor((Date.now()-parseInt(s))/86400000);
    setDaysLeft(left<=0?0:left);
  },[]);
  const tables=[
    {id:"T01",top:"8%",left:"8%",c:"#22c55e",n:"Cleaning • 4min"},
    {id:"T05",top:"8%",left:"38%",c:"#ef4444",n:"58m • $240"},
    {id:"T03",top:"8%",left:"68%",c:"#eab308",n:"Reserved • 20:00"},
    {id:"T08",top:"42%",left:"8%",c:"#ef4444",n:"Seated • 20:00"},
    {id:"T02",top:"42%",left:"38%",c:"#22c55e",n:"Available"},
    {id:"T06",top:"42%",left:"68%",c:"#22c55e",n:"Free"},
  ];
  return(
    <div style={{background:"#040300",color:"#fde68a",minHeight:"100vh",fontFamily:"system-ui"}}>
      <nav style={{display:"flex",justifyContent:"space-between",padding:"14px 18px",borderBottom:"1px solid #1f1605",position:"sticky",top:0,background:"#040300",zIndex:10}}>
        <div style={{fontWeight:900,fontSize:"20px",color:"#fbbf24"}}>🪺 TableNest GOLD</div>
        <div style={{fontSize:"10px",color:"#fbbf24",border:"1px solid #f59e0b",padding:"6px 10px",borderRadius:"20px",background:"rgba(245,158,11,0.1)"}}>⏳ {daysLeft}d Trial</div>
      </nav>
      <div style={{padding:"12px",display:"grid",gap:"12px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
          <div style={{background:"linear-gradient(180deg,#1a1205,#0e0a02)",border:"1px solid #2a1d05",borderRadius:"14px",padding:"14px"}}>
            <div style={{fontSize:"11px",color:"#a89172"}}>Revenue Today</div>
            <div style={{fontSize:"26px",fontWeight:900}}>$12,480</div>
            <div style={{fontSize:"10px",color:"#22c55e"}}>↑ 18% vs yesterday</div>
          </div>
          <div style={{background:"linear-gradient(180deg,#1a1205,#0e0a02)",border:"1px solid #2a1d05",borderRadius:"14px",padding:"14px"}}>
            <div style={{fontSize:"11px",color:"#a89172"}}>Occupancy</div>
            <div style={{fontSize:"26px",fontWeight:900}}>82%</div>
            <div style={{fontSize:"10px",color:"#a89172"}}>16 tables • LIVE</div>
          </div>
        </div>
        <div style={{background:"radial-gradient(600px circle at 50% 0%,#1a1205,#040300)",border:"1px solid #2a1d05",borderRadius:"16px",padding:"12px"}}>
          <div style={{fontSize:"11px",color:"#fbbf24",marginBottom:"10px"}}>● GOLD 3D FLOOR • LIVE • Pic 2 Design</div>
          <div style={{position:"relative",height:"320px",background:"#080501",borderRadius:"12px",border:"1px solid #1a1205"}}>
            {tables.map(t=>(
              <div key={t.id} style={{position:"absolute",top:t.top,left:t.left,width:"28%",transform:"rotateX(50deg) rotateZ(-35deg)"}}>
                <div style={{height:"60px",background:`linear-gradient(180deg,${t.c},#000)`,border:"1px solid #fbbf24",boxShadow:`0 0 18px ${t.c}90`,borderRadius:"6px",display:"grid",placeItems:"center",fontWeight:900,color:"white",fontSize:"13px"}}>{t.id}</div>
                <div style={{background:"rgba(0,0,0,0.8)",border:"1px solid #f59e0b",borderRadius:"6px",padding:"3px 5px",fontSize:"8px",color:"#fde68a",marginTop:"6px",textAlign:"center",transform:"rotateZ(35deg) rotateX(-50deg)"}}>{t.n}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"10px",display:"flex",gap:"8px",fontSize:"10px",justifyContent:"center",color:"#a89172"}}><span>🟢 Free</span><span>🔴 Busy</span><span>🟡 Reserved</span></div>
        </div>
        <div style={{background:"linear-gradient(180deg,#1a1205,#0e0a02)",border:"1px solid #2a1d05",borderRadius:"14px",padding:"14px"}}>
          <div style={{fontWeight:700,color:"#fde68a",fontSize:"13px"}}>Insights • Revenue Stream +22%</div>
          <div style={{height:"36px",marginTop:"10px",display:"flex",gap:"3px",alignItems:"end"}}>{[30,50,35,65,55,75,70,85].map((h,i)=><div key={i} style={{flex:1,height:`${h}%`,background:"#f59e0b",borderRadius:"2px"}}></div>)}</div>
          <div style={{marginTop:"8px",fontSize:"11px",color:"#a89172"}}>Guest Satisfaction <b style={{color:"#fde68a",fontSize:"14px"}}>4.8★ ★★★★★</b></div>
          <div style={{marginTop:"10px",background:"#fbbf24",color:"black",padding:"10px",borderRadius:"8px",textAlign:"center",fontWeight:800}}>Table Turnover: 2.3x</div>
        </div>
      </div>
      <div style={{padding:"18px"}}>
        <h1 style={{fontSize:"32px",fontWeight:900,lineHeight:0.9,color:"white"}}>Your Tables,<br/>In Real 3D.</h1>
        <p style={{color:"#7a6a4a",fontSize:"13px",marginTop:"8px"}}>Premium Gold 3D Hospitality SaaS</p>
        <div style={{marginTop:"12px",color:"#c4a882",fontSize:"13px",lineHeight:1.7}}>✓ Drag & Drop Gold Editor<br/>✓ $12,480 Revenue Dashboard<br/>✓ 82% Occupancy Live<br/>✓ 7-Day Trial Auto-Lock</div>
      </div>
      <div style={{padding:"16px",background:"#070501",borderTop:"1px solid #1f1605"}}>
        <h3 style={{textAlign:"center",color:"#fde68a"}}>Gold Pricing • 7-Day Lock</h3>
        <div style={{marginTop:"12px",background:"linear-gradient(180deg,#1f1605,#0e0a02)",border:"2px solid #f59e0b",borderRadius:"16px",padding:"16px",boxShadow:"0 0 30px rgba(245,158,11,0.2)"}}>
          <div style={{background:"#f59e0b",color:"black",fontSize:"10px",fontWeight:900,padding:"4px 10px",borderRadius:"20px",display:"inline-block"}}>GOLD PRO - MOST POPULAR</div>
          <div style={{marginTop:"8px",fontWeight:800}}>Pro Gold - $49/mo</div>
          <div style={{fontSize:"24px",fontWeight:900}}>$49<span style={{fontSize:"12px",color:"#a89172"}}>/mo</span></div>
          <div style={{fontSize:"11px",color:"#c4a882",marginTop:"6px",lineHeight:1.6}}>✓ 40 Gold Holographic Tables<br/>✓ $12,480 Dashboard • 82% Live<br/>✓ 7-Day Full Gold → Day 8 Lock 🔒</div>
          <div style={{background:"#fbbf24",color:"black",padding:"12px",borderRadius:"10px",fontWeight:900,textAlign:"center",marginTop:"10px"}}>Start Gold Trial Free</div>
        </div>
      </div>
    </div>
  );
}
