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
console.log(owner+" OWNER");

async function connectDapp(){
  await ethereum.request({ method: 'eth_requestAccounts' }).then(function (result) {
    account0 = result[0];
    console.log(account0);
  });
  console.log(account0);
}

const abi = await $.getJSON("./config/abi.json"); //MAKE SURE IS FARM ABI
const dogemoonABI = await $.getJSON("./config/dogemoonABI.json");

const CONTRACT_ADDRESS = "0xC475b76627Af7e36f8622a3C17DB50c47bdaD635";
const DOGEMOON_ADDY = "0x95426E416bA98bA31C1904D7Ba46d374EC4B145A";

const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
const DogeMoonContract = new web3.eth.Contract(dogemoonABI, DOGEMOON_ADDY);


setInterval(async () => {
  await updateInfo() 
}, 500);


async function updateInfo(){

let allowance = await checkAllowance();
let farmStatus = false;
farmStatus = await checkFarmStatus();
console.log(farmStatus+" FARM STATUS");
if(farmStatus == false){
  document.getElementById('openFarm_button').innerHTML = "Open Farm";
} else {
  document.getElementById('openFarm_button').innerHTML = "Close Farm";
}


if(allowance > 0){
  document.getElementById('approve_button').style.visibility = 'hidden';
}

if(owner == ethereum.selectedAddress){
  document.getElementById('openFarm_button').style.visibility = 'visible';
}


document.getElementById("rewards").innerHTML = "Your current rewards: "+await currentRewards()+"!";
document.getElementById("userBalance").innerHTML = "Your staked DogeMoon: "+await userBalance()+"!";
document.getElementById("totalDeposits").innerHTML = "Total staked DogeMoon: "+await userBalance()+"!";
}



async function stake(amount){
    await contract.methods.stakeDogeMoon(amount).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
        console.log("done");
    }))
}

async function openFarm(){
  await contract.methods.openFarm().send({from: ethereum.selectedAddress}).on("receipt", ( () => {
      console.log("done");
  }))
}

async function currentRewards(){
  let rewards = new BigNumber(await contract.methods.checkCurrentRewards(ethereum.selectedAddress).call());
      return rewards.toFixed()/(10**18);
}

async function checkAllowance(){
    let allowance = new BigNumber(await DogeMoonContract.methods.allowance(ethereum.selectedAddress, CONTRACT_ADDRESS).call());
    return allowance.toFixed();
}

async function userBalance(){
  let balance = await contract.methods.balanceOf(ethereum.selectedAddress).call();
      return balance/(10**18);
}

async function totalStaked(){
  let balance = await contract.methods.balanceOf(CONTRACT_ADDRESS).call();
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


async function approveDogemoon(){
  let maxValue = new BigNumber("115792089237316195423570985008687907853269984665640564039457584007913129639935");
  console.log(Number(maxValue));
  console.log(maxValue.toFixed())
  await DogeMoonContract.methods.approve(CONTRACT_ADDRESS, maxValue.toFixed()).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
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


$(document).ready(function async () {
    $("#openFarm_button").click( () => {
        console.log("clicked");
        toggleFarm(); 
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

