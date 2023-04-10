<?php

echo "<h1>ChatGPT Dev</h1>";

$api_endpoint = "https://api.openai.com/v1/chat/completions";

$data_json = '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Give me a name for a dog."}],
    "temperature": 0.7
  }';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_endpoint);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Bearer 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'));
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS,$data_json);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
# Receive JWT Response
$response  = json_decode(curl_exec($ch));
curl_close($ch);

#print(json_encode($response));

$msg_response = $response->choices['0']->message;

print(json_encode($msg_response->content));

?>


