import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Toast from '../components/Toast';

export default function InvoiceForm(){
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({date:'', customer_name:'', salesperson:'', notes:'', items:[]});
  const [query, setQuery] = useState('');
  const [suggest, setSuggest] = useState([]);
  const [toast, setToast] = useState(null);
  useEffect(()=>{ axios.get('/backend/data/product_sold.json').then(r=>setProducts(r.data)).catch(()=>{}); },[]);

  function addItem(p){
    setForm(s=>{
      const items = s.items.concat([{product_id: p.id||null, name: p.product_name||p['Product Name']||p.name, qty:1, price: Number(p.price||p.Price||0)}]);
      return {...s, items};
    });
    setToast('Added item to invoice');
  }
  async function submit(){
    // validation
    if(!form.date || !form.customer_name || !form.salesperson || form.items.length===0){
      setToast('Please fill mandatory fields');
      return;
    }
    try{
      await axios.post('/invoices', form);
      setToast('Invoice saved');
      setForm({date:'', customer_name:'', salesperson:'', notes:'', items:[]});
    }catch(e){
      setToast('Error saving invoice');
    }
  }
  return (
    <div style={{background:'#fff', padding:16, borderRadius:8, boxShadow:'0 6px 18px rgba(0,0,0,0.06)'}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        <div>
          <label style={{fontSize:12,color:'#666'}}>Date</label><br/>
          <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{padding:8,width:'100%',borderRadius:6,border:'1px solid #ddd'}} />
        </div>
        <div>
          <label style={{fontSize:12,color:'#666'}}>Salesperson <span title="Who sold the order" style={{cursor:'help'}}>🛈</span></label><br/>
          <input value={form.salesperson} onChange={e=>setForm({...form,salesperson:e.target.value})} style={{padding:8,width:'100%',borderRadius:6,border:'1px solid #ddd'}} />
        </div>
        <div style={{gridColumn:'1 / span 2'}}>
          <label style={{fontSize:12,color:'#666'}}>Customer</label><br/>
          <input value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} style={{padding:8,width:'100%',borderRadius:6,border:'1px solid #ddd'}} />
        </div>
      </div>

      <div style={{marginTop:12}}>
        <label style={{fontSize:12,color:'#666'}}>Product (autocomplete)</label><br/>
        <input value={query} onChange={e=>{ setQuery(e.target.value); setSuggest(products.filter(p=> (p.product_name||p['Product Name']||p.name||'').toLowerCase().includes(e.target.value.toLowerCase())).slice(0,5)); }} style={{padding:8,width:'100%',borderRadius:6,border:'1px solid #ddd'}} />
        <div style={{border:'1px solid #eee', maxHeight:180, overflow:'auto', marginTop:6, borderRadius:6}}>
          {suggest.map((s,idx)=>(
            <div key={idx} style={{padding:8,display:'flex',alignItems:'center',cursor:'pointer'}} onClick={()=>{ addItem(s); setQuery(''); setSuggest([]); }}>
              <img src={s.image||s.Image||''} alt="" style={{width:44,height:44,objectFit:'cover',marginRight:10,borderRadius:6,background:'#fafafa'}} />
              <div>
                <div style={{fontWeight:700}}>{s.product_name||s['Product Name']||s.name}</div>
                <div style={{fontSize:12,color:'#666'}}>Stock: {s.stock||s.Stock||0} — Price: {s.price||s.Price||0}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:12}}>
        <h4 style={{margin:0}}>Items</h4>
        {form.items.map((it,idx)=>(
          <div key={idx} style={{display:'flex',gap:8,alignItems:'center', padding:8, borderRadius:6, border:'1px solid #f0f0f0', marginTop:8}}>
            <div style={{flex:1}}>{it.name}</div>
            <div>
              <input type="number" value={it.qty} onChange={e=>{ const q=Number(e.target.value); setForm(s=>{ const items = [...s.items]; items[idx].qty = q; return {...s, items}; }); }} style={{width:64,padding:6,borderRadius:6,border:'1px solid #ddd'}} />
            </div>
            <div style={{width:120}}>Price: <strong>{it.price}</strong></div>
          </div>
        ))}
      </div>
      <div style={{marginTop:12, display:'flex', justifyContent:'flex-end'}}>
        <button onClick={submit} style={{padding:'10px 16px', background:'#0b76ff', color:'#fff', border:'none', borderRadius:8}}>Submit Invoice</button>
      </div>
      {toast && <Toast message={toast} duration={3000} />}
    </div>
  );
}
