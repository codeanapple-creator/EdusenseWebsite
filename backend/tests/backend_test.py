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



# ---------- Sentiment Analysis (Tiwari 2024 hybrid lexicon+ML) ----------
NRC_KEYS = {"anger", "anticipation", "disgust", "fear", "joy", "sadness", "surprise", "trust"}


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_sentiment_analyze_unauth(s):
    r = s.post(f"{API}/sentiment/analyze", json={"text": "Great class today"})
    assert r.status_code == 401


def test_sentiment_records_unauth(s):
    r = s.get(f"{API}/sentiment/records")
    assert r.status_code == 401


def test_sentiment_summary_unauth(s):
    r = s.get(f"{API}/sentiment/summary")
    assert r.status_code == 401


def test_sentiment_analyze_schema(s):
    text = ("My daughter loved the science activity today. She participated actively, "
            "shared materials with friends, and showed great curiosity. The teacher was patient and engaging.")
    r = s.post(f"{API}/sentiment/analyze",
               headers=_auth(state["parent_token"]),
               json={"text": text}, timeout=120)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["sentiment"] in ("positive", "negative", "neutral", "mixed")
    assert -1.0 <= d["polarity_score"] <= 1.0
    assert 0.0 <= d["likert_score"] <= 5.0
    assert 0.0 <= d["confidence"] <= 1.0
    # NRC: all 8 keys present, values in [0,1]
    assert set(d["nrc_emotions"].keys()) == NRC_KEYS, f"NRC keys mismatch: {d['nrc_emotions'].keys()}"
    for k, v in d["nrc_emotions"].items():
        assert 0.0 <= v <= 1.0, f"{k}={v}"
    assert 0.0 <= d["satisfaction_score"] <= 1.0
    assert 0.0 <= d["dissatisfaction_score"] <= 1.0
    assert isinstance(d["aspects"], dict)
    assert isinstance(d["key_themes"], list)
    assert isinstance(d["summary"], str) and len(d["summary"]) > 0
    # for the strongly positive example, expect positive-leaning
    assert d["sentiment"] in ("positive", "mixed")
    state["pos_polarity"] = d["polarity_score"]


def test_sentiment_records_create_parent(s):
    r = s.post(f"{API}/sentiment/records",
               headers=_auth(state["parent_token"]),
               json={"kind": "feedback",
                     "text": "TEST_PARENT_FB: My child enjoyed the math lesson and felt confident.",
                     "subject_name": "Aanya"}, timeout=120)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["kind"] == "feedback"
    assert d["user_role"] == "parent"
    assert d["user_name"] == "Parent Test"
    assert "result" in d and "nrc_emotions" in d["result"]
    state["parent_record_id"] = d["id"]


def test_sentiment_records_create_teacher_journal(s):
    r = s.post(f"{API}/sentiment/records",
               headers=_auth(state["teacher_token"]),
               json={"kind": "journal",
                     "text": "TEST_TEACHER_JOURNAL: Student struggled with fractions but improved by end of class.",
                     "subject_name": "Rahul"}, timeout=120)
    assert r.status_code == 200, r.text
    state["teacher_record_id"] = r.json()["id"]


def test_sentiment_records_create_principal_note(s):
    r = s.post(f"{API}/sentiment/records",
               headers=_auth(state["principal_token"]),
               json={"kind": "teacher_note",
                     "text": "TEST_PRINCIPAL_NOTE: Faculty meeting was productive and collaborative."},
               timeout=120)
    assert r.status_code == 200, r.text
    state["principal_record_id"] = r.json()["id"]


def test_sentiment_records_visibility_parent(s):
    r = s.get(f"{API}/sentiment/records", headers=_auth(state["parent_token"]))
    assert r.status_code == 200
    items = r.json()
    user_ids = {x["user_id"] for x in items}
    # parent must see only own records
    assert all(x["user_role"] == "parent" for x in items)
    assert len(user_ids) <= 1


def test_sentiment_records_visibility_teacher(s):
    r = s.get(f"{API}/sentiment/records", headers=_auth(state["teacher_token"]))
    assert r.status_code == 200
    items = r.json()
    ids = {x["id"] for x in items}
    # teacher sees own + parent feedback + journals
    assert state["teacher_record_id"] in ids
    assert state["parent_record_id"] in ids  # parent feedback visible
    # principal's teacher_note should NOT be visible to teacher (not own, not feedback/journal)
    assert state["principal_record_id"] not in ids


def test_sentiment_records_visibility_principal(s):
    r = s.get(f"{API}/sentiment/records", headers=_auth(state["principal_token"]))
    assert r.status_code == 200
    items = r.json()
    ids = {x["id"] for x in items}
    assert state["parent_record_id"] in ids
    assert state["teacher_record_id"] in ids
    assert state["principal_record_id"] in ids


def test_sentiment_records_kind_filter(s):
    r = s.get(f"{API}/sentiment/records?kind=feedback", headers=_auth(state["principal_token"]))
    assert r.status_code == 200
    items = r.json()
    assert all(x["kind"] == "feedback" for x in items)
    assert any(x["id"] == state["parent_record_id"] for x in items)


def test_sentiment_summary_parent_forbidden(s):
    r = s.get(f"{API}/sentiment/summary", headers=_auth(state["parent_token"]))
    assert r.status_code == 403


def test_sentiment_summary_teacher_ok(s):
    r = s.get(f"{API}/sentiment/summary", headers=_auth(state["teacher_token"]))
    assert r.status_code == 200
    d = r.json()
    assert "total_records" in d and isinstance(d["total_records"], int)
    assert "overall" in d and set(["positive", "neutral", "negative", "mixed"]).issubset(d["overall"].keys())
    assert "by_kind" in d and isinstance(d["by_kind"], dict)
    assert d["total_records"] >= 3


def test_sentiment_summary_principal_ok(s):
    r = s.get(f"{API}/sentiment/summary", headers=_auth(state["principal_token"]))
    assert r.status_code == 200
    d = r.json()
    assert d["total_records"] >= 3


def test_sentiment_delete_non_owner_forbidden(s):
    # parent trying to delete teacher's record -> 404 (filtered by owner)
    r = s.delete(f"{API}/sentiment/records/{state['teacher_record_id']}",
                 headers=_auth(state["parent_token"]))
    assert r.status_code == 404


def test_sentiment_delete_owner(s):
    r = s.delete(f"{API}/sentiment/records/{state['parent_record_id']}",
                 headers=_auth(state["parent_token"]))
    assert r.status_code == 200
    # confirm gone
    r2 = s.delete(f"{API}/sentiment/records/{state['parent_record_id']}",
                  headers=_auth(state["parent_token"]))
    assert r2.status_code == 404


def test_sentiment_delete_principal_any(s):
    # principal deletes teacher's record
    r = s.delete(f"{API}/sentiment/records/{state['teacher_record_id']}",
                 headers=_auth(state["principal_token"]))
    assert r.status_code == 200
    # cleanup principal's own record
    s.delete(f"{API}/sentiment/records/{state['principal_record_id']}",
             headers=_auth(state["principal_token"]))


def test_sentiment_analyze_validation(s):
    r = s.post(f"{API}/sentiment/analyze",
               headers=_auth(state["parent_token"]),
               json={"text": "ab"})  # too short (<3)
    assert r.status_code == 422
