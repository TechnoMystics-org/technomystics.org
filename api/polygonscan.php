<?php

require './config/config.php';

// Setup Variables
header('Content-Type: application/json; charset=utf-8');
$return_obj = new stdClass();
$API_URL = "https://api.polygonscan.com/api";

// Get Balance
$GET_BALANCE_OPTS = "?module=account&action=balance&address=".$TM_SAFE_ADDRESS."&apikey=".$POLYGONSCAN_API_TOKEN;
$api_endpoint = $API_URL.$GET_BALANCE_OPTS;
$curl = curl_init($api_endpoint);
curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
$resp = curl_exec($curl);
curl_close($curl);
$resp_obj = json_decode($resp);
$resp_balance = $resp_obj->result;

// Format balance
$matic_balance = (int)$resp_balance / 1000000000000000000;
$matic_balance = round($matic_balance,4);
$return_obj -> matic_balance = $matic_balance;

// Get latest block
$GET_BLOCK_OPTS = "?module=proxy&action=eth_blockNumber&apikey=".$POLYGONSCAN_API_TOKEN;
$get_block_api_endpoint = $API_URL.$GET_BLOCK_OPTS;
$curl = curl_init($get_block_api_endpoint);
curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
$resp = curl_exec($curl);
curl_close($curl);
$resp_obj = json_decode($resp);
$latest_block = hexdec($resp_obj->result);
$latest_block = (int)$latest_block;

// Get Transactions
$GET_TRANSACTIONS_OPTS = "?module=account&action=txlist&address=".$TM_SAFE_ADDRESS."&startblock=0&endblock=".$latest_block."&page=1&offset=10&sort=dec&apikey=".$POLYGONSCAN_API_TOKEN;
$get_transactions_api_endpoint = $API_URL.$GET_TRANSACTIONS_OPTS;
$curl = curl_init($get_transactions_api_endpoint);
curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
$resp = curl_exec($curl);
curl_close($curl);
$resp_obj = json_decode($resp);

// Record Transactions
$return_obj->transactions = [];
$tx_count = 0;
foreach ($resp_obj->result as $tx){
    $amount = $tx->value / 1000000000000000000;
    $amount = round($amount,4);
    array_push($return_obj->transactions, [$tx->from,$amount]);
}

$json_return = json_encode($return_obj);
echo $json_return;

?>