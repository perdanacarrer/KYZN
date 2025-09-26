
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const db = require("./db"); // assumes db.js exports query()

async function seedFromExcel() {
  try {
    // Check if products already exist
    const prodCount = await db.query("SELECT COUNT(*) FROM products");
    if (parseInt(prodCount.rows[0].count) > 0) {
      console.log("Database already seeded. Skipping Excel import.");
      return;
    }

    const filePath = path.join(__dirname, "InvoiceImport.xlsx");
    if (!fs.existsSync(filePath)) {
      console.warn("InvoiceImport.xlsx not found, skipping seed.");
      return;
    }

    const wb = xlsx.readFile(filePath);
    const productSheet = wb.Sheets["Products"];
    const invoiceSheet = wb.Sheets["Invoices"];

    if (!productSheet || !invoiceSheet) {
      console.error("Excel file missing required sheets: Products, Invoices.");
      return;
    }

    const products = xlsx.utils.sheet_to_json(productSheet);
    const invoices = xlsx.utils.sheet_to_json(invoiceSheet);

    // Save JSON for frontend autocomplete
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    fs.writeFileSync(path.join(dataDir, "invoice.json"), JSON.stringify(invoices, null, 2));
    fs.writeFileSync(path.join(dataDir, "product_sold.json"), JSON.stringify(products, null, 2));

    for (let p of products) {
      await db.query(
        `INSERT INTO products (id, name, price, stock, picture)
         VALUES ($1,$2,$3,$4,$5)`,
        [p.id, p.name, p.price, p.stock, p.picture || null]
      );
    }

    for (let inv of invoices) {
      await db.query(
        `INSERT INTO invoices (id, date, customer_name, salesperson_name, notes, total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [inv.id, inv.date, inv.customer_name, inv.salesperson_name, inv.notes || null, inv.total]
      );
    }

    console.log("Database seeded from Excel successfully.");
  } catch (err) {
    console.error("Error seeding from Excel:", err);
  }
}

module.exports = seedFromExcel;
