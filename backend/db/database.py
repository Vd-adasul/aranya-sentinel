import os
import sqlite3
from contextlib import contextmanager
from core.config import settings

DATABASE_URL = os.environ.get("DATABASE_URL")
IS_POSTGRES = bool(DATABASE_URL and (DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")))

pg_url = None
if IS_POSTGRES:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    pg_url = DATABASE_URL
    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql://", 1)

def get_connection():
    if IS_POSTGRES:
        conn = psycopg2.connect(pg_url)
        return conn
    else:
        conn = sqlite3.connect(settings.db_path, timeout=10.0, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def _adapt_query(query: str) -> str:
    if IS_POSTGRES:
        return query.replace("?", "%s")
    return query

def query_all(query: str, params: tuple = ()):
    query = _adapt_query(query)
    with get_db() as conn:
        if IS_POSTGRES:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                return [dict(row) for row in cursor.fetchall()]
        else:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

def query_one(query: str, params: tuple = ()):
    query = _adapt_query(query)
    with get_db() as conn:
        if IS_POSTGRES:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                row = cursor.fetchone()
                return dict(row) if row else None
        else:
            cursor = conn.cursor()
            cursor.execute(query, params)
            row = cursor.fetchone()
            return dict(row) if row else None

def execute_stmt(stmt: str, params: tuple = ()):
    stmt = _adapt_query(stmt)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(stmt, params)
        if not IS_POSTGRES:
            return cursor.lastrowid
        return None
