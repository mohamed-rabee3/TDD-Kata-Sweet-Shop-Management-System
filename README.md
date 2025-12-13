# TDD Kata: Sweet Shop Management System

A full-stack application for managing a boutique sweet shop's inventory and sales. Built with **FastAPI** (Backend) and **React + Vite** (Frontend), following **Test-Driven Development (TDD)** principles.

## 🎯 Project Overview

This system provides:

- **Customer Features:**
  - Browse and search sweets by name, category, or price range
  - Purchase sweets (automatically decreases inventory)
  - Real-time stock availability indicators

- **Admin Features:**
  - Add, update, and delete sweets
  - Restock inventory
  - Full CRUD operations on product catalog

- **Security:**
  - JWT-based authentication
  - Role-based access control (Admin vs. Regular User)
  - Protected API endpoints

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI
- **Database:** SQLite (with SQLAlchemy ORM)
- **Migrations:** Alembic
- **Authentication:** JWT (python-jose) + Password Hashing (passlib)
- **Testing:** Pytest + pytest-cov
- **API Documentation:** Auto-generated OpenAPI/Swagger docs

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router
- **HTTP Client:** Axios
- **State Management:** React Context API

## 📋 Prerequisites

- **Python 3.9+**
- **Node.js 18+** and npm
- **Git**

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   py -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows (PowerShell):**
     ```bash
     venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt):**
     ```bash
     venv\Scripts\activate.bat
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   cd app
   pip install -r requirements.txt
   ```

5. **Create environment file:**
   Create a `.env` file in the `backend/app/` directory:
   ```env
   DATABASE_URL=sqlite:///./sweetshop.db
   SECRET_KEY=your-secret-key-here-change-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

6. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

7. **Create an admin user (optional):**
   ```bash
   cd ..
   python scripts/create_admin.py
   ```

8. **Start the development server:**
   ```bash
   cd app
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` (or another port if 5173 is occupied)

## 🧪 Running Tests

### Backend Tests

From the `backend/app/` directory:

```bash
# Run all tests
pytest

# Run tests with coverage report
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py
pytest tests/test_sweets.py
```

The coverage report will be generated in `htmlcov/index.html`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Sweets (Protected)
- `GET /api/sweets` - Get all sweets (with optional search query)
- `GET /api/sweets/search` - Search sweets by name/category
- `POST /api/sweets` - Create a new sweet (Admin only)
- `PUT /api/sweets/{id}` - Update a sweet (Admin only)
- `DELETE /api/sweets/{id}` - Delete a sweet (Admin only)

### Inventory
- `POST /api/sweets/{id}/purchase` - Purchase a sweet (decreases quantity)
- `POST /api/sweets/{id}/restock` - Restock a sweet (Admin only)

## 🔐 User Roles

- **Regular User:** Can browse, search, and purchase sweets
- **Admin:** Full access including CRUD operations and inventory management

To create an admin user, use the script:
```bash
python scripts/create_admin.py
```

## 📸 Screenshots

*(Screenshots will be added here once the application is complete)*

- Login/Register Pages
- Dashboard with Sweet Catalog
- Search Functionality
- Admin Panel
- Purchase Flow

## 🧪 Test Coverage

The project follows **Test-Driven Development (TDD)** with a focus on:

- **Integration Tests:** Full API endpoint testing with in-memory database
- **Authentication Tests:** User registration, login, token validation
- **Business Logic Tests:** Purchase flow, inventory management, role-based access
- **Edge Cases:** Out-of-stock purchases, unauthorized access attempts

## 🏗️ Project Structure

```
sweet-shop-kata/
│
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── routers/          # API endpoints
│   │   ├── tests/            # Test suite
│   │   ├── main.py           # FastAPI application
│   │   ├── models.py         # Database models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # JWT & password hashing
│   │   └── database.py       # SQLAlchemy setup
│   ├── scripts/
│   │   └── create_admin.py   # Admin user seeding
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/              # Axios configuration
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── context/          # React Context (Auth)
    │   └── App.jsx           # Router setup
    └── package.json
```

---

## 🤖 My AI Usage

**Transparency Statement:** This project was developed with the assistance of AI tools. All AI-assisted commits have been properly attributed with co-author tags as per the project requirements. The following section details how AI tools were integrated into my development workflow.

### AI Tools Used

1. **Gemini (Google)**
2. **Cursor IDE (AI-powered editor)**

### How AI Was Used Throughout Development

#### 1. Architecture & Planning Phase
- **Brainstorming API Design:** Used Gemini to discuss RESTful API endpoint structures, request/response schemas, and authentication flow patterns. This helped me think through edge cases before implementation.
- **Database Schema Design:** Consulted AI to validate database relationships and indexing strategies for the User and Sweet models.
- **TDD Workflow Planning:** AI assisted in structuring the test-first approach, helping identify which tests to write first and the sequence of Red-Green-Refactor cycles.

#### 2. Code Generation & Implementation
- **Boilerplate Generation:** Used Cursor's AI to generate initial FastAPI router structures, Pydantic schemas, and SQLAlchemy model definitions. This accelerated setup without sacrificing understanding.
- **Component Creation:** Leveraged Cursor's inline AI suggestions to scaffold React components (Navbar, SweetCard, Modal) with proper prop structures and initial JSX skeletons.
- **Configuration Files:** AI generated Alembic configuration, CORS middleware setup, and environment variable handling patterns.

#### 3. Test-Driven Development (TDD)
- **Test Case Generation:** Used Gemini to brainstorm comprehensive test scenarios, including edge cases like:
  - Concurrent purchase attempts (race conditions)
  - Invalid token scenarios
  - Out-of-stock purchase validation
  - Admin-only endpoint access control
- **Test Fixture Setup:** Cursor's AI helped structure `conftest.py` with proper database fixtures, test client setup, and isolation patterns.
- **Mock Data Generation:** AI suggested realistic test data patterns for sweets (names, categories, prices) that made tests more readable.

#### 4. Problem Solving & Debugging
- **Error Resolution:** When encountering SQLAlchemy session management issues, AI helped diagnose and fix database session lifecycle problems.
- **JWT Implementation:** Used AI to verify JWT token encoding/decoding logic and token expiration handling.
- **CORS Configuration:** AI assisted in properly configuring CORS middleware to allow frontend-backend communication.

#### 5. Code Quality & Refactoring
- **Code Review Suggestions:** After writing initial implementations, used AI to review code for:
  - SOLID principle adherence
  - Potential security vulnerabilities
  - Performance optimizations
  - Code duplication opportunities
- **Refactoring Assistance:** AI suggested consolidating repeated authentication logic into reusable dependency functions in `dependencies.py`.

#### 6. Frontend Development
- **React Patterns:** Consulted AI on best practices for:
  - Context API state management patterns
  - Protected route implementation with React Router
  - Axios interceptor configuration for automatic token attachment
  - Form validation and error handling patterns
- **UX Improvements:** AI suggested user feedback mechanisms (loading states, success/error messages) that improved the overall user experience.

#### 7. Documentation & Communication
- **README Writing:** Used AI to structure this README, ensuring clarity and completeness of setup instructions.
- **Commit Messages:** AI helped craft clear, descriptive commit messages that followed conventional commit standards.

### Reflection on AI Impact

**Positive Impacts:**
- **Acceleration:** AI tools significantly reduced time spent on boilerplate and repetitive code, allowing me to focus more on business logic and problem-solving.
- **Learning:** Using AI as a coding partner helped me discover modern patterns and best practices (e.g., FastAPI dependency injection, React Context patterns) that I might not have encountered otherwise.
- **Quality:** AI-assisted code reviews caught potential bugs and security issues early, leading to more robust code.
- **TDD Discipline:** AI helped maintain TDD discipline by suggesting test cases before implementation, keeping the Red-Green-Refactor cycle consistent.

**Challenges & Mitigations:**
- **Over-reliance Risk:** I made a conscious effort to understand every AI-generated piece of code before integrating it, ensuring I could debug and maintain it independently.
- **Code Ownership:** Even when using AI extensively, I reviewed and modified all code to match my coding style and project requirements. No code was blindly copy-pasted.

**Conclusion:**
AI tools (Gemini and Cursor) were integral to this project's development, serving as a pair-programming partner rather than a code generator. They enhanced my productivity while maintaining code quality and learning outcomes. The transparency in AI usage and co-authorship attribution ensures accountability and demonstrates responsible use of modern development tools.

---

## 📄 License

This project is part of a TDD Kata exercise and is for educational purposes.

## 🙏 Acknowledgments

- Built following TDD principles with Red-Green-Refactor cycles
- Developed with AI assistance (Gemini & Cursor) as documented above
