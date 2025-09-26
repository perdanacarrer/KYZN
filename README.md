
KYZN - Software Engineer Test Submission
========================================

This archive contains a reference implementation scaffold to fulfill the requirements
for the Invoice module technical challenge. It uses the provided InvoiceImport.xlsx
to create sample data.

Files included:
- backend/                : Node.js + Express server (endpoints: GET /invoices, POST /invoices, GET /revenue)
- frontend/               : React + Redux scaffold with components for Sections 1-3
- data/                   : JSON exports of the Excel sheets and a MySQL seed file (mysql_seed.sql)
- README.md               : this file


**Please read and use How to Run**

How to use (Postgre):
1. The latest backend is implemented with **PostgreSQL** (via `pg` and Docker Compose).
2. Configure backend/.env to point to your Postgres DB, then run bash :
`cd backend` then `npm install` then `npm run start`.
3. In frontend/, run `cd frontend` then `npm install` then `npm run start`.

How to use (MySQL compatibility):
1. Import the SQL in data/mysql_seed.sql into your MySQL database.
2. Configure backend/.env to point to your DB and run `cd backend` then `npm install` then `npm run start`.
3. In frontend/, run `cd frontend` then `npm install` then `npm run start`.

Note: For speed of evaluation this project is a scaffold with full endpoint implementations
and frontend components wired to demonstrate the required flows. Customize / extend as needed.

Data extracted from the uploaded Excel file: sheets = ['invoice', 'product sold']



## Docker Compose (Postgres + Backend)

Run `docker-compose up --build` from the project root to start a Postgres database and the backend server configured to connect to it on port 4000. The backend will auto-seed data from `backend/data/*.json` on first run.



Project Structure
-----------------
```
invoice_test_project/
├── backend/              # Node.js + Express + Socket.IO backend (Postgres)
│   ├── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── data/             # Seed JSONs auto-loaded into DB
├── frontend/             # React + Redux frontend
│   ├── src/
│   └── package.json
├── data/                 # JSON exports from Excel and mysql_seed.sql
├── docker-compose.yml    # Compose for backend + Postgres
├── .gitignore
└── README.md
```



How to Run
----------

### Option A: Run with Docker Compose (recommended)
1. Ensure Docker and Docker Compose are installed.
2. In the project root, run:
   ```bash
   docker-compose up --build
   ```
   This will start:
   - `postgres` on port 5432 (with default user/password in docker-compose.yml)
   - `backend` Node.js server on port 4000
3. Access backend API at: http://localhost:4000

(Optional) You can add a frontend service to docker-compose or run it separately (Option B).

### Option B: Run manually

#### Backend
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure Postgres connection in `.env` (or set env vars):
   ```env
   PGHOST=localhost
   PGUSER=postgres
   PGPASSWORD=postgres
   PGDATABASE=invoicedb
   PGPORT=5432
   ```
3. Run the backend:
   ```bash
   npm start
   ```
   Backend runs at http://localhost:4000

#### Frontend
1. In another terminal:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. Access frontend at http://localhost:3000

## 📊 Excel Auto-Seeding (First Run)

On the first backend run, the server checks if the database is empty. If so, it will read **InvoiceImport.xlsx** from the `backend/` folder and seed two tables:

- **Products** → `products` table  
  Required columns: `id`, `name`, `price`, `stock`, `picture`
- **Invoices** → `invoices` table  
  Required columns: `id`, `date`, `customer_name`, `salesperson_name`, `notes`, `total`

After this seed, all product and invoice data come from the database.

- On first run, backend reads InvoiceImport.xlsx and auto-extracts:
  - backend/data/product_sold.json
  - backend/data/invoice.json
  These are also inserted into Postgres.
- Frontend autocomplete uses the generated `product_sold.json`.
