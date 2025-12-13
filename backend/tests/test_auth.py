# backend/tests/test_auth.py
from app.main import app

def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data  # Security check: Password should not be returned




def test_login_user(client):
    # 1. Create a user first
    client.post(
        "/auth/register",
        json={"email": "login_test@example.com", "password": "password123"},
    )
    
    # 2. Try to login
    # OAuth2 spec usually requires form-data (username/password), not JSON
    response = client.post(
        "/auth/login",
        data={"username": "login_test@example.com", "password": "password123"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"