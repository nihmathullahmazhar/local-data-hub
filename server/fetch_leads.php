<?php
// server/fetch_leads.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$conn = require_once 'db.php';

$result = $conn->query("SELECT * FROM leads ORDER BY id DESC");

$leads = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Parse JSON fields
        if (isset($row['services'])) {
            $row['services'] = json_decode($row['services'], true) ?: [];
        }
        if (isset($row['delivery_features'])) {
            $row['deliveryFeatures'] = json_decode($row['delivery_features'], true) ?: [];
            unset($row['delivery_features']);
        }
        
        // Convert boolean fields
        $boolFields = ['contacted', 'replied', 'demo_sent', 'interested', 'advance_paid', 'balance_paid', 
                       'project_completed', 'free_domain', 'renewal_agreement', 'repeat_client', 
                       'advance_proof', 'balance_proof'];
        foreach ($boolFields as $field) {
            $camelField = lcfirst(str_replace('_', '', ucwords($field, '_')));
            if (isset($row[$field])) {
                $row[$camelField] = (bool)$row[$field];
                if ($field !== $camelField) {
                    unset($row[$field]);
                }
            }
        }
        
        // Convert snake_case to camelCase for all fields
        $camelRow = [];
        foreach ($row as $key => $value) {
            $camelKey = lcfirst(str_replace('_', '', ucwords($key, '_')));
            $camelRow[$camelKey] = $value;
        }
        
        $leads[] = $camelRow;
    }
}

echo json_encode($leads);
$conn->close();
?>