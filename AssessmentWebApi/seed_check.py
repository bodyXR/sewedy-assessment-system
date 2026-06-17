import pyodbc

cs = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=db46809.public.databaseasp.net;DATABASE=db46809;UID=db46809;PWD=N-m5tS8!F?g3;Encrypt=yes;TrustServerCertificate=yes"
conn = pyodbc.connect(cs)
cur = conn.cursor()

print("=== Roles (Assessment) ===")
cur.execute("SELECT Id, RoleName, BusinessEntity FROM Roles WHERE BusinessEntity = 'Assessment' ORDER BY Id")
for r in cur.fetchall(): print(f"  {r[0]} | {r[1]} | {r[2]}")

print("\n=== Statuses (Assessment) ===")
cur.execute("SELECT Id, StatusName, BusinessEntity FROM Status WHERE BusinessEntity = 'Assessment' ORDER BY Id")
for r in cur.fetchall(): print(f"  {r[0]} | {r[1]} | {r[2]}")

print("\n=== Existing Assessment accounts (top 5) ===")
cur.execute("""
    SELECT TOP 5 a.Id, a.FullNameEn, a.Email, r.RoleName
    FROM Account a LEFT JOIN Roles r ON a.RoleId = r.Id
    WHERE r.BusinessEntity = 'Assessment' OR a.RoleId IS NULL
    ORDER BY a.Id DESC
""")
for r in cur.fetchall(): print(f"  {r[0]} | {r[1]} | {r[2]} | {r[3]}")

print("\n=== MAX Account ID ===")
cur.execute("SELECT MAX(Id) FROM Account")
print(f"  {cur.fetchone()[0]}")

print("\n=== Tbl_Class (first 10) ===")
cur.execute("SELECT TOP 10 Id, ClassName FROM Tbl_Class ORDER BY Id")
for r in cur.fetchall(): print(f"  {r[0]} | {r[1]}")

conn.close()
print("\nDone.")
