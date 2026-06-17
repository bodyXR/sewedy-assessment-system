import pyodbc

cs = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=db46809.public.databaseasp.net;DATABASE=db46809;UID=db46809;PWD=N-m5tS8!F?g3;Encrypt=yes;TrustServerCertificate=yes"
conn = pyodbc.connect(cs)
cur = conn.cursor()

print("=== Status rows with BusinessEntity ===")
cur.execute("SELECT Id, StatusName, BusinessEntity FROM Status WHERE BusinessEntity IS NOT NULL ORDER BY Id")
for r in cur.fetchall():
    print(f"  Id={r[0]}  StatusName={r[1]}  BusinessEntity={r[2]}")

print("\n=== All Status rows (first 30) ===")
cur.execute("SELECT TOP 30 Id, StatusName, BusinessEntity FROM Status ORDER BY Id")
for r in cur.fetchall():
    print(f"  Id={r[0]}  StatusName={r[1]}  BusinessEntity={r[2]}")

print("\n=== Courses sample (first 5) ===")
cur.execute("SELECT TOP 5 Id, Title, LevelStatusId FROM Courses")
for r in cur.fetchall():
    print(f"  Id={r[0]}  Title={r[1]}  LevelStatusId={r[2]}")

conn.close()
