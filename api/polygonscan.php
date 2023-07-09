<?php

require './config/config.php';

// Setup Variables
header('Content-Type: application/json; charset=utf-8');
$return_obj = new stdClass();
$API_URL = "https://api.polygonscan.com/api";

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

// Get MATIC Balance
$GET_BALANCE_OPTS = "?module=account&action=balance&address=".$TM_SAFE_ADDRESS."&apikey=".$POLYGONSCAN_API_TOKEN;
$api_endpoint = $API_URL.$GET_BALANCE_OPTS;
$curl = curl_init($api_endpoint);
curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
$resp = curl_exec($curl);
curl_close($curl);
$resp_obj = json_decode($resp);
$resp_balance = $resp_obj->result;
// Format balance
$matic_balance = $resp_balance / 1000000000000000000;
$matic_balance = round($matic_balance,4);
$return_obj -> matic_balance = $matic_balance;

// Get DAI Balance
$GET_DAI_BALANCE_OPTS = "?module=account&action=tokenbalance&contractaddress=".$DAI_CONTRACT_ADDRESS."&address=".$TM_SAFE_ADDRESS."&tag=latest&apikey=".$POLYGONSCAN_API_TOKEN;
$get_dai_balance_endpoint = $API_URL.$GET_DAI_BALANCE_OPTS;
$curl = curl_init($get_dai_balance_endpoint);
curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
$resp = curl_exec($curl);
curl_close($curl);
$resp_obj = json_decode($resp);
$resp_balance = $resp_obj->result;
// Format balance
$dai_balance = $resp_balance / 1000000000000000000;
$dai_balance = round($dai_balance,4);
$return_obj -> dai_balance = $dai_balance;

// Get Normal Transactions
$GET_TRANSACTIONS_OPTS = "?module=account&action=txlist&address=".$TM_SAFE_ADDRESS."&startblock=0&endblock=".$latest_block."&page=1&offset=10&sort=desc&apikey=".$POLYGONSCAN_API_TOKEN;
$get_transactions_api_endpoint = $API_URL.$GET_TRANSACTIONS_OPTS;
$curl = curl_init($get_transactions_api_endpoint);
curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
$resp = curl_exec($curl);
curl_close($curl);
$resp_obj = json_decode($resp);
// Record Normal Transactions
$return_obj->transactions = [];
foreach ($resp_obj->result as $tx){
    $amount = $tx->value / 1000000000000000000;
    $amount = round($amount,4);
    array_push($return_obj->transactions, array('token'=>'matic','from'=>$tx->from,'timestamp'=>$tx->timeStamp,'amount'=>$amount));
}

// Get DAI Transactions
$GET_ERC20TX_OPTS = "?module=account&action=tokentx&contractaddress=".$DAI_CONTRACT_ADDRESS."&address=".$TM_SAFE_ADDRESS."&startblock=0&endblock=".$latest_block."&page=1&offset=5&sort=desc&apikey=".$POLYGONSCAN_API_TOKEN;
$get_daitx_api_endpoint = $API_URL.$GET_ERC20TX_OPTS;
$curl = curl_init($get_daitx_api_endpoint);
curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
$resp = curl_exec($curl);
curl_close($curl);
$resp_obj = json_decode($resp);
// Record DAI Transactions
foreach ($resp_obj->result as $tx){
    $amount = $tx->value / 1000000000000000000;
    $amount = round($amount,4);
    array_push($return_obj->transactions, array('token'=>'dai','from'=>$tx->from,'timestamp'=>$tx->timeStamp,'amount'=>$amount));
}

$ret_tx_columns = array_column($return_obj->transactions,'timestamp');
array_multisort($ret_tx_columns,SORT_DESC,$return_obj->transactions);

$json_return = json_encode($return_obj);
echo $json_return;

?>