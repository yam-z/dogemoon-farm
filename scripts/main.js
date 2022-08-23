const web3 = new Web3(Web3.givenProvider);

if(typeof window.ethereum !== "undefined"){
  console.log("We see metamask!");
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  console.log(account);
    $("#connect_button").hide();
}

const owner = "0x86a30392ab31a851fcfde85d397bd592169ffbd8";
let account0;

async function connectDapp(){
  await ethereum.request({ method: 'eth_requestAccounts' }).then(function (result) {
    account0 = result[0];
    console.log(account0);
  });
  console.log(account0);
}

const abi = await $.getJSON("./config/abi.json"); //MAKE SURE IS FARM ABI
const dogemoonABI = await $.getJSON("./config/dogemoonABI.json");
const LPfarmABI = await $.getJSON("./config/LPfarmABI.json");
const approveABI = await $.getJSON("./config/approveABI.json");

const CONTRACT_ADDRESS = "0x2335c4bBF89F19982a060370ab1c892b242445aa";
const DOGEMOON_ADDY = "0x95426E416bA98bA31C1904D7Ba46d374EC4B145A";
const LP_STAKE_ADDRESS = "0x6ed3F2C81D766f12c7eab8439aa7397D46512f59";
const LP_TOKEN_ADDRESS = "0x01BEB42Da29C04b0D63B7D57A1849C3D81e4Ac20";

const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
const DogeMoonContract = new web3.eth.Contract(dogemoonABI, DOGEMOON_ADDY);
const LPstakeContract = new web3.eth.Contract(LPfarmABI, LP_STAKE_ADDRESS);
const LPtoken = new web3.eth.Contract(approveABI, LP_TOKEN_ADDRESS);


setInterval(async () => {
  await updateInfo() 
}, 500);


async function updateInfo(){


let timeCheck = await userTimeLockCheck();
let allowance = await checkAllowance();
let lpAllowance = await lpAllowanceCheck();
let farmStatus = false;
farmStatus = await checkFarmStatus();
if(farmStatus == false){
  document.getElementById('openFarm_button').innerHTML = "Open Farm";
} else {
  document.getElementById('openFarm_button').innerHTML = "Close Farm";
}

if(allowance > 0){
  document.getElementById('approve_button').style.visibility = 'hidden';
}

if(lpAllowance > 0){
  document.getElementById('approveLP_button').style.visibility = 'hidden';
}

if(owner == ethereum.selectedAddress){
  document.getElementById('openFarm_button').style.visibility = 'visible';
}

if(timeCheck == true){
  document.getElementById("lockCheck").innerHTML = "You are TimeLocked!";
  document.getElementById("lockCheck").style.background = "red";
  console.log(timeCheck);
} else {
  document.getElementById("lockCheck").innerHTML = "You are NOT TimeLocked!";
  document.getElementById("lockCheck").style.background = "light green";
  document.getElementById("lockCheck").style.visibility = 'hidden';
}

document.getElementById("rewards").innerHTML = "Your current rewards: "+await currentRewards()+" DogeMoon!";
document.getElementById("LPrewards").innerHTML = "Your current rewards: "+await currentLPRewards()+" DogeMoon!";
document.getElementById("userBalance").innerHTML = "Your staked DogeMoon: "+await userBalance()+" DogeMoon!";
document.getElementById("userBalanceLP").innerHTML = "Your staked LP tokens: "+await userLPBalance()+" LP tokens!";
document.getElementById("totalDeposits").innerHTML = "Total staked DogeMoon: "+await returnTotalStaked()+" DogeMoon!";
document.getElementById("totalDepositsLP").innerHTML = "Total staked LP tokens: "+await totalLPStaked()+" LP tokens";
}



async function stake(amount){
    await contract.methods.stakeDogeMoon(amount).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
        console.log("done");
    }))
}

async function stakeLP(amount){
  await LPstakeContract.methods.stake(amount).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
      console.log("done");
  }))
}


async function unstake(){
  await contract.methods.unstakeDogeMoon().send({from: ethereum.selectedAddress}).on("receipt", ( () => {
      console.log("done");
  }))
}

async function unstakeLP(amount){
  await LPstakeContract.methods.withdraw(amount).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
      console.log("done");
  }))
}

async function openFarm(){
  await contract.methods.openFarm().send({from: ethereum.selectedAddress}).on("receipt", ( () => {
      console.log("done");
  }))
}

async function setTimeLock(){
  await DogeMoonContract.methods.setLockTime(1).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
    console.log("done");
  }));
}

async function returnTotalStaked(){
  let totalStaked = new BigNumber(await contract.methods.returnTotalStaked().call({from: ethereum.selectedAddress}));
  return totalStaked.toFixed()/(10**18);
  
}

async function currentRewards(){
  let rewards = new BigNumber(await contract.methods.checkCurrentRewards(ethereum.selectedAddress).call());
      return rewards.toFixed()/(10**18);
}

async function currentLPRewards(){
  let rewards = new BigNumber(await LPstakeContract.methods.earned(ethereum.selectedAddress).call())/(10**18);
  return rewards.toFixed(18);
}

async function checkAllowance(){
    let allowance = new BigNumber(await DogeMoonContract.methods.allowance(ethereum.selectedAddress, CONTRACT_ADDRESS).call());
    return allowance.toFixed();
}

async function lpAllowanceCheck(){
  let allowance = new BigNumber(await LPtoken.methods.allowance(ethereum.selectedAddress, LP_STAKE_ADDRESS).call());
  return allowance.toFixed();
}

async function userBalance(){
  let balance = await contract.methods.balanceOf(ethereum.selectedAddress).call();
      return balance/(10**18);
}

async function userLPBalance(){
  let balance = await LPstakeContract.methods._balances(ethereum.selectedAddress).call();
      return balance/(10**18);
}

async function totalStaked(){
  let balance = await contract.methods.balanceOf(CONTRACT_ADDRESS).call();
      return balance/(10**18);
}

async function totalLPStaked(){
  let balance = await LPstakeContract.methods._totalSupply().call();
      return balance/(10**18);
}


async function checkFarmStatus(){
  let farmStatus = await contract.methods.isFarmOpen().call();
  if(farmStatus == true){
    document.getElementById("farmCheck").innerHTML = "Farm is OPEN!";
    document.getElementById("openFarm_button").innerHTML = "Close Farm";
    document.getElementById("farmCheck").style.background = "light green";
    return true;
  } else {
    document.getElementById("farmCheck").innerHTML = "Farm is CLOSED!";
    document.getElementById("openFarm_button").innerHTML = "Open Farm";
    document.getElementById("farmCheck").style.background = "red";
    return false;
  }
}

async function userTimeLockCheck(){
  let check = await contract.methods.userTimeLockCheck(ethereum.selectedAddress).call();
  return check;
}

async function approveDogemoon(){
  let maxValue = new BigNumber("115792089237316195423570985008687907853269984665640564039457584007913129639935");
  console.log(Number(maxValue));
  console.log(maxValue.toFixed())
  await DogeMoonContract.methods.approve(CONTRACT_ADDRESS, maxValue.toFixed()).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
    console.log("done");
}));
}

async function approveLP(){
  let maxValue = new BigNumber("115792089237316195423570985008687907853269984665640564039457584007913129639935");
  console.log(Number(maxValue));
  console.log(maxValue.toFixed())
  await LPtoken.methods.approve(LP_STAKE_ADDRESS, maxValue.toFixed()).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
    console.log("done");
}));
}

async function toggleFarm(){
  let isOpen = await checkFarmStatus();
  if(isOpen == false){
    await contract.methods.openFarm().send({from: ethereum.selectedAddress}).on("receipt", ( () => {
      console.log("done");
  }));
  }
  else {
    await contract.methods.closeFarm().send({from: ethereum.selectedAddress}).on("receipt", ( () => {
      console.log("done");
  }));
  }
}

$(document).ready(function () {
  $("#approve_button").click( () => {
    approveDogemoon();
})});

$(document).ready(function () {
  $("#approveLP_button").click( () => {
    approveLP();
})});


$(document).ready(function async () {
    $("#openFarm_button").click( () => {
        console.log("clicked");
        toggleFarm(); 
  })});

  $(document).ready(function async () {
    $("#unstake_button").click( () => {
        console.log("clicked unstake");
        unstake(); 
  })});

  $(document).ready(function async () {
    $("#unstakeLP_button").click( () => {
        console.log("clicked unstake LP");
        let amountToUnstake = document.getElementById("unstakeAmountLP").value;
        if(amountToUnstake > 0){
          amountToUnstake = BigNumber(amountToUnstake*(10**18));
          console.log(amountToUnstake.toFixed());
          unstakeLP(amountToUnstake.toFixed());
        }
        else {
          console.log("RETURNING");
          return;
        }
  })});

  $(document).ready(function async () {
    $("#buy_button").click( () => {
        console.log("clicked");
        window.location.href = 'https://dogeswap.org/#/swap?outputCurrency=0x95426e416ba98ba31c1904d7ba46d374ec4b145a';
  })});

  $(document).ready(function () {
    $("#stake_button").click( () => {
        console.log("clicked");
        let amountToStake = document.getElementById("stakeAmount").value;
        if(amountToStake > 0){
          amountToStake = BigNumber(amountToStake*(10**18));
          console.log(amountToStake.toFixed());
          stake(amountToStake.toFixed());
        }
        else {
          return;
        }
  })});

  
  $(document).ready(function () {
    $("#stakeLP_button").click( () => {
        console.log("clicked");
        let amountToStake = document.getElementById("stakeAmountLP").value;
        if(amountToStake > 0){
          amountToStake = BigNumber(amountToStake*(10**18));
          console.log(amountToStake.toFixed());
          stakeLP(amountToStake.toFixed());
        }
        else {
          console.log("returning");
          return;
        }
  })});


