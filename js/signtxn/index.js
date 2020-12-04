import { abi as ecRecoverABI  } from '../abi/ecRecoverABI.js';

const inputMessage = document.querySelector('.message-to-sign');
const submitMessage = document.querySelector('.submit-sign-message'); 
const msgHash = document.querySelector('.msg-hash');
const signature = document.querySelector('.signature');
const verifyButton = document.querySelector('.verify-message');
const address_that_signed = document.querySelector('.address-that-signed');
const verifySig = document.querySelector('.verify-sig');


// const contractAddress = '0x6cf5F701aa7151987b58dA7823c0C54743E2b7C5'; // kovan network
const contractAddress = '0xa1DCc8356015B9C99B022Eb4FD52ccc6C2D44411'; // rinkeby network


// Contract 
let web3;
let contract;
let user;
let _message;
let message_signed;
let _signature;

const gas = '500000'

const toWei = _amount => web3.utils.toWei(_amount.toString(), 'ether');
const fromWei = _amount => web3.utils.fromWei(_amount.toString(), 'ether');


let estimatedGasPrice;


window.addEventListener('DOMContentLoaded', async () => {
  await loadWeb3();
  await loadBlockchainData();
})

const loadWeb3 = async () => {
    if(window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        // cancel autorefresh on network change
        window.ethereum.autoRefreshOnNetworkChange = false;

    } else if(window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        alert("Non-Ethereum browser detected. You should consider trying Metamask")
    }
}

const loadBlockchainData = async () => {
  try {
    web3 = window.web3;
    contract = new web3.eth.Contract(ecRecoverABI, contractAddress);
    const accounts = await web3.eth.getAccounts();
    user = accounts[0];

    // await settings();

  } catch (error) { console.log(error.message); }
}

const signMessage = async () => {
    try {
        message_signed = web3.utils.sha3(_message);
        const _user = web3.utils.toChecksumAddress(user);
        const result = await web3.eth.sign(message_signed, _user);

        _signature = result;

        msgHash.textContent = `Message: ${message_signed}`;
        signature.textContent = `Signature: ${_signature}`;

        alert('Message signed!');
    } catch (error) { console.error(error.message) }
}

const verify = async () => {
    try {
        const result = await contract.methods.recover(web3.utils.sha3(_message), _signature).call();
        return result;
    } catch (error) { console.error(error.message) }
}

// const settings = async () => {
//     let result;
//     try {
//         estimatedGasPrice = web3.eth.getGasPrice();
//         console.log(estimatedGasPrice)
//     } catch (error) { console.error(error.message) }
// }


inputMessage.addEventListener('change', e => {
    e.preventDefault();
    _message = (e.currentTarget.value).toString();
})

submitMessage.addEventListener('click', async e => {
    e.preventDefault();
    if(!_message) return;
    signMessage()
})

verifyButton.addEventListener('click', async e => {
    e.preventDefault();
    if(!message_signed) return;
    const result = await verify();
    console.log(result)
    address_that_signed.textContent = `This address signed the message: ${result.toString()}`;
})

verifySig.addEventListener('change', async e => {
    e.preventDefault();
    message_signed = e.currentTarget.value;
})


