var accounts;
var web3;
var contract;
var DAIBalance;
var MATICBalance;
var DAIcontract;

const DAIContractAddress = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const TMSafeAddress = "0xddF18000aba4e7EDBa1fc87a089B36051C83Eb27";

// ABI for getting ERC20 Balance
const minABI = [
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
  },
  {
    constant: false,
    inputs: [
     {
      name: "_to",
      type: "address"
     },
     {
      name: "_value",
      type: "uint256"
     }
    ],
    name: "transfer",
    outputs: [
     {
      name: "",
      type: "bool"
     }
    ],
    type: "function"
   },
];

async function sendDonation(){
  //console.log("Sending Donation: "+document.getElementById('donation-amount').value);
  document.getElementById('donate-error').innerHTML = "";
  if(document.getElementById('donation-amount').value > 0){
    // Check for MATIC or DAI
    if(document.getElementById('select-token').value == 'null'){
      // Do Nothing
    }
    else if(document.getElementById('select-token').value == 'matic'){
      donationAmount = document.getElementById('donation-amount').value;
      try {
        await web3.eth.sendTransaction({
          from:accounts[0],
          to:TMSafeAddress,
          value:web3.utils.toWei(donationAmount,"ether"),
        })
        .on('error', function(err){
          console.log('error:');
          console.log(err);
        })
        .on('transactionHash', function(transactionHash){
          //console.log("txHash:");
          //console.log(transactionHash);
          document.getElementById('donate-error').innerHTML = "<small class=\"text-success\"><a href=\"https://polygonscan.com/tx/"+transactionHash+"\" target=\"_blank\" class=\"link-light\">"+transactionHash+"</a> Submitted.";
          document.getElementById('donation-amount').value = 0;
          document.getElementById('donate-button').disabled = true;
        })
        .on('receipt',function(receipt){
          //console.log("Receipt:");
          //console.log(receipt);
          document.getElementById('donate-error').innerHTML = "<small class=\"text-success\"><a href=\"https://polygonscan.com/tx/"+receipt.transactionHash+"\" target=\"_blank\" class=\"link-light\">"+receipt.transactionHash+"</a> Success!";
        });
      }
      catch(e){
        console.log(e.message);
        document.getElementById('donate-error').innerHTML = "<small class=\"text-danger\">"+e.message+"</small>";
      }
    }
    else if(document.getElementById('select-token').value == 'dai'){
      console.log("DAI Donation Amount: "+document.getElementById('donation-amount').value);
      try{
        donationAmount = web3.utils.toWei(document.getElementById('donation-amount').value,"ether");
        DAIContract = new web3.eth.Contract(minABI,DAIContractAddress, {from: accounts[0],});

        rawTx = {
          from: accounts[0],
          to: DAIContractAddress,
          data: DAIContract.methods.transfer(TMSafeAddress, donationAmount).encodeABI(),
        }

        await web3.eth.sendTransaction({
          from: accounts[0],
          to: DAIContractAddress,
          data: DAIContract.methods.transfer(TMSafeAddress, donationAmount).encodeABI(),
        })
        .on('error',  function(err){
          console.log('error:');
          console.log(err);
        })
        .on('transactionHash', function(transactionHash){
          //console.log("txHash:");
          //console.log(transactionHash);
          document.getElementById('donate-error').innerHTML = "<small class=\"text-success\"><a href=\"https://polygonscan.com/tx/"+transactionHash+"\" target=\"_blank\" class=\"link-light\">"+transactionHash+"</a> Submitted.";
          document.getElementById('donation-amount').value = 0;
          document.getElementById('donate-button').disabled = true;
        })
        .on('receipt',function(receipt){
          //console.log("Receipt:");
          //console.log(receipt);
          document.getElementById('donate-error').innerHTML = "<small class=\"text-success\"><a href=\"https://polygonscan.com/tx/"+receipt.transactionHash+"\" target=\"_blank\" class=\"link-light\">"+receipt.transactionHash+"</a> Success!";
        });
      }
      catch(e){
        console.log(e.message);
        document.getElementById('donate-error').innerHTML = "<small class=\"text-danger\">"+e.message+"</small>";
      }
      
    }
  }
}

function donationAmountChange(){
  if(document.getElementById('select-token').value == 'null'){
    document.getElementById('donate-button').disabled = true;
  }
  else{
    if(document.getElementById('donation-amount').value > 0){
      document.getElementById('donate-button').disabled = false;
    }
    else{
      document.getElementById('donate-button').disabled = true;
    }
  }
}

function setMaxDonation() {
  selectVal = document.getElementById('select-token').value;
  if(selectVal !== 'null'){
    if(selectVal == 'matic'){
      if (MATICBalance > 0){
        matic = Math.round(MATICBalance * 10000) / 10000;
        document.getElementById('donation-amount').value = matic;
      }
    }
    else if(selectVal == 'dai'){
      if(DAIBalance > 0){
        dai = Math.round(DAIBalance * 10000) / 10000;
        document.getElementById('donation-amount').value = dai;
      }
    }
  }
  else{
    document.getElementById('donation-amount').value = 0;
  }
}

function selectToken() {
  //get selection
  selectVal = document.getElementById('select-token').value;
  document.getElementById('donation-amount').value = 0;

  // Choose logic based on token
  if(selectVal == 'matic'){
    matic = Math.round(MATICBalance * 10000) / 10000;
    document.getElementById('max-amount').innerHTML = "Max Amount: "+matic;
    donationAmountChange();
  }
  else if(selectVal == 'dai') {
    dai = Math.round(DAIBalance * 10000) / 10000;
    document.getElementById('max-amount').innerHTML = "Max Amount: "+dai;
    donationAmountChange();
  }
  else if(selectVal == 'null') {
    matic = Math.round(MATICBalance * 10000) / 10000;
    document.getElementById('max-amount').innerHTML = "";
    donationAmountChange();
  }
}

async function switchNetwork(){
    var errMessage = false;
    try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x89' }], // chainId must be in hexadecimal numbers
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x89',
                  rpcUrl: 'https://polygon-rpc.com',
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
            document.getElementById("connect-error").innerHTML = addError.message;
            errMessage = true;
          }
        }
        console.error(error);
        document.getElementById("connect-error").innerHTML = error.message;
        errMessage = true;
      }
      return errMessage;
}

async function connectWallet(){
    document.getElementById("connect-error").innerHTML = '';
    //console.log("Hello");
    didError = false;
    if (typeof window.ethereum !== 'undefined') {
      // Use the browser injected Ethereum provider
      web3 = new Web3(window.ethereum);
      // Request access to the user's MetaMask account.
      // Note: Even though, you can also get the accounts from `await web3.eth.getAccounts()`,
      //  you still need to make a call to any MetaMask RPC to cause MetaMask to ask for concent.
      try {
          accounts = await window.ethereum.request({
              method: 'eth_requestAccounts',
          });
      }
      catch(e){
          //console.log(e.message);
          document.getElementById("connect-error").innerHTML = e.message;
          didError = true;
      }
      
      //console.log('Accounts requested from MetaMask RPC: ', accounts);
      didError = await switchNetwork();

      if(!didError){
          document.getElementById('connect-button-div').style.display = 'none';
          document.getElementById('donate-form-card').style.display = 'block';
          window.ethereum.on('chainChanged', (chainId) => {
              if(chainId !== '0x89'){
                  window.location.reload();
              }
          });

          // get MATIC Balance
          await web3.eth.getBalance(accounts[0]).then((res,er) => {
              //console.log(res);
              //console.log(er);

              MATICBalance = web3.utils.fromWei(res, "ether");
              //console.log("MATIC Balance: "+MATICBalance);
          });

          // get DAI Balance
          DAIcontract = new web3.eth.Contract(minABI, DAIContractAddress);
          DAIBalance = await DAIcontract.methods.balanceOf(accounts[0]).call();
          DAIBalance = web3.utils.fromWei(DAIBalance,"ether");

          // select Token
          selectToken();
          
      }        
    } else {
        // If web3 is not available, give instructions to install MetaMask
        document.getElementById('connect-error').innerHTML = 'Please install MetaMask or compatible wallet to connect to the Ethereum network.';
    }
}

function getSafePolygonStats(){
  $.ajax({url:'/api/polygonscan.php', success: function(result){
    // Set current balances
    document.getElementById('matic-safe-balance').innerHTML = "<h3>"+result.matic_balance+"</h3>";
    document.getElementById('dai-safe-balance').innerHTML = "<h3>"+result.dai_balance+"</h3>";

    // publish recent transactions
    result.transactions.forEach(printTransactions);
  }});
}

function printTransactions(item, index){
  // Only list the last 30 transactions
  if(index <= 30){
    // Determine token
    icon_src = "";
    if(item.token == 'matic'){
      icon_src = "/img/matic_icon.png";
    }
    else if (item.token == 'dai'){
      icon_src = "/img/dai_icon.png";
    }
    // Format Date
    date = new Date(Number(item.timestamp) * 1000);
    formatted_date = date.toLocaleDateString("en-US");

    // Format From Address (shorten)
    re = /^(.{5}).*(.{4})$/;
    match = item.from.match(re);
    formatted_addr = match[1]+"..."+match[2];
        
    // create row
    row = `<div class="row justify-content-center">
      <div class="col-4">
        <small><img src="${icon_src}" width="25px"> ${item.amount}</small>
      </div>
      <div class="col-4">
        <small><a href="https://polygonscan.com/address/${item.from}" target="_blank" class="link-light">${formatted_addr}</a></small>
      </div>
      <div class="col-4">
        <small>${formatted_date}</small>
      </div>
    </div>`;
    // Publish
    $('#recent-transactions').append(row);
  }
}

window.addEventListener('load', 
  function() { 
    document.getElementById('donate-form-card').style.display = 'none';
    getSafePolygonStats();
  }, false);