import sqlite3

conn = sqlite3.connect('c:/NIT KKR/after placement/open code/neurohack/backend/aranya_sentinel.db')
conn.row_factory = sqlite3.Row

# Order respect foreign keys
tables = ['aois', 'analysis_runs', 'disturbances', 'external_alerts', 'drone_media', 'incidents', 'audit_events', 'reports']

with open('c:/NIT KKR/after placement/open code/neurohack/backend/seed_supabase.sql', 'w', encoding='utf-8') as f:
    for t in tables:
        rows = conn.cursor().execute(f'SELECT * FROM {t}').fetchall()
        for r in rows:
            d = dict(r)
            cols = ', '.join(d.keys())
            vals = []
            for v in d.values():
                if v is None:
                    vals.append('NULL')
                elif isinstance(v, (int, float)):
                    vals.append(str(v))
                else:
                    escaped = str(v).replace("'", "''")
                    vals.append(f"'{escaped}'")
            val_str = ', '.join(vals)
            f.write(f'INSERT INTO {t} ({cols}) VALUES ({val_str}) ON CONFLICT (id) DO NOTHING;\n')

print('Seed SQL generated successfully')
