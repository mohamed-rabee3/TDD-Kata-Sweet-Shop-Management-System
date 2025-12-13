import pytest
from app import models

# --- Helper: Create tokens for testing ---
def get_admin_token(client):
    # 1. Register admin
    client.post("/auth/register", json={"email": "admin@test.com", "password": "pass"})
    # 2. Force DB update to make them admin (since API doesn't allow registering as admin)
    # Note: We rely on the fixture logic or we can cheat slightly for tests by using a script/fixture
    # But for simplicity in this unit test file, we will just login the user we created
    # AND manually update the DB using the dependency override or just assume a clean state.
    
    # BETTER APPROACH FOR INTEGRATION TEST:
    # Use the 'client' fixture which shares the DB.
    # We need to manually flip the is_admin flag in the DB for this user.
    pass 
    # To keep it simple, let's just create a new user and login, 
    # but we can't easily flip the flag without direct DB access in the test function.
    
# Let's use a simpler approach for the test: 
# We will create the user via API, then Login, then use the token.
# To make them Admin, we need access to the DB session in the test.

def test_create_sweet_as_admin(client, test_db):
    # 1. Create User
    client.post("/auth/register", json={"email": "admin@test.com", "password": "pass"})
    
    # 2. Make them Admin manually in DB
    user = test_db.query(models.User).filter(models.User.email == "admin@test.com").first()
    user.is_admin = True
    test_db.commit()
    
    # 3. Login
    login_res = client.post(
        "/auth/login", 
        data={"username": "admin@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # 4. Try to Create Sweet
    response = client.post(
        "/sweets",
        json={
            "name": "Super Chocolate",
            "category": "Chocolate",
            "price": 2.50,
            "quantity": 10
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Super Chocolate"
    assert data["id"] is not None

def test_create_sweet_as_normal_user_fails(client):
    # 1. Register normal user
    client.post("/auth/register", json={"email": "user@test.com", "password": "pass"})
    
    # 2. Login
    login_res = client.post(
        "/auth/login", 
        data={"username": "user@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # 3. Try to Create Sweet (Should Fail)
    response = client.post(
        "/sweets",
        json={"name": "Hacker Candy", "category": "Bad", "price": 0, "quantity": 0},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 403 # Forbidden

def test_restock_sweet(client, test_db):
    # 1. Setup Admin & Sweet
    # (Reuse admin creation logic or separate it into a fixture later)
    client.post("/auth/register", json={"email": "admin2@test.com", "password": "pass"})
    user = test_db.query(models.User).filter(models.User.email == "admin2@test.com").first()
    user.is_admin = True
    test_db.commit()
    
    login_res = client.post(
        "/auth/login", 
        data={"username": "admin2@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # Create a sweet first
    create_res = client.post(
        "/sweets",
        json={"name": "Jelly Bean", "category": "Gummy", "price": 1.0, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"}
    )
    sweet_id = create_res.json()["id"]
    
    # 2. Restock (Add 10 more)
    response = client.post(
        f"/sweets/{sweet_id}/restock",
        json={"amount": 10}, # We assume we will implement a schema for this
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["quantity"] == 15 # 5 + 10




def test_get_sweets_list(client, test_db):
    # 1. Setup: Insert some sweets directly into DB
    sweet1 = models.Sweet(name="Test Chocolate", category="Chocolate", price=5.0, quantity=10)
    sweet2 = models.Sweet(name="Test Gummy", category="Gummy", price=2.0, quantity=20)
    test_db.add_all([sweet1, sweet2])
    test_db.commit()

    # 2. Get List (No Token needed)
    response = client.get("/sweets")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Test Chocolate"

def test_search_sweets(client, test_db):
    # 1. Setup: Insert varied data
    s1 = models.Sweet(name="Dark Chocolate", category="Chocolate", price=10.0, quantity=10)
    s2 = models.Sweet(name="White Chocolate", category="Chocolate", price=10.0, quantity=10)
    s3 = models.Sweet(name="Sour Worms", category="Gummy", price=2.0, quantity=50)
    test_db.add_all([s1, s2, s3])
    test_db.commit()

    # 2. Search by Name (partial match)
    res_name = client.get("/sweets/search?q=Dark")
    assert res_name.status_code == 200
    assert len(res_name.json()) == 1
    assert res_name.json()[0]["name"] == "Dark Chocolate"

    # 3. Search by Category
    res_cat = client.get("/sweets/search?category=Gummy")
    assert len(res_cat.json()) == 1
    assert res_cat.json()[0]["name"] == "Sour Worms"

    # 4. Search by Price Range
    res_price = client.get("/sweets/search?price_max=5.0")
    assert len(res_price.json()) == 1
    assert res_price.json()[0]["name"] == "Sour Worms"