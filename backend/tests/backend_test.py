"""
EDUSENSE Backend API Tests
Tests: Public endpoints, auth (register/login/me), astrology, recommendations,
students CRUD (RBAC), analytics (principal-only), WhatsApp CTA.
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://niche-finder-edu.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

TS = str(int(time.time()))
PARENT_EMAIL = f"TEST_parent_{TS}@edusense.com"
TEACHER_EMAIL = f"TEST_teacher_{TS}@edusense.com"
PRINCIPAL_EMAIL = "principal@edusense.com"
PRINCIPAL_PASS = "Admin@123"
PASS = "Test@1234"

state = {}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---------- Public ----------
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "EDUSENSE" in data.get("app", "")


def test_whatsapp_contact(s):
    r = s.get(f"{API}/whatsapp/contact")
    assert r.status_code == 200
    data = r.json()
    assert "number" in data and "link" in data
    assert data["link"].startswith("https://wa.me/")


# ---------- Auth: register ----------
def test_register_parent(s):
    r = s.post(f"{API}/auth/register", json={
        "name": "Parent Test", "email": PARENT_EMAIL, "password": PASS, "role": "parent"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and data["user"]["role"] == "parent"
    assert data["user"]["email"] == PARENT_EMAIL.lower()
    state["parent_token"] = data["token"]


def test_register_teacher(s):
    r = s.post(f"{API}/auth/register", json={
        "name": "Teacher Test", "email": TEACHER_EMAIL, "password": PASS, "role": "teacher"})
    assert r.status_code == 200, r.text
    state["teacher_token"] = r.json()["token"]


def test_register_duplicate(s):
    r = s.post(f"{API}/auth/register", json={
        "name": "Dup", "email": PARENT_EMAIL, "password": PASS, "role": "parent"})
    assert r.status_code == 400


def test_register_invalid_role(s):
    r = s.post(f"{API}/auth/register", json={
        "name": "Bad", "email": f"TEST_bad_{TS}@x.com", "password": PASS, "role": "student"})
    assert r.status_code == 422


# ---------- Auth: login ----------
def test_login_principal(s):
    r = s.post(f"{API}/auth/login", json={
        "email": PRINCIPAL_EMAIL, "password": PRINCIPAL_PASS, "role": "principal"})
    assert r.status_code == 200, r.text
    state["principal_token"] = r.json()["token"]


def test_login_role_mismatch(s):
    # parent account but logging in as teacher
    r = s.post(f"{API}/auth/login", json={
        "email": PARENT_EMAIL, "password": PASS, "role": "teacher"})
    assert r.status_code == 403


def test_login_wrong_password(s):
    r = s.post(f"{API}/auth/login", json={
        "email": PARENT_EMAIL, "password": "WrongPass!", "role": "parent"})
    assert r.status_code == 401


def test_me_with_token(s):
    r = s.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {state['parent_token']}"})
    assert r.status_code == 200
    assert r.json()["email"] == PARENT_EMAIL.lower()


def test_me_no_token(s):
    r = s.get(f"{API}/auth/me")
    assert r.status_code == 401


# ---------- Astrology (LLM, slow) ----------
def test_astrology_niche(s):
    r = s.post(f"{API}/astrology/niche",
               headers={"Authorization": f"Bearer {state['parent_token']}"},
               json={"name": "Aanya", "place": "Mumbai, India",
                     "date_of_birth": "2015-07-10", "time_of_birth": "08:30"},
               timeout=90)
    assert r.status_code == 200, r.text
    d = r.json()
    for k in ("niche", "traits", "career_paths", "summary", "sun_sign", "whatsapp_link"):
        assert k in d, f"missing {k}"
    assert isinstance(d["traits"], list) and len(d["traits"]) >= 1
    assert isinstance(d["career_paths"], list) and len(d["career_paths"]) >= 1
    assert d["whatsapp_link"].startswith("https://wa.me/")
    assert d["sun_sign"] == "Cancer"


def test_astrology_history(s):
    r = s.get(f"{API}/astrology/history",
              headers={"Authorization": f"Bearer {state['parent_token']}"})
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list) and len(items) >= 1


def test_astrology_unauth(s):
    r = s.post(f"{API}/astrology/niche", json={
        "name": "X", "place": "Y", "date_of_birth": "2015-01-01", "time_of_birth": "12:00"})
    assert r.status_code == 401


# ---------- Recommendations ----------
def test_recommendations(s):
    r = s.post(f"{API}/recommendations",
               headers={"Authorization": f"Bearer {state['parent_token']}"},
               json={"subject": "Mathematics", "age": 10}, timeout=90)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["subject"] == "Mathematics" and d["age"] == 10
    assert len(d["books"]) >= 1
    assert len(d["links"]) >= 1
    assert len(d["activities"]) >= 1
    # Structure check
    assert all("title" in b and "author" in b for b in d["books"])
    assert all("url" in l for l in d["links"])
    assert all("duration_minutes" in a for a in d["activities"])


# ---------- Students RBAC ----------
def test_parent_cannot_create_student(s):
    r = s.post(f"{API}/students",
               headers={"Authorization": f"Bearer {state['parent_token']}"},
               json={"name": "X", "grade": "5", "age": 10, "subject_focus": "Math"})
    assert r.status_code == 403


def test_teacher_creates_and_lists_students(s):
    r = s.post(f"{API}/students",
               headers={"Authorization": f"Bearer {state['teacher_token']}"},
               json={"name": "TEST_Student1", "grade": "5", "age": 10, "subject_focus": "Math"})
    assert r.status_code == 200, r.text
    state["student_id"] = r.json()["id"]

    r2 = s.get(f"{API}/students",
               headers={"Authorization": f"Bearer {state['teacher_token']}"})
    assert r2.status_code == 200
    ids = [x["id"] for x in r2.json()]
    assert state["student_id"] in ids


def test_principal_sees_all_students(s):
    r = s.get(f"{API}/students",
              headers={"Authorization": f"Bearer {state['principal_token']}"})
    assert r.status_code == 200
    ids = [x["id"] for x in r.json()]
    assert state["student_id"] in ids


def test_teacher_deletes_student(s):
    r = s.delete(f"{API}/students/{state['student_id']}",
                 headers={"Authorization": f"Bearer {state['teacher_token']}"})
    assert r.status_code == 200
    # verify removal
    r2 = s.delete(f"{API}/students/{state['student_id']}",
                  headers={"Authorization": f"Bearer {state['teacher_token']}"})
    assert r2.status_code == 404


# ---------- Analytics (principal only) ----------
def test_analytics_principal(s):
    r = s.get(f"{API}/analytics/overview",
              headers={"Authorization": f"Bearer {state['principal_token']}"})
    assert r.status_code == 200
    d = r.json()
    for k in ("total_users", "total_parents", "total_teachers", "total_principals",
              "total_students", "total_astrology_consults", "grade_distribution"):
        assert k in d
    assert isinstance(d["grade_distribution"], list)


def test_analytics_forbidden_for_parent(s):
    r = s.get(f"{API}/analytics/overview",
              headers={"Authorization": f"Bearer {state['parent_token']}"})
    assert r.status_code == 403


def test_analytics_forbidden_for_teacher(s):
    r = s.get(f"{API}/analytics/overview",
              headers={"Authorization": f"Bearer {state['teacher_token']}"})
    assert r.status_code == 403
