$cs = "Server=db46809.public.databaseasp.net; Database=db46809; User Id=db46809; Password=N-m5tS8!F?g3; Encrypt=True; TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($cs)
$conn.Open()

Write-Host "=== Courses columns ==="
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Courses' ORDER BY ORDINAL_POSITION"
$r = $cmd.ExecuteReader()
while($r.Read()){ Write-Host "  $($r[0]) ($($r[1]))" }
$r.Close()

Write-Host "=== CourseRound columns ==="
$cmd2 = $conn.CreateCommand()
$cmd2.CommandText = "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'CourseRound' ORDER BY ORDINAL_POSITION"
$r2 = $cmd2.ExecuteReader()
while($r2.Read()){ Write-Host "  $($r2[0]) ($($r2[1]))" }
$r2.Close()

Write-Host "=== Sample Courses rows ==="
$cmd3 = $conn.CreateCommand()
$cmd3.CommandText = "SELECT TOP 5 * FROM Courses"
$r3 = $cmd3.ExecuteReader()
while($r3.Read()){
    $row = @()
    for($i=0; $i -lt $r3.FieldCount; $i++){ $row += "$($r3.GetName($i))=$($r3[$i])" }
    Write-Host "  $($row -join ' | ')"
}
$r3.Close()

$conn.Close()
