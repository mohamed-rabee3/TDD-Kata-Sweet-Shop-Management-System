import pytest
from app import models

# --- Helper: Create tokens for testing ---
def get_admin_token(client):
    # 1. Register admin
    client.post("/api/auth/register", json={"email": "admin@test.com", "password": "pass"})
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
    client.post("/api/auth/register", json={"email": "admin@test.com", "password": "pass"})
    
    # 2. Make them Admin manually in DB
    user = test_db.query(models.User).filter(models.User.email == "admin@test.com").first()
    user.is_admin = True
    test_db.commit()
    
    # 3. Login
    login_res = client.post(
        "/api/auth/login", 
        data={"username": "admin@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # 4. Try to Create Sweet
    response = client.post(
        "/api/sweets",
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
    client.post("/api/auth/register", json={"email": "user@test.com", "password": "pass"})
    
    # 2. Login
    login_res = client.post(
        "/api/auth/login", 
        data={"username": "user@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # 3. Try to Create Sweet (Should Fail)
    response = client.post(
        "/api/sweets",
        json={"name": "Hacker Candy", "category": "Bad", "price": 0, "quantity": 0},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 403 # Forbidden

def test_restock_sweet(client, test_db):
    # 1. Setup Admin & Sweet
    # (Reuse admin creation logic or separate it into a fixture later)
    client.post("/api/auth/register", json={"email": "admin2@test.com", "password": "pass"})
    user = test_db.query(models.User).filter(models.User.email == "admin2@test.com").first()
    user.is_admin = True
    test_db.commit()
    
    login_res = client.post(
        "/api/auth/login", 
        data={"username": "admin2@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # Create a sweet first
    create_res = client.post(
        "/api/sweets",
        json={"name": "Jelly Bean", "category": "Gummy", "price": 1.0, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"}
    )
    sweet_id = create_res.json()["id"]
    
    # 2. Restock (Add 10 more)
    response = client.post(
        f"/api/sweets/{sweet_id}/restock",
        json={"amount": 10}, # We assume we will implement a schema for this
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["quantity"] == 15 # 5 + 10


def test_update_sweet_as_admin(client, test_db):
    # 1. Setup Admin & Sweet
    client.post("/api/auth/register", json={"email": "admin3@test.com", "password": "pass"})
    user = test_db.query(models.User).filter(models.User.email == "admin3@test.com").first()
    user.is_admin = True
    test_db.commit()
    
    login_res = client.post(
        "/api/auth/login", 
        data={"username": "admin3@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # Create a sweet first
    create_res = client.post(
        "/api/sweets",
        json={"name": "Original Candy", "category": "Hard", "price": 1.5, "quantity": 20},
        headers={"Authorization": f"Bearer {token}"}
    )
    sweet_id = create_res.json()["id"]
    
    # 2. Update the sweet
    response = client.put(
        f"/api/sweets/{sweet_id}",
        json={
            "name": "Updated Candy",
            "price": 2.5,
            "category": "Soft"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # 3. Verify
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Candy"
    assert data["price"] == 2.5
    assert data["category"] == "Soft"
    assert data["quantity"] == 20  # Quantity should remain unchanged if not provided
    
    # 4. Verify in DB
    updated_sweet = test_db.query(models.Sweet).filter(models.Sweet.id == sweet_id).first()
    assert updated_sweet.name == "Updated Candy"
    assert updated_sweet.price == 2.5
    assert updated_sweet.category == "Soft"


def test_update_sweet_as_normal_user_fails(client, test_db):
    # 1. Setup: Create admin to create sweet, then normal user to try updating
    client.post("/api/auth/register", json={"email": "admin4@test.com", "password": "pass"})
    admin_user = test_db.query(models.User).filter(models.User.email == "admin4@test.com").first()
    admin_user.is_admin = True
    test_db.commit()
    
    admin_login = client.post(
        "/api/auth/login", 
        data={"username": "admin4@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    admin_token = admin_login.json()["access_token"]
    
    # Create a sweet as admin
    create_res = client.post(
        "/api/sweets",
        json={"name": "Protected Candy", "category": "Hard", "price": 1.0, "quantity": 10},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    sweet_id = create_res.json()["id"]
    
    # 2. Register and login as normal user
    client.post("/api/auth/register", json={"email": "user2@test.com", "password": "pass"})
    user_login = client.post(
        "/api/auth/login", 
        data={"username": "user2@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    user_token = user_login.json()["access_token"]
    
    # 3. Try to Update Sweet (Should Fail)
    response = client.put(
        f"/api/sweets/{sweet_id}",
        json={"name": "Hacked Candy", "price": 0.01},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 403  # Forbidden


def test_update_sweet_not_found(client, test_db):
    # 1. Setup Admin
    client.post("/api/auth/register", json={"email": "admin5@test.com", "password": "pass"})
    user = test_db.query(models.User).filter(models.User.email == "admin5@test.com").first()
    user.is_admin = True
    test_db.commit()
    
    login_res = client.post(
        "/api/auth/login", 
        data={"username": "admin5@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # 2. Try to Update Non-existent Sweet
    response = client.put(
        "/api/sweets/99999",
        json={"name": "Ghost Candy"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Sweet not found"


def test_delete_sweet_as_admin(client, test_db):
    # 1. Setup Admin & Sweet
    client.post("/api/auth/register", json={"email": "admin6@test.com", "password": "pass"})
    user = test_db.query(models.User).filter(models.User.email == "admin6@test.com").first()
    user.is_admin = True
    test_db.commit()
    
    login_res = client.post(
        "/api/auth/login", 
        data={"username": "admin6@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # Create a sweet first
    create_res = client.post(
        "/api/sweets",
        json={"name": "To Be Deleted", "category": "Hard", "price": 1.0, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"}
    )
    sweet_id = create_res.json()["id"]
    
    # 2. Delete the sweet
    response = client.delete(
        f"/api/sweets/{sweet_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # 3. Verify deletion (204 No Content)
    assert response.status_code == 204
    
    # 4. Verify sweet is gone from DB
    deleted_sweet = test_db.query(models.Sweet).filter(models.Sweet.id == sweet_id).first()
    assert deleted_sweet is None


def test_delete_sweet_as_normal_user_fails(client, test_db):
    # 1. Setup: Create admin to create sweet, then normal user to try deleting
    client.post("/api/auth/register", json={"email": "admin7@test.com", "password": "pass"})
    admin_user = test_db.query(models.User).filter(models.User.email == "admin7@test.com").first()
    admin_user.is_admin = True
    test_db.commit()
    
    admin_login = client.post(
        "/api/auth/login", 
        data={"username": "admin7@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    admin_token = admin_login.json()["access_token"]
    
    # Create a sweet as admin
    create_res = client.post(
        "/api/sweets",
        json={"name": "Protected Sweet", "category": "Hard", "price": 1.0, "quantity": 10},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    sweet_id = create_res.json()["id"]
    
    # 2. Register and login as normal user
    client.post("/api/auth/register", json={"email": "user3@test.com", "password": "pass"})
    user_login = client.post(
        "/api/auth/login", 
        data={"username": "user3@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    user_token = user_login.json()["access_token"]
    
    # 3. Try to Delete Sweet (Should Fail)
    response = client.delete(
        f"/api/sweets/{sweet_id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 403  # Forbidden
    
    # 4. Verify sweet still exists
    sweet = test_db.query(models.Sweet).filter(models.Sweet.id == sweet_id).first()
    assert sweet is not None
    assert sweet.name == "Protected Sweet"


def test_delete_sweet_not_found(client, test_db):
    # 1. Setup Admin
    client.post("/api/auth/register", json={"email": "admin8@test.com", "password": "pass"})
    user = test_db.query(models.User).filter(models.User.email == "admin8@test.com").first()
    user.is_admin = True
    test_db.commit()
    
    login_res = client.post(
        "/api/auth/login", 
        data={"username": "admin8@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # 2. Try to Delete Non-existent Sweet
    response = client.delete(
        "/api/sweets/99999",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Sweet not found"


def test_get_sweets_list(client, test_db):
    # 1. Setup: Insert some sweets directly into DB
    sweet1 = models.Sweet(name="Test Chocolate", category="Chocolate", price=5.0, quantity=10)
    sweet2 = models.Sweet(name="Test Gummy", category="Gummy", price=2.0, quantity=20)
    test_db.add_all([sweet1, sweet2])
    test_db.commit()

    # 2. Get List (No Token needed)
    response = client.get("/api/sweets")
    
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
    res_name = client.get("/api/sweets/search?q=Dark")
    assert res_name.status_code == 200
    assert len(res_name.json()) == 1
    assert res_name.json()[0]["name"] == "Dark Chocolate"

    # 3. Search by Category
    res_cat = client.get("/api/sweets/search?category=Gummy")
    assert len(res_cat.json()) == 1
    assert res_cat.json()[0]["name"] == "Sour Worms"

    # 4. Search by Price Range
    res_price = client.get("/api/sweets/search?price_max=5.0")
    assert len(res_price.json()) == 1
    assert res_price.json()[0]["name"] == "Sour Worms"


def test_purchase_sweet_success(client, test_db):
    # 1. Setup: User and Sweet
    client.post("/api/auth/register", json={"email": "buyer@test.com", "password": "pass"})
    login_res = client.post(
        "/api/auth/login", 
        data={"username": "buyer@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    # Create sweet directly in DB with 5 items
    sweet = models.Sweet(name="Buy Me", category="Treat", price=1.0, quantity=5)
    test_db.add(sweet)
    test_db.commit()
    test_db.refresh(sweet)
    
    # 2. Purchase 1 item
    response = client.post(
        f"/api/sweets/{sweet.id}/purchase",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # 3. Verify
    assert response.status_code == 200
    assert response.json()["message"] == "Purchase successful"
    
    # FIX: Re-query the object instead of refreshing the old one
    updated_sweet = test_db.query(models.Sweet).filter(models.Sweet.id == sweet.id).first()
    assert updated_sweet.quantity == 4 # Was 5, now 4

def test_purchase_out_of_stock(client, test_db):
    # 1. Setup: User and Sweet with 0 Quantity
    client.post("/api/auth/register", json={"email": "late@test.com", "password": "pass"})
    login_res = client.post(
        "/api/auth/login", 
        data={"username": "late@test.com", "password": "pass"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = login_res.json()["access_token"]
    
    sweet = models.Sweet(name="Empty", category="Treat", price=1.0, quantity=0)
    test_db.add(sweet)
    test_db.commit()
    test_db.refresh(sweet)
    
    # 2. Try to Purchase
    response = client.post(
        f"/api/sweets/{sweet.id}/purchase",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # 3. Verify Failure
    assert response.status_code == 400
    assert response.json()["detail"] == "Out of stock"