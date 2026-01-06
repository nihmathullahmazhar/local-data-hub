<?php
// server/db.php

$servername = "127.0.0.1";
$username = "root";
$password = "root"; // default MAMP password
$dbname   = "crm";
$port     = 8889;   // MAMP MySQL port (change if yours is different)

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to UTF-8
$conn->set_charset("utf8mb4");

// Return connection for use in other files
return $conn;
?>