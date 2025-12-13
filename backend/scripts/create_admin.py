import sys
import os

# 1. Setup Path to find 'app' module
# This allows the script to run from the 'backend' folder
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def create_super_user():
    db = SessionLocal()
    
    try:
        # 2. Define Admin Credentials
        admin_email = "admin@sweetshop.com"
        admin_password = "admin123" # Change this in production!

        # 3. Check if Admin already exists
        user = db.query(User).filter(User.email == admin_email).first()
        if user:
            print(f"--> Admin user {admin_email} already exists.")
            return

        # 4. Create new Admin
        print(f"--> Creating admin user: {admin_email}")
        hashed_pwd = get_password_hash(admin_password)
        
        # KEY: We set is_admin=True here
        new_admin = User(
            email=admin_email, 
            hashed_password=hashed_pwd, 
            is_active=True, 
            is_admin=True
        )
        
        db.add(new_admin)
        db.commit()
        print("--> Admin created successfully!")
        
    except Exception as e:
        print(f"--> Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_super_user()