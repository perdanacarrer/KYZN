import React, {useState, useEffect} from 'react';
export default function Toast({message, duration=3000}) {
  const [visible, setVisible] = useState(true);
  useEffect(()=>{ const t = setTimeout(()=>setVisible(false), duration); return ()=>clearTimeout(t); },[duration]);
  if(!visible) return null;
  return (
    <div style={{
      position:'fixed', right:20, bottom:20, background:'#111', color:'#fff', padding:'12px 16px', borderRadius:8, boxShadow:'0 6px 18px rgba(0,0,0,0.2)'
    }}>
      {message}
    </div>
  );
}
