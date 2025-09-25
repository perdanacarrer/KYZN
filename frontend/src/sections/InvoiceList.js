import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function InvoiceList(){
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const containerRef = useRef(null);
  useEffect(()=>{ load(page); },[page]);
  useEffect(()=>{
    const socket = io(window.location.origin.replace(/:\d+$/,'') + ':4000'); // connect to backend at port 4000
    socket.on('connect', ()=>{ console.log('socket connected'); });
    socket.on('new_invoice', (inv)=>{
      setInvoices(prev => { const updated = [inv].concat(prev); return updated; });
      // auto-scroll to top of list container
      if(containerRef.current){
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    return ()=>{ socket.disconnect(); };
  },[]);
  function load(p){
    axios.get(`/invoices?page=${p}&limit=5`).then(r=>setInvoices(r.data.data)).catch(()=>{});
  }
  return (
    <div>
      <div ref={containerRef} style={{maxHeight:400, overflow:'auto', paddingRight:8}}>
        {invoices.map(inv=>(
          <div key={inv.id} style={{border:'1px solid #ddd', padding:12, marginBottom:8, borderRadius:8, boxShadow:'0 2px 6px rgba(0,0,0,0.03)'}} title={`Invoice No: ${inv.invoice_no || ''}`}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><strong>{inv.customer_name}</strong> — <span style={{color:'#666'}}>{inv.salesperson}</span></div>
              <div style={{fontWeight:700}}>Total: {inv.total}</div>
            </div>
            <div style={{marginTop:6, color:'#444'}}>{inv.notes}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
        <div>Page {page}</div>
        <button onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  );
}
