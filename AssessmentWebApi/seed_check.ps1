$cs = "Server=db46809.public.databaseasp.net; Database=db46809; User Id=db46809; Password=N-m5tS8!F?g3; Encrypt=True; TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($cs)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Account' ORDER BY ORDINAL_POSITION"
$r = $cmd.ExecuteReader()
while ($r.Read()) { Write-Host $r[0] }
$r.Close()
$conn.Close()
