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



# ===================================================================
# Children CRUD + RBAC (iteration 3)
# ===================================================================
def test_children_create_parent(s):
    r = s.post(f"{API}/children",
               headers=_auth(state["parent_token"]),
               json={"name": "TEST_Aarav", "date_of_birth": "2016-03-12",
                     "grade": "3", "age": 8, "notes": "Loves science"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == "TEST_Aarav"
    assert data["parent_id"]
    assert data["age"] == 8
    assert data["grade"] == "3"
    assert "id" in data
    state["child_id"] = data["id"]


def test_children_create_teacher_forbidden(s):
    r = s.post(f"{API}/children",
               headers=_auth(state["teacher_token"]),
               json={"name": "TEST_NotAllowed"})
    assert r.status_code == 403


def test_children_list_parent_sees_own(s):
    r = s.get(f"{API}/children", headers=_auth(state["parent_token"]))
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert any(c["id"] == state["child_id"] for c in data)


def test_children_list_principal_sees_all(s):
    r = s.get(f"{API}/children", headers=_auth(state["principal_token"]))
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    # Principal sees parent's child
    assert any(c["id"] == state["child_id"] for c in data)


def test_children_list_teacher_forbidden(s):
    r = s.get(f"{API}/children", headers=_auth(state["teacher_token"]))
    assert r.status_code == 403


def test_children_patch_parent(s):
    r = s.patch(f"{API}/children/{state['child_id']}",
                headers=_auth(state["parent_token"]),
                json={"grade": "4", "age": 9})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["grade"] == "4"
    assert data["age"] == 9
    # Verify persistence via GET list
    r2 = s.get(f"{API}/children", headers=_auth(state["parent_token"]))
    assert any(c["id"] == state["child_id"] and c["grade"] == "4" for c in r2.json())


def test_children_patch_other_parent_404(s):
    # Register another parent
    other_email = f"TEST_other_parent_{TS}@edusense.com"
    rr = s.post(f"{API}/auth/register", json={
        "name": "Other Parent", "email": other_email, "password": PASS, "role": "parent"})
    assert rr.status_code == 200
    other_token = rr.json()["token"]
    state["other_parent_token"] = other_token
    # Other parent tries to patch the first parent's child -> 404 (filtered by parent_id)
    r = s.patch(f"{API}/children/{state['child_id']}",
                headers=_auth(other_token),
                json={"grade": "5"})
    assert r.status_code == 404


def test_children_delete_other_parent_404(s):
    r = s.delete(f"{API}/children/{state['child_id']}",
                 headers=_auth(state["other_parent_token"]))
    assert r.status_code == 404


# ===================================================================
# child_id linkage on astrology
# ===================================================================
def test_astrology_with_child_id(s):
    r = s.post(f"{API}/astrology/niche",
               headers=_auth(state["parent_token"]),
               json={"name": "TEST_Aarav", "place": "Pune",
                     "date_of_birth": "2016-03-12", "time_of_birth": "10:30",
                     "child_id": state["child_id"]})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("child_id") == state["child_id"]
    assert data.get("sun_sign")


def test_astrology_history_filter_child_id(s):
    r = s.get(f"{API}/astrology/history?child_id={state['child_id']}",
              headers=_auth(state["parent_token"]))
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    assert all(it.get("child_id") == state["child_id"] for it in items)


# ===================================================================
# child_id linkage on sentiment records
# ===================================================================
def test_sentiment_record_with_child_id(s):
    r = s.post(f"{API}/sentiment/records",
               headers=_auth(state["parent_token"]),
               json={"kind": "journal",
                     "text": "TEST_child_link Aarav had a wonderful day at school today.",
                     "child_id": state["child_id"]})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("child_id") == state["child_id"]
    state["parent_child_record_id"] = data["id"]


def test_sentiment_records_filter_child_id(s):
    r = s.get(f"{API}/sentiment/records?child_id={state['child_id']}",
              headers=_auth(state["parent_token"]))
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    assert all(it.get("child_id") == state["child_id"] for it in items)


# ===================================================================
# Sentiment trend
# ===================================================================
def test_sentiment_trend_default_30(s):
    r = s.get(f"{API}/sentiment/trend",
              headers=_auth(state["principal_token"]))
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["days"] == 30
    assert isinstance(data["series"], list)
    assert len(data["series"]) == 30
    sample = data["series"][0]
    for k in ("date", "positive", "neutral", "negative", "mixed",
              "total", "avg_polarity", "avg_likert"):
        assert k in sample, f"Missing key {k}"


def test_sentiment_trend_days_7(s):
    r = s.get(f"{API}/sentiment/trend?days=7",
              headers=_auth(state["principal_token"]))
    assert r.status_code == 200
    data = r.json()
    assert data["days"] == 7
    assert len(data["series"]) == 7


def test_sentiment_trend_teacher_allowed(s):
    r = s.get(f"{API}/sentiment/trend?days=14",
              headers=_auth(state["teacher_token"]))
    assert r.status_code == 200
    assert len(r.json()["series"]) == 14


def test_sentiment_trend_parent_allowed(s):
    # iter5: parent is now allowed and scoped to own records
    r = s.get(f"{API}/sentiment/trend",
              headers=_auth(state["parent_token"]))
    assert r.status_code == 200
    data = r.json()
    assert data["days"] == 30
    assert "kind" in data and "child_id" in data
    assert len(data["series"]) == 30


def test_sentiment_trend_days_out_of_range(s):
    r = s.get(f"{API}/sentiment/trend?days=181",
              headers=_auth(state["principal_token"]))
    assert r.status_code == 422
    r2 = s.get(f"{API}/sentiment/trend?days=0",
               headers=_auth(state["principal_token"]))
    assert r2.status_code == 422


# Iter4: Aggregation correctness — created sentiment record for today must reflect in days=1 bucket.
def test_sentiment_trend_aggregation_today_bucket(s):
    # Create a record as parent (positive, will land in today's bucket)
    r = s.post(f"{API}/sentiment/records",
               headers=_auth(state["parent_token"]),
               json={"kind": "feedback",
                     "text": "TEST_AGG_TODAY: My child had an absolutely wonderful, joyful, fantastic day learning."},
               timeout=120)
    assert r.status_code == 200, r.text
    rec_id = r.json()["id"]
    rec_sent = r.json()["result"]["sentiment"]
    try:
        # days=1 -> single bucket = today
        r2 = s.get(f"{API}/sentiment/trend?days=1",
                   headers=_auth(state["principal_token"]))
        assert r2.status_code == 200
        data = r2.json()
        assert data["days"] == 1
        assert len(data["series"]) == 1
        bucket = data["series"][0]
        # Today's bucket must include our newly created record
        assert bucket["total"] >= 1
        assert bucket[rec_sent] >= 1
    finally:
        s.delete(f"{API}/sentiment/records/{rec_id}",
                 headers=_auth(state["parent_token"]))


# ===================================================================
# Analytics overview includes total_children
# ===================================================================
def test_analytics_includes_total_children(s):
    r = s.get(f"{API}/analytics/overview",
              headers=_auth(state["principal_token"]))
    assert r.status_code == 200
    data = r.json()
    assert "total_children" in data
    assert isinstance(data["total_children"], int)
    assert data["total_children"] >= 1  # at least our test child


# ===================================================================
# Children delete (cleanup)
# ===================================================================
def test_children_delete_parent_own(s):
    # First cleanup the linked sentiment record
    if state.get("parent_child_record_id"):
        s.delete(f"{API}/sentiment/records/{state['parent_child_record_id']}",
                 headers=_auth(state["parent_token"]))
    r = s.delete(f"{API}/children/{state['child_id']}",
                 headers=_auth(state["parent_token"]))
    assert r.status_code == 200
    # GET should no longer return it
    r2 = s.get(f"{API}/children", headers=_auth(state["parent_token"]))
    assert not any(c["id"] == state["child_id"] for c in r2.json())


# ===================================================================
# Iter 5 — Schools multi-tenancy + subscription (MOCKED)
# ===================================================================
def test_schools_me_principal_demo(s):
    r = s.get(f"{API}/schools/me", headers=_auth(state["principal_token"]))
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["code"] == "DEMO01"
    assert d["name"] == "EDUSENSE Demo"
    assert d["plan"] in ("free", "pro")
    assert isinstance(d.get("member_count"), int)
    assert isinstance(d.get("student_count"), int)
    assert d["member_count"] >= 1
    state["demo_school_plan"] = d["plan"]
    state["demo_school_id"] = d["id"]


def test_schools_join_bad_code(s):
    # parent already in demo school → first leave (parent is in DEMO01 from earlier auto-assign)
    # Actually parent has been auto-assigned via require_user_school in earlier sentiment tests.
    # So join with bad code should still 400 (already in school) or 404. Use a fresh user instead.
    fresh_email = f"TEST_join_{TS}_a@edusense.com"
    rr = s.post(f"{API}/auth/register", json={
        "name": "Join A", "email": fresh_email, "password": PASS, "role": "teacher"})
    assert rr.status_code == 200
    tk = rr.json()["token"]
    r = s.post(f"{API}/schools/join", headers=_auth(tk), json={"code": "ZZZZZZ"})
    assert r.status_code == 404
    state["fresh_join_token"] = tk
    state["fresh_join_email"] = fresh_email


def test_schools_join_principal_forbidden(s):
    r = s.post(f"{API}/schools/join", headers=_auth(state["principal_token"]),
               json={"code": "DEMO01"})
    assert r.status_code == 400


def test_schools_join_valid_demo(s):
    r = s.post(f"{API}/schools/join", headers=_auth(state["fresh_join_token"]),
               json={"code": "DEMO01"})
    assert r.status_code == 200, r.text
    assert r.json()["code"] == "DEMO01"


def test_schools_create_principal_already_has_school(s):
    # Pre-seeded principal already manages DEMO01
    r = s.post(f"{API}/schools", headers=_auth(state["principal_token"]),
               json={"name": "Should Fail"})
    assert r.status_code == 400


def test_schools_create_new_principal_school_b(s):
    """Register a NEW principal with no prior school, then create School B."""
    p_email = f"TEST_principalB_{TS}@edusense.com"
    rr = s.post(f"{API}/auth/register", json={
        "name": "Principal B", "email": p_email, "password": PASS, "role": "principal"})
    assert rr.status_code == 200
    pb_token = rr.json()["token"]
    state["principalB_token"] = pb_token

    r = s.post(f"{API}/schools", headers=_auth(pb_token),
               json={"name": "TEST School B"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["name"] == "TEST School B"
    assert len(d["code"]) == 6
    assert d["code"].isupper() or any(c.isdigit() for c in d["code"])
    assert d["plan"] == "free"
    assert d["student_limit"] == 30
    state["schoolB_id"] = d["id"]
    state["schoolB_code"] = d["code"]


def test_schools_subscribe_mocked_pro(s):
    """Use principal B (free) to subscribe → flips to pro 30d, student_limit large."""
    r = s.post(f"{API}/schools/subscribe", headers=_auth(state["principalB_token"]))
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["plan"] == "pro"
    assert d["subscription_status"] == "active"
    assert d["current_period_end"] is not None
    assert d["student_limit"] >= 100000

    # Verify via /schools/me
    r2 = s.get(f"{API}/schools/me", headers=_auth(state["principalB_token"]))
    assert r2.status_code == 200
    assert r2.json()["plan"] == "pro"


def test_schools_isolation_school_a_vs_b(s):
    """Teacher in DEMO01 creates a student; principalB GET /students sees nothing of A's."""
    # Create student as the existing TEST teacher (in DEMO01 via auto-assign)
    rs = s.post(f"{API}/students", headers=_auth(state["teacher_token"]),
                json={"name": "TEST_IsoStudent", "grade": "5", "age": 11, "subject_focus": "Sci"})
    assert rs.status_code == 200, rs.text
    iso_id = rs.json()["id"]
    state["iso_student_id"] = iso_id

    # principalB lists students -> empty (different school)
    r = s.get(f"{API}/students", headers=_auth(state["principalB_token"]))
    assert r.status_code == 200
    ids = [x["id"] for x in r.json()]
    assert iso_id not in ids, "School isolation breach"

    # teacher_token sees own
    rt = s.get(f"{API}/students", headers=_auth(state["teacher_token"]))
    ids2 = [x["id"] for x in rt.json()]
    assert iso_id in ids2

    # Cleanup
    s.delete(f"{API}/students/{iso_id}", headers=_auth(state["teacher_token"]))


def test_schools_leave_principal_forbidden(s):
    r = s.delete(f"{API}/schools/leave", headers=_auth(state["principal_token"]))
    assert r.status_code == 400


def test_schools_leave_teacher_ok(s):
    # fresh_join_token teacher is in DEMO01
    r = s.delete(f"{API}/schools/leave", headers=_auth(state["fresh_join_token"]))
    assert r.status_code == 200
    assert r.json().get("ok") is True


# ===================================================================
# Iter 5 — Trend kind + child_id filters
# ===================================================================
def test_sentiment_trend_kind_filter(s):
    r = s.get(f"{API}/sentiment/trend?days=7&kind=feedback",
              headers=_auth(state["principal_token"]))
    assert r.status_code == 200
    d = r.json()
    assert d["kind"] == "feedback"
    assert d["days"] == 7
    assert len(d["series"]) == 7


def test_sentiment_trend_child_id_filter_parent(s):
    # Create a child + sentiment record for that child
    rc = s.post(f"{API}/children", headers=_auth(state["parent_token"]),
                json={"name": "TEST_TrendChild", "grade": "2", "age": 7})
    assert rc.status_code == 200
    cid = rc.json()["id"]
    state["trend_child_id"] = cid
    rr = s.post(f"{API}/sentiment/records", headers=_auth(state["parent_token"]),
                json={"kind": "journal",
                      "text": "TEST_TC: today was a happy productive day for my child.",
                      "child_id": cid}, timeout=120)
    assert rr.status_code == 200, rr.text
    rec_id = rr.json()["id"]
    state["trend_child_rec_id"] = rec_id

    # Parent trend with child_id filter -> non-zero today bucket
    rt = s.get(f"{API}/sentiment/trend?days=1&child_id={cid}",
               headers=_auth(state["parent_token"]))
    assert rt.status_code == 200
    data = rt.json()
    assert data["child_id"] == cid
    assert data["series"][0]["total"] >= 1

    # Cleanup
    s.delete(f"{API}/sentiment/records/{rec_id}", headers=_auth(state["parent_token"]))
    s.delete(f"{API}/children/{cid}", headers=_auth(state["parent_token"]))

