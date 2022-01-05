// ethers.js
const { ethers } = require("ethers");
// RPC provider
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

// WETH DATA
const WethContractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WethAbi = require("./SmartContractData/weth/WethAbi.json");
// BAT Data
const BatContractAddress = "0x0D8775F648430679A709E98d2b0Cb6250d2887EF";
const BatAbi = require("./SmartContractData/BAT/BatAbi.json");
// ZRX DATA
const ZrxContractAddress = "0xE41d2489571d322189246DaFA5ebDe1F4699F498";
const ZrxAbi = require("./SmartContractData/ZRX/ZrxAbi.json");
// USDC DATA
const UsdcContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const UsdcAbi = require("./SmartContractData/USDC/UsdcAbi.json");
// LINK DATA
const LinkContractAddress = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
const LinkAbi = require("./SmartContractData/LINK/LinkAbi.json");
// Uniswap Factory Data
const uniswapV2FactoryContractAddress =
  "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const uniswapAbi = require("./SmartContractData/uniswapV2Factory/uniswapv2abi.json");
// Unswap Router Data
const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const uniswapRouterAbi = require("./SmartContractData/uniswapRouter/uniswapRouterAbi.json");
// Dai Data
const daiContractAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const daiAbi = require("./SmartContractData/Dai/daiAbi.json");

//  Contract Signing to the Wallet Address to intract and do a transaction
const wallet = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // private key
  provider // RPC provider
);
// Uniswap Contract
const uniswapV2FactoryContract = new ethers.Contract(
  uniswapV2FactoryContractAddress,
  uniswapAbi,
  wallet
);
// Uniswap Router Contract
const uniswapRouterContract = new ethers.Contract(
  uniswapRouterAddress,
  uniswapRouterAbi,
  wallet
);
// WETH Contract
const wethContract = new ethers.Contract(WethContractAddress, WethAbi, wallet);
// DAI Contract Instance
const daiContract = new ethers.Contract(daiContractAddress, daiAbi, wallet);
// BAT CONTRACT Instance
const BatContract = new ethers.Contract(BatContractAddress, BatAbi, wallet);
// ZRX CONTRACT INSTANCE
const ZrxContract = new ethers.Contract(ZrxContractAddress, ZrxAbi, wallet);
// USDC CONTRCT INSTANCE
const UsdcContract = new ethers.Contract(UsdcContractAddress, UsdcAbi, wallet);
// LINK CONTRACT INSTANCE
const LinkContract = new ethers.Contract(LinkContractAddress, LinkAbi, wallet);
// BAT CONTRACT INSTANCE
 //const batContract = new ethers.Contract(BatContractAddress, BatAbi, wallet);

// Main function Starts from here
//----------------------------------------------------------------------------------------------------------------------------------------
const main = async () => {
  try {
    await wethContract.deposit({
      value: ethers.utils.parseEther("1.0"),
      gasLimit: 1000000,
    });

    const wethBal = await wethContract.balanceOf(wallet.address);
    console.log(`WETH Balance: ${ethers.utils.formatEther(wethBal)}`);

    // To Get Path Address
    const daiPairAddress = await uniswapV2FactoryContract.getPair(
      daiContractAddress,
      WethContractAddress
    );
     console.log(daiPairAddress);

     // To Get Path Address
     const batPairAddress = await uniswapV2FactoryContract.getPair(
      BatContractAddress,
      WethContractAddress
    );
     console.log(batPairAddress);

    // Uniswap Router function to  swap the WETH - DAI token 
    const result1 = await uniswapRouterContract.swapExactETHForTokens(
      0, //min amount out
      [WethContractAddress, daiContractAddress], // Pair Contract Addresses
      wallet.address, // Wallet Address of User
      2525644800, // Time Stamp
      {
        gasLimit: 30000000, // Supplied Gas
        value: ethers.utils.parseEther("1"), // Deposit Ether balance
      }
    );
    console.log(result1);


    // Uniswap Router function to  swap the WETH - BAT token 
    const result2 = await uniswapRouterContract.swapExactETHForTokens(
      0, //min amount out
      [WethContractAddress, BatContractAddress], // Pair Contract Addresses
      wallet.address, // Wallet Address of User
      2525644800, // Time Stamp
      {
        gasLimit: 30000000, // Supplied Gas
        value: ethers.utils.parseEther("1"), // Deposit Ether balance
      }
    );
    console.log(result2);




    // Check DAI balance
    const daiBalanceWei = await daiContract.balanceOf(wallet.address);
    console.log(`Dai Balance: ${ethers.utils.formatEther(daiBalanceWei)}`);


    
    // Check BAT balance
    const batBalanceWei = await BatContract.balanceOf(wallet.address);
    const batDecimal = await BatContract.decimals();
    console.log(`Bat Decimal is : ${batDecimal}`);
    console.log(`BAT Balance: ${ethers.utils.formatEther(batBalanceWei)}`);

  } catch (error) {
    console.error(error);
  }
};
//------------------------------------------------------------------------------------------------------------------------------------------
// Main Function End Here
main();
