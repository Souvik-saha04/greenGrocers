import json
import cloudinary
import cloudinary.uploader
from products.models import Product
import os
from dotenv import load_dotenv
from datetime import datetime
from decimal import Decimal

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

def run():
    with open("../products_with_images.json", "r", encoding="utf-8") as file:
        data = json.load(file)

    products = []

    for item in data:
        try:
            product_name = item['name']
            safe_name = product_name.replace(" ", "_").lower()
            folder_path = f"../images/{safe_name}"

            if not os.path.exists(folder_path):
                print(f"❌ Folder not found for {product_name}")
                continue

            files = os.listdir(folder_path)

            if not files:
                print(f"❌ No image found for {product_name}")
                continue

            image_path = os.path.join(folder_path, files[0])

            print("📤 Uploading:", image_path)

            # ✅ Upload to Cloudinary (URL-based)
            upload_result = cloudinary.uploader.upload(
                image_path,
                public_id=f"products/{safe_name}",
                overwrite=True
            )

            image_url = upload_result['secure_url']

            # ✅ Create Product object
            product = Product(
                name=product_name,
                category=item['category'],
                unit=item['unit'],
                quantity=int(item['quantity']),
                variant=item['variant'],

                price_per_unit=Decimal(item['price_per_unit']),
                original_price=Decimal(item['original_price']),
                min_price=Decimal(item['price_per_unit']),
                current_price=Decimal(item['price_per_unit']),

                stock_quantity=int(item['stock_quantity']),

                harvest_date=datetime.strptime(item['harvest_date'], "%Y-%m-%d").date(),
                expiry=datetime.strptime(item['expiry'], "%Y-%m-%d").date() if item.get('expiry') else None,

                description=item.get('description', ""),

                # 🔥 IMPORTANT CHANGE
                image=image_url
            )

            products.append(product)

            print(f"✅ Processed: {product_name}")

        except Exception as e:
            print(f"❌ Error with {item.get('name')}: {e}")

    Product.objects.bulk_create(products)

    print("🎉 All products uploaded successfully!")