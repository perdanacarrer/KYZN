import React from 'react';
import InvoiceForm from './sections/InvoiceForm';
import InvoiceList from './sections/InvoiceList';
import RevenueChart from './sections/RevenueChart';

export default function App(){
  return (
    <div style={{fontFamily:'sans-serif',padding:20}}>
      <h1>KYZN - Invoice Module Demo</h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr', gap:20}}>
        <div>
          <h2>Add Invoice</h2>
          <InvoiceForm />
        </div>
        <div>
          <h2>Published Invoices</h2>
          <InvoiceList />
        </div>
      </div>
      <div style={{marginTop:30}}>
        <h2>Revenue (Time-series)</h2>
        <RevenueChart />
      </div>
    </div>
  );
}
