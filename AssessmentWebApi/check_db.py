import pyodbc

cs = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=db46809.public.databaseasp.net;DATABASE=db46809;UID=db46809;PWD=N-m5tS8!F?g3;Encrypt=yes;TrustServerCertificate=yes"
conn = pyodbc.connect(cs)
cur = conn.cursor()

print("=== Courses columns ===")
cur.execute("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Courses' ORDER BY ORDINAL_POSITION")
for row in cur.fetchall(): print(f"  {row[0]} ({row[1]})")

print("\n=== CourseRound columns ===")
cur.execute("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='CourseRound' ORDER BY ORDINAL_POSITION")
for row in cur.fetchall(): print(f"  {row[0]} ({row[1]})")

print("\n=== Sample Courses rows ===")
cur.execute("SELECT TOP 5 * FROM Courses")
cols = [d[0] for d in cur.description]
for row in cur.fetchall(): print("  " + " | ".join(f"{cols[i]}={row[i]}" for i in range(len(cols))))

conn.close()
