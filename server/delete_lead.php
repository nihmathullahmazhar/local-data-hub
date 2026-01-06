<?php
// server/delete_lead.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$conn = require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['id'])) {
    echo json_encode(['success' => false, 'error' => 'Lead ID required']);
    exit;
}

$id = (int)$input['id'];

$stmt = $conn->prepare("DELETE FROM leads WHERE id = ?");
$stmt->bind_param('i', $id);
$result = $stmt->execute();

if ($result && $stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'id' => $id]);
} else {
    echo json_encode(['success' => false, 'error' => 'Lead not found or already deleted']);
}

$stmt->close();
$conn->close();
?>