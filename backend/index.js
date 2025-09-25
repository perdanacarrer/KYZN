require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }});

// Postgres connection using env (DATABASE_URL or individual vars)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || process.env.DB_HOST || 'db',
  port: process.env.PGPORT || process.env.DB_PORT || 5432,
  user: process.env.PGUSER || process.env.DB_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres',
  database: process.env.PGDATABASE || process.env.DB_NAME || 'invoice_db',
});

async function initDb(){
  // Create tables if not exist
  await pool.query(`CREATE TABLE IF NOT EXISTS product (
    id SERIAL PRIMARY KEY,
    sku TEXT,
    name TEXT,
    price NUMERIC(12,2),
    stock INTEGER,
    image_url TEXT
  );`);
  await pool.query(`CREATE TABLE IF NOT EXISTS invoice (
    id SERIAL PRIMARY KEY,
    invoice_no TEXT,
    date DATE,
    customer_name TEXT,
    salesperson TEXT,
    notes TEXT,
    total NUMERIC(12,2)
  );`);
  await pool.query(`CREATE TABLE IF NOT EXISTS invoice_item (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoice(id) ON DELETE CASCADE,
    product_id INTEGER,
    qty INTEGER,
    price NUMERIC(12,2),
    subtotal NUMERIC(12,2)
  );`);

  // seed from data/product_sold.json and data/invoice.json if empty
  const prodCount = (await pool.query('SELECT count(*) FROM product')).rows[0].count;
  if(Number(prodCount) === 0){
    const prodPath = path.join(__dirname,'data','product_sold.json');
    if(fs.existsSync(prodPath)){
      const products = JSON.parse(fs.readFileSync(prodPath,'utf8'));
      for(const p of products){
        await pool.query('INSERT INTO product (sku,name,price,stock,image_url) VALUES ($1,$2,$3,$4,$5)',
          [p.sku||p.SKU||'', p.product_name||p['Product Name']||p.name||'', Number(p.price||p.Price||0), Number(p.stock||p.Stock||0), p.image||p.Image||'']);
      }
      console.log('Seeded products:', products.length);
    }
  }
  const invCount = (await pool.query('SELECT count(*) FROM invoice')).rows[0].count;
  if(Number(invCount) === 0){
    const invPath = path.join(__dirname,'data','invoice.json');
    if(fs.existsSync(invPath)){
      const invoices = JSON.parse(fs.readFileSync(invPath,'utf8'));
      for(const inv of invoices){
        const total = Number(inv.total||inv.Total||0);
        const res = await pool.query('INSERT INTO invoice (invoice_no,date,customer_name,salesperson,notes,total) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
          [inv.invoice_no||inv['Invoice No']||'', inv.date||inv.Date||null, inv.customer_name||inv['Customer Name']||'', inv.salesperson||inv.Salesperson||'', inv.notes||inv.Notes||'', total]);
        const invoiceId = res.rows[0].id;
        // If invoice has items array (JSON), insert them
        const items = inv.items || inv.Items || null;
        if(typeof items === 'string' && items.trim().startsWith('[')){
          try{
            const arr = JSON.parse(items);
            for(const it of arr){
              const qty = Number(it.qty||it.quantity||1);
              const price = Number(it.price||it.unit_price||0);
              const subtotal = qty*price;
              await pool.query('INSERT INTO invoice_item (invoice_id,product_id,qty,price,subtotal) VALUES ($1,$2,$3,$4,$5)',
                [invoiceId, it.product_id||it.product||null, qty, price, subtotal]);
            }
          }catch(e){}
        }
      }
      console.log('Seeded invoices:', invoices.length);
    }
  }
}

// initialize db
initDb().catch(err=>{ console.error('DB init error', err); });

// WebSocket connections
io.on('connection', (socket)=>{
  console.log('Client connected', socket.id);
  socket.on('disconnect', ()=>{});
});

// Helpers
async function queryAll(sql, params=[]){
  const r = await pool.query(sql, params);
  return r.rows;
}

// GET invoices with pagination
app.get('/invoices', async (req,res)=>{
  const page = parseInt(req.query.page||'1');
  const limit = parseInt(req.query.limit||'10');
  const offset = (page-1)*limit;
  try{
    const rows = await queryAll('SELECT * FROM invoice ORDER BY date DESC NULLS LAST LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({data: rows, page, limit});
  }catch(err){ res.status(500).json({error:err.message}); }
});

// POST invoice - create and broadcast via WebSocket
app.post('/invoices', async (req,res)=>{
  const inv = req.body;
  if(!inv.customer_name || !inv.salesperson || !inv.date || !Array.isArray(inv.items) || inv.items.length===0){
    return res.status(400).json({error:'Invalid invoice, missing required fields'});
  }
  try{
    const total = inv.items.reduce((s,it)=>s + (Number(it.price)||0)* (Number(it.qty)||1),0);
    const r = await pool.query('INSERT INTO invoice (invoice_no,date,customer_name,salesperson,notes,total) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [inv.invoice_no||'', inv.date, inv.customer_name, inv.salesperson, inv.notes||'', total]);
    const invoiceId = r.rows[0].id;
    for(const it of inv.items){
      const subtotal = (Number(it.price)||0) * (Number(it.qty)||1);
      await pool.query('INSERT INTO invoice_item (invoice_id,product_id,qty,price,subtotal) VALUES ($1,$2,$3,$4,$5)',
        [invoiceId, it.product_id||null, Number(it.qty)||1, Number(it.price)||0, subtotal]);
    }
    const created = (await pool.query('SELECT * FROM invoice WHERE id=$1', [invoiceId])).rows[0];
    // broadcast
    io.emit('new_invoice', created);
    res.json({ok:true, invoice: created});
  }catch(err){ res.status(500).json({error:err.message}); }
});

// revenue aggregated
app.get('/revenue', async (req,res)=>{
  const period = req.query.period || 'daily';
  try{
    let groupExpr = "to_char(date,'YYYY-MM-DD')";
    if(period==='weekly') groupExpr = "to_char(date_trunc('week', date),'IYYY-IW')";
    if(period==='monthly') groupExpr = "to_char(date_trunc('month', date),'YYYY-MM')";
    const rows = await queryAll(`SELECT ${groupExpr} as period, SUM(total)::numeric(12,2) as revenue FROM invoice GROUP BY ${groupExpr} ORDER BY ${groupExpr} ASC`);
    res.json({data: rows});
  }catch(err){ res.status(500).json({error:err.message});}
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=>console.log('Invoice backend running on',PORT));
