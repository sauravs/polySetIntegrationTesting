const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const WethContractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Eth Mainnet Address
const BatUsd = "0x9441D7556e7820B5ca42082cfa99487D56AcA958"; // Mainnet ChainLink Eth Data Feed
const DaiUsd = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"; //Mainnet ChainLink Eth Data Feed
const UsdcContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
const AdapterContactAddress = "0x0000000000000000000000000000000000000000";
const AssetOne = "0x0D8775F648430679A709E98d2b0Cb6250d2887EF"; // Bat Contract Address
const AssetOneTwo = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Dai Contract Address

describe("Testing Cycle 1", () => {
  describe("Checking for the Addressses", () => {
    beforeEach(async function () {
      // Getting the Wallet Address
      const [deployer, FeeRecepient] = await ethers.getSigners();
      assert.ok(true);

      // Controller
      const Controller = await ethers.getContractFactory("Controller");
      const controller = await Controller.deploy(FeeRecepient.address);
      await controller.deployed();
      // Set Token Creator
      const SetTokenCreator = await ethers.getContractFactory(
        "SetTokenCreator"
      );
      const setTokenCreator = await SetTokenCreator.deploy(controller.address);
      await setTokenCreator.deployed();

      // Basic Issuance
      const BasicIssuanceModule = await ethers.getContractFactory(
        "BasicIssuanceModule"
      );
      const basicIssuanceModule = await BasicIssuanceModule.deploy(
        controller.address
      );
      await basicIssuanceModule.deployed();

      // StreamingFee Module
      const StreamingFeeModule = await ethers.getContractFactory(
        "StreamingFeeModule"
      );
      const streamingFeeModule = await StreamingFeeModule.deploy(
        controller.address
      );
      streamingFeeModule.deployed();

      // NavIssuance Module
      const NavIssuanceModule = await ethers.getContractFactory(
        "NavIssuanceModule"
      );
      const navIssuanceModule = await NavIssuanceModule.deploy(
        controller.address,
        WethContractAddress
      );
      navIssuanceModule.deployed();

      // TRADE MODULE
      const TradeModule = await ethers.getContractFactory("TradeModule");
      const tradeModule = await TradeModule.deploy(controller.address);
      tradeModule.deployed();

      // Integration Registry
      const IntegrationRegistry = await ethers.getContractFactory(
        "IntegrationRegistry"
      );
      const integrationRegistry = await IntegrationRegistry.deploy(
        controller.address
      );
      integrationRegistry.deployed();

      // Set Valuer
      const SetValuer = await ethers.getContractFactory("SetValuer");
      const setValuer = await SetValuer.deploy(controller.address);
      setValuer.deployed();

      // ChainLink Dummy Contract
      const DummyOracle = await ethers.getContractFactory("DummyOracle");
      const dummyOracle = await DummyOracle.deploy(18);
      dummyOracle.deployed();

      // ChainLink  Adapter
      // IChainLinkOracle _chainLinkOracleAddress, string memory _name, bool _isAssetTwoUSD
      const ChainLinkAdapter = await ethers.getContractFactory(
        "ChainLinkAdapter"
      );
      const chainLinkAdapter = await ChainLinkAdapter.deploy(
        BatUsd,
        "Bat/Usd",
        true
      );
      chainLinkAdapter.deployed();

      // ChainLink  Adapter
      // IChainLinkOracle _chainLinkOracleAddress, string memory _name, bool _isAssetTwoUSD
      const ChainLinkAdapter2 = await ethers.getContractFactory(
        "ChainLinkAdapter"
      );
      const chainLinkAdapter2 = await ChainLinkAdapter2.deploy(
        DaiUsd,
        "Dai/Usd",
        true
      );
      chainLinkAdapter2.deployed();

      // Price Oracle
      // Constructor Require : Controller , MasterQuoteAssetAddress, Adapter, AssetOne, AssetTwo, Oracles
      const PriceOracle = await ethers.getContractFactory("PriceOracle");
      const priceOracle = await PriceOracle.deploy(
        controller.address,
        UsdcContractAddress,
        [AdapterContactAddress, AdapterContactAddress],
        [AssetOne, AssetOneTwo],
        [UsdcContractAddress, WethContractAddress],
        [chainLinkAdapter.address, chainLinkAdapter2.address]
      );
      priceOracle.deployed();
    });
  });

  describe("Checking the Admin and Fee Receipt Address", async () => {
    it("Should have owner address", async () => {
      const [deployer, deployer2] = await ethers.getSigners();
      expect(await deployer.address).to.equal(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      );
    });
  });

  describe("Checking the Admin and Fee Receipt Address", async () => {
    it("Should have Fee Recepient address", async () => {
      const [deployer, deployer2] = await ethers.getSigners();
      expect(await deployer2.address).to.equal(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      );
    });

    //   it("Call the Initialize function", async () => {});
  });

  describe("Controller", () => {
    it("Controller Initilize function call", async () => {
      //   controller = controller.connect(deployer.address);
      expect(
        await controller.initialize(
          [setTokenCreator.address],
          [basicIssuanceModule.address, navIssuanceModule.address],
          [integrationRegistry.address, priceOracle.address, setValuer.address],
          ["0", "1", "2"]
        )
      ).deployed();
    });
  });
});
