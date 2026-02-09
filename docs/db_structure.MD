TABLE pre_orders
Attributes :
id uuid ,
nama string ,
kelas string ,
no_telp string ,
product_id number fk table product,
quantity number,

TABLE products
Attributes :
product_id number ,
name string ,
stock number ,
price number ,
image_url text

data example :

INSERT INTO products (product_id, name, stock , price ,image_url) values (3, 'Udonist Keju', 2, 2000, 'https://res.cloudinary.com/dcarewz3d/image/upload/Gemini_Generated_Image_una103una103una1_zzyi91');

table users
Attributes :
id uuid ,
username string ,
password string,
