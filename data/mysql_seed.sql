-- MySQL seed for Invoice and ProductSold tables
DROP TABLE IF EXISTS invoice_item;
DROP TABLE IF EXISTS invoice;
DROP TABLE IF EXISTS product;

CREATE TABLE product (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(100),
  name VARCHAR(255),
  price DECIMAL(12,2),
  stock INT,
  image_url TEXT
);

CREATE TABLE invoice (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_no VARCHAR(100),
  date DATE,
  customer_name VARCHAR(255),
  salesperson VARCHAR(255),
  notes TEXT,
  total DECIMAL(12,2)
);

CREATE TABLE invoice_item (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT,
  product_id INT,
  qty INT,
  price DECIMAL(12,2),
  subtotal DECIMAL(12,2)
);

INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO product (sku,name,price,stock,image_url) VALUES ('','',0,0,'');
INSERT INTO invoice (invoice_no,date,customer_name,salesperson,notes,total) VALUES ('INV-1','2021-01-01','','Doe','Lorem ipsum',0);
INSERT INTO invoice (invoice_no,date,customer_name,salesperson,notes,total) VALUES ('INV-2','2021-01-01','','Doe','Lorem ipsum',0);
INSERT INTO invoice (invoice_no,date,customer_name,salesperson,notes,total) VALUES ('INV-3','2021-01-03','','Doe','Lorem ipsum',0);
INSERT INTO invoice (invoice_no,date,customer_name,salesperson,notes,total) VALUES ('INV-4','2021-01-04','','Pete','Lorem ipsum',0);
INSERT INTO invoice (invoice_no,date,customer_name,salesperson,notes,total) VALUES ('INV-5','2021-01-04','','','Lorem ipsum',0);
INSERT INTO invoice (invoice_no,date,customer_name,salesperson,notes,total) VALUES ('INV-6','2021-01-01','','Doe','Lorem ipsum',0);
INSERT INTO invoice (invoice_no,date,customer_name,salesperson,notes,total) VALUES ('INV-7','2021-01-05','','Pete','Lorem ipsum',0);