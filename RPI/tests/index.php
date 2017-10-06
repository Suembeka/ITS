<?php

if($_POST['type'] == 'start_sync') {
    $last_transaction_id = 0;
    $response = new stdClass();
    $response->type = 'accept_sync';
    
    $response_data = new stdClass();
    $response_data->last_transaction_id = $last_transaction_id;
    
    $response->data = $response_data;
    print(json_encode($response));
}

if($_POST['type'] == 'send_data') {
    $response = new stdClass();
    $response->type = 'sync_status';

    $response_data = new stdClass();
    $response_data->status = (rand(1, 100) > 50) ? 200 : 500;
    

    $response->data = $response_data;
    print(json_encode($response));
}

$content = file_get_contents('logger.txt');
$request = 'REQUEST: ' . json_encode($_POST);
$response = 'RESPONSE: ' . json_encode($response);
$newContent = $content . "\n" . $request . "\n" . $response . "\n";
file_put_contents('logger.txt', $newContent);

?>