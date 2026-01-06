<?php
// server/save_lead.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$conn = require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

// Convert camelCase to snake_case
function toSnakeCase($input) {
    return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $input));
}

// Prepare data
$data = [];
foreach ($input as $key => $value) {
    $snakeKey = toSnakeCase($key);
    
    // Handle arrays (JSON encode them)
    if (is_array($value)) {
        $data[$snakeKey] = json_encode($value);
    } elseif (is_bool($value)) {
        $data[$snakeKey] = $value ? 1 : 0;
    } else {
        $data[$snakeKey] = $value;
    }
}

// Check if updating or inserting
if (isset($data['id']) && $data['id']) {
    // Update existing lead
    $id = $data['id'];
    unset($data['id']);
    
    $setParts = [];
    $types = '';
    $values = [];
    
    foreach ($data as $key => $value) {
        $setParts[] = "`$key` = ?";
        $types .= is_int($value) ? 'i' : (is_float($value) ? 'd' : 's');
        $values[] = $value;
    }
    
    $values[] = $id;
    $types .= 'i';
    
    $sql = "UPDATE leads SET " . implode(', ', $setParts) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param($types, ...$values);
        $result = $stmt->execute();
        
        if ($result) {
            echo json_encode(['success' => true, 'id' => $id, 'action' => 'updated']);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
} else {
    // Insert new lead
    unset($data['id']);
    
    $columns = array_keys($data);
    $placeholders = array_fill(0, count($columns), '?');
    $types = '';
    $values = [];
    
    foreach ($data as $value) {
        $types .= is_int($value) ? 'i' : (is_float($value) ? 'd' : 's');
        $values[] = $value;
    }
    
    $sql = "INSERT INTO leads (`" . implode('`, `', $columns) . "`) VALUES (" . implode(', ', $placeholders) . ")";
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param($types, ...$values);
        $result = $stmt->execute();
        
        if ($result) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id, 'action' => 'created']);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

$conn->close();
?>