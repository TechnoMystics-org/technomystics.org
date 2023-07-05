var accounts;
var web3;
var contract;
var DAIBalance;
var MATICBalance;

const DAIContractAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"

function setMaxDonation() {
  if(MATICBalance >= 0) {
    // round balance to 4 decimals
    matic = Math.round(MATICBalance * 10000) / 10000;
    document.getElementById('donation-amount').value = ''+matic;
  }
}

function selectToken() {
  //get selection
  selectVal = document.getElementById('select-token').value;

  // Choose logic based on token
  if(selectVal == 'matic'){
    matic = Math.round(MATICBalance * 10000) / 10000;
    document.getElementById('max-amount').innerHTML = "Max Amount: "+matic;
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

            // select Token
            selectToken();
            
        }
        
    } else {
        // If web3 is not available, give instructions to install MetaMask
        document.getElementById('connect-error').innerHTML =
            'Please install MetaMask or compatible wallet to connect to the Ethereum network.';
    }
}



window.addEventListener('load', 
  function() { 
    document.getElementById('donate-form-card').style.display = 'none';
  }, false);