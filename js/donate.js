var accounts;
var web3;
var contract;
var DAIBalance;
var MATICBalance;

const DAIContractAddress = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";

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
];

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
  }
  else if(selectVal == 'dai') {
    dai = Math.round(DAIBalance * 10000) / 10000;
    document.getElementById('max-amount').innerHTML = "Max Amount: "+dai;
  }
  else if(selectVal == 'null') {
    matic = Math.round(MATICBalance * 10000) / 10000;
    document.getElementById('max-amount').innerHTML = "";
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
    console.log("Hello");
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
        
        console.log('Accounts requested from MetaMask RPC: ', accounts);
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
                console.log(res);
                console.log(er);

                MATICBalance = web3.utils.fromWei(res, "ether");
                console.log("MATIC Balance: "+MATICBalance);
            });

            // get DAI Balance
            DAIcontract = new web3.eth.Contract(minABI, DAIContractAddress);
            DAIBalance = await DAIcontract.methods.balanceOf(accounts[0]).call();
            DAIBalance = web3.utils.fromWei(DAIBalance,"ether");
            console.log("DAI Balance: "+DAIBalance);



            // select Token
            selectToken();
            
        }
        
    } else {
        // If web3 is not available, give instructions to install MetaMask
        document.getElementById('connect-error').innerHTML =
            'Please install MetaMask or compatible wallet to connect to the Ethereum network.';
    }
}

function getSafePolygonStats(){
  $.ajax({url:'/api/polygonscan.php', success: function(result){
    console.log(result);
  }});
}


window.addEventListener('load', 
  function() { 
    document.getElementById('donate-form-card').style.display = 'none';
    getSafePolygonStats();
  }, false);