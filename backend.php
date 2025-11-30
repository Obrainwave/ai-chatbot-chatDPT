<?php
// backend.php - single-file DeepSeek proxy
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Read incoming JSON
$payload     = json_decode(file_get_contents("php://input"), true);
$userMessage = $payload['message'] ?? '';

// Prefer environment variable for key
$apiKey = 'sk-63a2625';

// Basic validation
if (! $userMessage) {
    http_response_code(400);
    echo json_encode(['error' => 'No message provided']);
    exit;
}

// Build DeepSeek request payload (adjust fields to DeepSeek docs if different)
$post = [
    'model'    => 'deepseek-chat',
    'messages' => [
        ['role' => 'user', 'content' => $userMessage],
    ],
];

$ch = curl_init("https://api.deepseek.com/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer {$apiKey}",
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));
$response = curl_exec($ch);
$err      = curl_error($ch);
curl_close($ch);

if ($err) {
    http_response_code(502);
    echo json_encode(['error' => 'Curl error: ' . $err]);
    exit;
}

echo $response;
