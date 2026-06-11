import json
import os
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

SCHEMA = "t_p76073717_android_database_man"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """CRUD для таблицы ДСЕ — получение, добавление, удаление записей."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        return handle_get(event)
    if method == "POST":
        return handle_post(event)
    if method == "DELETE":
        return handle_delete(event)

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}


def handle_get(event):
    params = event.get("queryStringParameters") or {}
    search = params.get("search", "").strip()
    date_from = params.get("date_from", "").strip()
    date_to = params.get("date_to", "").strip()

    conditions = []
    values = []

    if search:
        conditions.append(
            "(designation ILIKE %s OR name ILIKE %s)"
        )
        values.extend([f"%{search}%", f"%{search}%"])
    if date_from:
        conditions.append("work_date >= %s")
        values.append(date_from)
    if date_to:
        conditions.append("work_date <= %s")
        values.append(date_to)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    sql = f"""
        SELECT id, number, designation, name, grade, hours,
               to_char(work_date, 'YYYY-MM-DD') AS work_date, order_num, created_at
        FROM {SCHEMA}.dse_records
        {where}
        ORDER BY created_at DESC
    """

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(sql, values)
    cols = [d[0] for d in cur.description]
    rows = [dict(zip(cols, row)) for row in cur.fetchall()]
    for r in rows:
        if r.get("created_at"):
            r["created_at"] = str(r["created_at"])
    cur.close()
    conn.close()

    return {"statusCode": 200, "headers": CORS, "body": json.dumps(rows, ensure_ascii=False, cls=DecimalEncoder)}


def handle_post(event):
    body = json.loads(event.get("body") or "{}")
    number = body.get("number", "").strip()
    name = body.get("name", "").strip()
    if not name:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "name обязателен"})}

    designation = body.get("designation", "").strip() or None
    grade = body.get("grade") or None
    hours = body.get("hours") or None
    work_date = body.get("work_date") or None
    order_num = body.get("order_num", "").strip() or None

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""
        INSERT INTO {SCHEMA}.dse_records (number, designation, name, grade, hours, work_date, order_num)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, number, designation, name, grade, hours,
                  to_char(work_date, 'YYYY-MM-DD') AS work_date, order_num, created_at
        """,
        (number, designation, name, grade, hours, work_date, order_num),
    )
    cols = [d[0] for d in cur.description]
    row = dict(zip(cols, cur.fetchone()))
    if row.get("created_at"):
        row["created_at"] = str(row["created_at"])
    conn.commit()
    cur.close()
    conn.close()

    return {"statusCode": 201, "headers": CORS, "body": json.dumps(row, ensure_ascii=False, cls=DecimalEncoder)}


def handle_delete(event):
    params = event.get("queryStringParameters") or {}
    record_id = params.get("id")
    if not record_id:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id обязателен"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.dse_records WHERE id = %s", (int(record_id),))
    conn.commit()
    cur.close()
    conn.close()

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}