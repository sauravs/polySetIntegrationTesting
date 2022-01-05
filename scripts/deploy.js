const { ethers } = require("hardhat");
const WethContractAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // Eth Mainnet Address

const UsdcContractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
const AdapterContactAddress = '0x0000000000000000000000000000000000000000';
// const AdapterContactAddress = '';
const AssetOne = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF'; // Bat Contract Address
const AssetOneTwo = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // Dai Contract Address
const AssetOneThree = '';
const AssetTwo = '';
const AssetTwoTwo = '';
const AssetTwoThree = '';
const OracleOne = '';
const OracleTwo = ''; // Chain Link Oracle Address
const BatUsd = '0x9441D7556e7820B5ca42082cfa99487D56AcA958'; // Mainnet ChainLink Eth Data Feed
const DaiUsd = '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9'; //Mainnet ChainLink Eth Data Feed

async function main() {
    const [deployer, deployer2] = await ethers.getSigners();
    console.log('Deploying contracts with the account : ' + deployer.address);
    

    // Deploy Controller
    const Controller = await ethers.getContractFactory('Controller');
    const controller = await Controller.deploy(deployer2.address);
    console.log('Controller Contract Address : ' + controller.address);

    // SetTokenCreator
    const SetTokenCreator = await ethers.getContractFactory('SetTokenCreator');
    const setTokenCreator = await SetTokenCreator.deploy(controller.address);
    console.log("Set Token Creator Address : " + setTokenCreator.address);

    // Basic Issuance 
    const BasicIssuanceModule = await ethers.getContractFactory('BasicIssuanceModule');
    const basicIssuanceModule = await BasicIssuanceModule.deploy(controller.address);
    console.log("Basic Issuance Contract Address : " + basicIssuanceModule.address);

    //  Streaming Fee Module
    const StreamingFeeModule = await ethers.getContractFactory('StreamingFeeModule');
    const streamingFeeModule = await StreamingFeeModule.deploy(controller.address);
    console.log("Streaming Fee Module Contract Address : " + streamingFeeModule.address);

    // Nav Issuance
    const NavIssuanceModule = await ethers.getContractFactory('NavIssuanceModule');
    const navIssuanceModule = await NavIssuanceModule.deploy(controller.address, WethContractAddress);
    console.log("Nav Issance Module Contract Address : " + navIssuanceModule.address );

    // TRADE MODULE
    const TradeModule = await ethers.getContractFactory('TradeModule');
    const tradeModule = await TradeModule.deploy(controller.address);
    console.log('Trade Module Contract Address : ' + tradeModule.address);

    // Integration Registry
    const IntegrationRegistry = await ethers.getContractFactory('IntegrationRegistry');
    const integrationRegistry = await IntegrationRegistry.deploy(controller.address);
    console.log("Integration Registry Contract Address : " + integrationRegistry.address);

    // Set Valuer
    const SetValuer = await ethers.getContractFactory('SetValuer');
    const setValuer = await SetValuer.deploy(controller.address);
    console.log("Set Valuer Contract Address : " + setValuer.address);

    // ChainLink Dummy Contract
    const DummyOracle = await ethers.getContractFactory('DummyOracle');
    const dummyOracle = await DummyOracle.deploy(18);
    console.log("Dummy Oracle Contract Address : " + dummyOracle.address);
    
    // ChainLink  Adapter
    // IChainLinkOracle _chainLinkOracleAddress, string memory _name, bool _isAssetTwoUSD
    const ChainLinkAdapter = await ethers.getContractFactory('ChainLinkAdapter');
    const chainLinkAdapter = await ChainLinkAdapter.deploy(BatUsd, 'Bat/Usd', true);
    console.log("Bat/Usd Chainlink Adapter Contract Adddress : " + chainLinkAdapter.address);
    
    // ChainLink  Adapter
    // IChainLinkOracle _chainLinkOracleAddress, string memory _name, bool _isAssetTwoUSD
    const ChainLinkAdapter2 = await ethers.getContractFactory('ChainLinkAdapter');
    const chainLinkAdapter2 = await ChainLinkAdapter2.deploy(DaiUsd, 'Dai/Usd', true);
    console.log("Dai/Usd Chainlink Adapter Contract Adddress : " + chainLinkAdapter2.address);


    // Price Oracle
    // Constructor Require : Controller , MasterQuoteAssetAddress, Adapter, AssetOne, AssetTwo, Oracles 
    const PriceOracle = await ethers.getContractFactory('PriceOracle');
    const priceOracle = await PriceOracle.deploy(controller.address,UsdcContractAddress,[AdapterContactAddress, AdapterContactAddress], [AssetOne, AssetOneTwo], [UsdcContractAddress, WethContractAddress],[chainLinkAdapter.address, chainLinkAdapter2.address]);
    // const priceOracle = await PriceOracle.deploy(controller.address,UsdcContractAddress,[''], ['Bat', 'Dai'], [UsdcContractAddress, WethContractAddress],[OracleOne, OracleTwo]);
    console.log("Price Orcale Contract Address : " + priceOracle.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
