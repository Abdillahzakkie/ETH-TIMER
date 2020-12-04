const connectWallet = document.querySelector('.unlock-wallet');
const totalLiquidityLocked = document.querySelector('.claimable-rewards');
const userBalance = document.querySelector('.user-balance');
const calculate_rewards = document.querySelector('.calculate-rewards');
const user_rewards = document.querySelector('.rewards');
const withdrawRewardsButton = document.querySelector('.withdraw-rewards');


// Select dom element for timer
const days = document.querySelector('.days');
const hours = document.querySelector('.hours');
const minutes = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');


import { abi as ethanolTokenABI } from './abi/Ethanol.js';
import { abi as ethanolVestABI } from "./abi/EthanolVault.js";
import { data } from './csvjson.js'

// const apiKey = '7QEMXYNDAD5WT7RTA5TQUCJ5NIA99CSYVI';
const EthanolAddress = '0x63D0eEa1D7C0d1e89d7e665708d7e8997C0a9eD6';
const EthnolVestAddress = '0xf34F69fB72B7B6CCDbdA906Ad58AF1EBfAa76c42';

let web3;
let EthanolToken;
let EthanoVault;
let user;
let displayTimeLeft = Date.now();

const toWei = _amount => web3.utils.toWei(_amount.toString(), 'ether');
const fromWei = _amount => web3.utils.fromWei(_amount.toString(), 'ether');

window.addEventListener('DOMContentLoaded', async () => {
  await connectDAPP();
  timer()
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
    const network = await window.web3.eth.net.getId();
    if(network !== 1) return alert("Please switch to mainnet");

    web3 = window.web3;
    EthanolToken = new web3.eth.Contract(ethanolTokenABI, EthanolAddress);
    EthanoVault = new web3.eth.Contract(ethanolVestABI, EthnolVestAddress);
    const accounts = await web3.eth.getAccounts();
    user = accounts[0];
    await settings();
    
  } catch (error) { console.error(error.message); }
}


const connectDAPP = async () => {
    await loadWeb3();
    await loadBlockchainData(); 
}


const settings = async () => {
    if(user) connectWallet.classList.add('hide');
    const claimableRewards = await checkRewards();
    totalLiquidityLocked.textContent = `${Number(fromWei(claimableRewards)).toFixed(4)} Enol`;

    let _balance = await balanceOf();
    userBalance.textContent = `${Number(fromWei(_balance)).toFixed(4)} Enol`;

    // const _rewards = await checkRewards();
    const _rewards = updateUserRewards();
    user_rewards.textContent = `${Number(_rewards).toFixed(4)} Enol`;

    _balance = await calculateRewards();
    calculate_rewards.textContent = `${_balance}%`;

}

const balanceOf = async _account => {
    const _user = _account ? _account : user;
    return await EthanolToken.methods.balanceOf(_user).call();
}

const withdrawRewards = async () => {
    try {
        const _rewards = await EthanoVault.methods.checkRewards(user).call();
        const reciept = await EthanoVault.methods.withdrawRewards(_rewards).send(
            { from: user, gas: '25000' }
        );
        alert('Withdraw successful');
        console.log(reciept)
        return reciept;
    } catch (error) {
        alert(error.message);
    }
}

const calculateRewards = async () => {
    try {
        const _balance = (await balanceOf(user)).toString();
        let result  = '0';
        if(Number(fromWei(_balance)) > '2' && Number(fromWei(_balance)) < '5') {
            result = '10';
        } else if(Number(fromWei(_balance)) >= '5' && Number(fromWei(_balance)) < '10') {
            result = '20'
        } else if(Number(fromWei(_balance)) >= '10' && Number(fromWei(_balance)) < '20') {
            result = '30'
        } else if(Number(fromWei(_balance)) >= '20' && Number(fromWei(_balance)) < '30') {
            result = '40'
        } else if(Number(fromWei(_balance)) >= '30' && Number(fromWei(_balance)) < '40') {
            result = '50'
        } else if(Number(fromWei(_balance)) >= '40' && Number(fromWei(_balance)) < '99') {
            result = '60'
        } else if(Number(fromWei(_balance)) >= '100') {
            result = '100'
        }
        return result.toString();
    } catch (error) { console.log(error.message) }
}

const checkRewards = async () => {
    try {
        let result = await EthanoVault.methods.checkRewards(user).call();
        return result.toString();
    } catch (error) { console.error(error.message)
    }
}

const updateUserRewards = () => {
    try {
        let result = 0;
        for(let i = 0; i < data.length; i++) {
            if(data[i]["wallet"] === user) result = data[i]["balance"];
        }
        return result;
    } catch (error) { console.error(error.message) }
}

withdrawRewardsButton.addEventListener('click', async e => {
    e.preventDefault();
    await withdrawRewards()
})

const sendTransaction = async () => {
    try {
        const gasPrice = Number(web3.utils.toWei('30', 'gwei')) * 2;
        const nonce = await web3.eth.getTransactionCount(user);
        let tx = {
            from: user, // user wallet
            to: EthnolVestAddress, // contract address
            nonce,
            gasPrice,
            gasLimit: '100000', //block gas limit
            value: '0', // no ether transfer is allowed
            chainId: '1' // default is mainner
        }
        tx = web3.utils.sha3(JSON.stringify(tx));

        const result = web3.eth.sign(tx, user);
        return result;
    } catch (error) { console.error(error.message) }   
}

const timer = (_date) => {
    try {
        const now = Date.now();
        const futureDate = new Date(_date).getTime();
        displayTimeLeft = futureDate - now;

        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        const day = hour * 24;

        const d = Math.floor(displayTimeLeft / day);
        const h = Math.floor((displayTimeLeft % day) / hour);
        const m = Math.floor((displayTimeLeft % hour) / minute);
        const s = Math.floor((displayTimeLeft % minute) / second);

        days.textContent = d;
        hours.textContent = h;
        minutes.textContent = m;
        seconds.textContent = s;

        setInterval(() => {
            if(displayTimeLeft < 0) return clearInterval(gap_timer);
            timer("Jan 1, 2021 00:00:00")
        }, 1000)
    } catch (error) { console.error(error.message) }
}






