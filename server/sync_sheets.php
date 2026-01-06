<?php
// server/sync_sheets.php
// This endpoint syncs data to Google Sheets via Apps Script

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Your Google Apps Script Web App URL
$GOOGLE_SCRIPT_URL = ""; // Set your Google Apps Script URL here

$conn = require_once 'db.php';

// Fetch all leads
$result = $conn->query("SELECT * FROM leads ORDER BY id DESC");

$leads = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $leads[] = $row;
    }
}

$conn->close();

if (empty($GOOGLE_SCRIPT_URL)) {
    echo json_encode(['success' => false, 'error' => 'Google Script URL not configured']);
    exit;
}

// Send to Google Sheets
$ch = curl_init($GOOGLE_SCRIPT_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($leads));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode(['success' => true, 'synced' => count($leads)]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to sync', 'httpCode' => $httpCode]);
}
?>