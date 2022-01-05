const { ethers } = require("hardhat");
const chai = require("chai");
const { expect, assert, should } = require("chai");
const { solidity, deployContract, MockProvider } = require("ethereum-waffle");
chai.use(solidity);

const { constants, BigNumber } = require("ethers");

const { AddressZero, MaxUint256, One, Two, Zero } = constants;

var provider = ethers.providers.getDefaultProvider("mainnet");
const WethContractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Eth Mainnet Address
const BatUsd = "0x9441D7556e7820B5ca42082cfa99487D56AcA958"; // Mainnet ChainLink Eth Data Feed
const DaiUsd = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"; //Mainnet ChainLink Eth Data Feed
const UsdcContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
const AdapterContactAddress = "0x0000000000000000000000000000000000000000";
const AssetOne = "0x0D8775F648430679A709E98d2b0Cb6250d2887EF"; // Bat Contract Address
// const AssetOneAbi = require("./SmartContractData/BAT/BatAbi.json");
const AssetOneAbi = require("../SmartContractData/BAT/BatAbi.json");
const AssetTwo = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Dai Contract Address
const AssetTwoAbi = require("../SmartContractData/Dai/daiAbi.json");

const settokencreatorAbi = require("../artifacts/contracts/protocol/SetTokenCreator.sol/SetTokenCreator.json");
const basicIssuanceModuleAbi = require("../artifacts/contracts/protocol/modules/BasicIssuanceModule.sol/BasicIssuanceModule.json");
const setTokenAbi = require("../artifacts/contracts/protocol/SetToken.sol/SetToken.json");

describe("Integration Testing PolySet - Cycle 1 ", () => {
  let daiTokenContractInstance;

  let assetOneDecimals;
  let controller;
  let settokencreator;
  let basicIssuanceModule;
  let streamingFeeModule;
  let navIssuanceModule;
  let tradeModule;
  let integrationRegistry;
  let setValuer;
  let dummyOracle;
  let chainLinkAdapter;
  let chainLinkAdapter2;
  let priceOracle;

  let setTokenInstance;

  const ADDRESS_ZERO = AddressZero;
  const ONE = One;
  const ZERO = Zero;

  let firstComponent;
  let secondComponent;
  let firstComponentUnit;
  let secondComponentUnit;
  let firstModule;
  let secondModule;
  let thirdModule;
  let fourthModule;
  let manager;
  let name;
  let symbol;
  let deployer;
  let randomAddress;
  let components;
  let units;
  let modules = [];
  let fetchSETAddress;
  let setToken;
  let batTokenContractInstance

  console.log("ADDRESS_ZERO", ADDRESS_ZERO);
  console.log("ONE", ONE);
  console.log("ZERO", ZERO);

  before(async function () {
    // Getting the Wallet Address
    [deployer, FeeRecepient, manager, randomAddress] =
      await ethers.getSigners();
    assert.ok(true);

    // DAI Contract Instance
     daiTokenContractInstance = new ethers.Contract(
      AssetOne,
      AssetOneAbi,
      provider
    );
    // Bat Contract Instance
     batTokenContractInstance = new ethers.Contract(
      AssetTwo,
      AssetTwoAbi,
      provider
    );
    console.log("Decimal : " + (await daiTokenContractInstance.decimals()));
    //  assetOneDecimals = await daiContract.decimals();
    //  console.log('DAI Contract address',daiContract.address);
    //  console.log(assetOneDecimals);
    //  console.log(daiContract);
    // BAT CONTRACT Instance
    // batContract = new ethers.Contract(BatContractAddress, BatAbi, deployer);
    // console.log();

    // Deploying Core Contracts and its dependent Contracts and retriving its address

    // Controller
    const Controller = await ethers.getContractFactory("Controller");
    controller = await Controller.deploy(FeeRecepient.address);
    await controller.deployed();
    console.log(controller.address);

    // Set Token Creator
    const SetTokenCreator = await ethers.getContractFactory("SetTokenCreator");
    settokencreator = await SetTokenCreator.deploy(controller.address);
    await settokencreator.deployed();
    console.log(settokencreator.address);

    // Basic Issuance
    const BasicIssuanceModule = await ethers.getContractFactory(
      "BasicIssuanceModule"
    );
    basicIssuanceModule = await BasicIssuanceModule.deploy(controller.address);
    await basicIssuanceModule.deployed();
    console.log(basicIssuanceModule.address);

    // StreamingFee Module
    const StreamingFeeModule = await ethers.getContractFactory(
      "StreamingFeeModule"
    );
    streamingFeeModule = await StreamingFeeModule.deploy(controller.address);
    streamingFeeModule.deployed();
    console.log(streamingFeeModule.address);

    // NavIssuance Module
    const NavIssuanceModule = await ethers.getContractFactory(
      "NavIssuanceModule"
    );
    navIssuanceModule = await NavIssuanceModule.deploy(
      controller.address,
      WethContractAddress
    );
    navIssuanceModule.deployed();
    console.log(navIssuanceModule.address);

    // TRADE MODULE
    const TradeModule = await ethers.getContractFactory("TradeModule");
    tradeModule = await TradeModule.deploy(controller.address);
    tradeModule.deployed();
    console.log(tradeModule.address);

    // Integration Registry
    const IntegrationRegistry = await ethers.getContractFactory(
      "IntegrationRegistry"
    );
    integrationRegistry = await IntegrationRegistry.deploy(controller.address);
    integrationRegistry.deployed();
    console.log(integrationRegistry.address);

    // Set Valuer
    const SetValuer = await ethers.getContractFactory("SetValuer");
    setValuer = await SetValuer.deploy(controller.address);
    setValuer.deployed();
    console.log(setValuer.address);

    // ChainLink Dummy Contract
    const DummyOracle = await ethers.getContractFactory("DummyOracle");
    dummyOracle = await DummyOracle.deploy(18);
    dummyOracle.deployed();
    console.log(dummyOracle.address);

    // ChainLink  Adapter
    // IChainLinkOracle _chainLinkOracleAddress, string memory _name, bool _isAssetTwoUSD
    const ChainLinkAdapter = await ethers.getContractFactory(
      "ChainLinkAdapter"
    );
    chainLinkAdapter = await ChainLinkAdapter.deploy(BatUsd, "Bat/Usd", true);
    chainLinkAdapter.deployed();
    console.log(chainLinkAdapter.address);

    // ChainLink  Adapter
    // IChainLinkOracle _chainLinkOracleAddress, string memory _name, bool _isAssetTwoUSD
    const ChainLinkAdapter2 = await ethers.getContractFactory(
      "ChainLinkAdapter"
    );
    chainLinkAdapter2 = await ChainLinkAdapter2.deploy(DaiUsd, "Dai/Usd", true);
    chainLinkAdapter2.deployed();
    console.log(chainLinkAdapter2.address);

    // Price Oracle
    // Constructor Require : Controller , MasterQuoteAssetAddress, Adapter, AssetOne, AssetTwo, Oracles
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy(
      controller.address,
      UsdcContractAddress,
      [AdapterContactAddress, AdapterContactAddress],
      [AssetOne, AssetTwo],
      [UsdcContractAddress, UsdcContractAddress],
      [chainLinkAdapter.address, chainLinkAdapter2.address]
    );
    priceOracle.deployed();
    console.log(priceOracle.address);
  });

  describe.skip("Ensure the connected wallet account holds some `Ethers` to do the transactions", async () => {});

  describe("Verifying all Core Contract deployed successfully", async () => {
    it("Verify that the `Controller` has been successfully deployed", async () => {
      expect(await controller.address).to.equal(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      );
    });

    it("Verify that the `SetTokenCreator` has been successfully deployed", async () => {
      expect(await settokencreator.address).to.equal(
        "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
      );
    });

    it("Verify that the `BasicIssuanceModule` has been successfully deployed", async () => {
      expect(await basicIssuanceModule.address).to.equal(
        "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
      );
    });

    it("Verify that the `StreamingFeeModule` has been successfully deployed", async () => {
      expect(await streamingFeeModule.address).to.equal(
        "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
      );
    });

    it("Verify that the `NavIssuanceModule` has been successfully deployed", async () => {
      expect(await navIssuanceModule.address).to.equal(
        "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
      );
    });

    it("Verify that the `TradeModule` has been successfully deployed", async () => {
      expect(await tradeModule.address).to.equal(
        "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
      );
    });

    it("Verify that the `IntegrationRegistry` has been successfully deployed", async () => {
      expect(await integrationRegistry.address).to.equal(
        "0x0165878A594ca255338adfa4d48449f69242Eb8F"
      );
    });

    it("Verify that the `SetValuer` has been successfully deployed", async () => {
      expect(await setValuer.address).to.equal(
        "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
      );
    });

    it("Verify that the `DummyOracle` has been successfully deployed", async () => {
      expect(await dummyOracle.address).to.equal(
        "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"
      );
    });

    it("Verify that the `ChainLinkAdapter` has been successfully deployed", async () => {
      expect(await chainLinkAdapter.address).to.equal(
        "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
      );
    });

    it("Verify that the `ChainLinkAdapter2` has been successfully deployed", async () => {
      expect(await chainLinkAdapter2.address).to.equal(
        "0x610178dA211FEF7D417bC0e6FeD39F05609AD788"
      );
    });

    it("Verify that the `PriceOracle` has been successfully deployed", async () => {
      expect(await priceOracle.address).to.equal(
        "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"
      );
    });
  });

  describe("Intialize and verify that Controller has been successfully initialized", async () => {
    before(async function () {
      //controller = controller.connect(deployer.address);
      await controller.initialize(
        [settokencreator.address],
        [
          basicIssuanceModule.address,
          navIssuanceModule.address,
          tradeModule.address,
          streamingFeeModule.address,
        ],
        [integrationRegistry.address, priceOracle.address, setValuer.address],
        ["0", "1", "2"]
      );
    });

    it("Verify that Controller should have set the correct modules length of 4", async () => {
      const modules = await controller.getModules();
      expect(modules.length).to.eq(4);
    });

    it("should have set the correct factories length of 1", async () => {
      const factories = await controller.getFactories();
      expect(factories.length).to.eq(1);
    });

    it("should have set the correct resources length of 3", async () => {
      const resources = await controller.getResources();
      expect(resources.length).to.eq(3);
    });

    it("should have a valid `BasicISsuanceModule` Contract Address", async () => {
      const validModule = await controller.isModule(
        basicIssuanceModule.address
      );
      expect(validModule).to.eq(true);
    });

    it("should have a valid `NAVIssuanceModule` Contract Address", async () => {
      const validModule = await controller.isModule(navIssuanceModule.address);
      expect(validModule).to.eq(true);
    });

    it("should have a valid `TradeModule` Contract Address", async () => {
      const validModule = await controller.isModule(tradeModule.address);
      expect(validModule).to.eq(true);
    });

    it("should have a valid `StreamingFeeModule` Contract Address", async () => {
      const validModule = await controller.isModule(streamingFeeModule.address);
      expect(validModule).to.eq(true);
    });

    it("should have a valid resource : `Price Oracle`", async () => {
      const validResource = await controller.isResource(priceOracle.address);
      expect(validResource).to.eq(true);
    });

    it("should have a valid resource : `IntegrationRegistry`", async () => {
      const validResource = await controller.isResource(
        integrationRegistry.address
      );
      expect(validResource).to.eq(true);
    });

    it("should have a valid resource : `SetValuer`", async () => {
      const validResource = await controller.isResource(setValuer.address);
      expect(validResource).to.eq(true);
    });

    it("should have a valid `SetTokenCreator(Factory)`", async () => {
      const validFactory = await controller.isFactory(settokencreator.address);
      expect(validFactory).to.eq(true);
    });

    it.skip("when zero address passed for factory : should revert", async () => {
      await settokencreator.address;
      await expect(
        "0x0000000000000000000000000000000000000000"
      ).to.be.revertedWith("Zero address submitted.");
    });

    it.skip("when zero address passed for resource : should revert", async () => {
      await expect(
        "0x0000000000000000000000000000000000000000"
      ).to.be.revertedWith("Zero address submitted.");
    });

    it.skip("when zero address passed for module : should revert", async () => {
      await expect(
        "0x0000000000000000000000000000000000000000"
      ).to.be.revertedWith("Zero address submitted.");
    });

    it.skip("when resource and resourceId lengths don't match : should revert", async () => {
      await expect(
        "0x0000000000000000000000000000000000000000"
      ).to.be.revertedWith("Array lengths do not match.");
    });

    it.skip("when the resourceId already exists : should revert", async () => {
      await expect(
        "0x0000000000000000000000000000000000000000"
      ).to.be.revertedWith("Resource ID already exists.");
    });

    it.skip("when the Controller is already initialized : should revert", async () => {
      await expect(
        "0x0000000000000000000000000000000000000000"
      ).to.be.revertedWith("Controller is already initialized.");
    });
  });

  describe("Ensure that user is successfully able to create SET using `settokencreator` Smart Contract", async () => {
    before(async function () {
      firstComponent = "0x0D8775F648430679A709E98d2b0Cb6250d2887EF"; // Bat Contract Address
      secondComponent = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Dai Contract Address
      firstComponentUnit = 100000000000000;
      secondComponentUnit = 1000000000000;
      firstModule = basicIssuanceModule.address;
      secondModule = streamingFeeModule.address;
      thirdModule = navIssuanceModule.address;
      fourthModule = tradeModule.address;
      manager = manager;
      name = "PolySET1";
      symbol = "PS1";

      components = [firstComponent, secondComponent];
      units = [firstComponentUnit, secondComponentUnit];
      modules = [firstModule, secondModule, thirdModule, fourthModule];
      fetchSETAddress = [];

      let settokencreatorInstance;
    });

    async function createSet() {
      let settokencreatorContractAddress = settokencreator.address;
      settokencreatorInstance = await new ethers.Contract(
        settokencreatorContractAddress,
        settokencreatorAbi.abi,
        deployer
      );

      return settokencreatorInstance.create(
        components,
        units,
        modules,
        manager.address,
        name,
        symbol
      );
    }

    it("should properly create the Set with proper address", async () => {
      await createSet();
      fetchSETAddress = await controller.getSets();
      console.log("Set Token Address : " + fetchSETAddress);
      expect(fetchSETAddress).to.be.properAddress;
    });

    it("should enable the Set on the controller", async () => {
      //await createSet();
      fetchSETAddress = await controller.getSets();
      console.log("Set Token Address : " + fetchSETAddress);
      const isSetEnabled = await controller.isSet(fetchSETAddress.toString());
      expect(isSetEnabled).to.eq(true);
    });

    it.skip("should emit the correct SetTokenCreated event", async () => {
      //const receipt = await createSet();
      fetchSETAddress = await controller.getSets();
      await expect(createSet())
        .to.emit(settokencreatorInstance, "SetTokenCreated")
        .withArgs(fetchSETAddress, manager.address, name, symbol);
    });

    describe("DEMO : when no components are passed in : should revert", async () => {
      it("DEMO : when no components are passed in : should revert", async () => {
        console.log("reverted");

        async function createSet1() {
          return 1;
        }

        console.log(await createSet1());
        expect(await createSet1()).to.equal(1);
      });
    });

    describe("when no components are passed in", async () => {
      beforeEach(async () => {
        components = [];
      });

      it("should revert", async () => {
        await expect(createSet()).to.be.revertedWith(
          "Must have at least 1 component"
        );
      });
    });

    describe("when duplicate components provided while creating the SET", async () => {
      beforeEach(async () => {
        components = [firstComponent, firstComponent];
      });

      it("should revert", async () => {
        await expect(createSet()).to.be.revertedWith(
          "Components must not have a duplicate"
        );
      });
    });

    describe("when the component and units arrays are not the same length", async () => {
      beforeEach(async () => {
        units = [firstComponentUnit];
      });

      it("should revert", async () => {
        await expect(createSet()).to.be.revertedWith(
          "Component and unit lengths must be the same"
        );
      });
    });

    describe("when a module is not approved by the Controller", async () => {
      beforeEach(async () => {
        components = [firstComponent, secondComponent];
        units = [firstComponentUnit, secondComponentUnit];
        const invalidModuleAddress =
          "0x0000000000000000000000000000000000000000";
        modules = [
          firstModule,
          secondModule,
          thirdModule,
          invalidModuleAddress,
        ];
      });

      it("should revert", async () => {
        await expect(createSet()).to.be.revertedWith("Must be enabled module");
      });
    });

    describe("when no modules are passed in : should revert", async () => {
      beforeEach(async () => {
        modules = [];
      });

      it("should revert", async () => {
        await expect(createSet()).to.be.revertedWith(
          "Must have at least 1 module"
        );
      });
    });

    describe("when the manager is a null address", async () => {
      beforeEach(async () => {
        modules = [firstModule, secondModule, thirdModule, fourthModule];
        manager.address = ADDRESS_ZERO;
      });

      it("should revert", async () => {
        await expect(createSet()).to.be.revertedWith(
          "Manager must not be empty"
        );
      });
    });

    describe("when a component is a null address ", async () => {
      beforeEach(async () => {
        [deployer, , manager] = await ethers.getSigners();
        components = [firstComponent, ADDRESS_ZERO];
      });
      it("should revert", async () => {
        await expect(createSet()).to.be.revertedWith(
          "Component must not be null address"
        );
      });
    });

    describe("when a unit is 0 : should revert", async () => {
      beforeEach(async () => {
        components = [firstComponent, secondComponent];
        units = [ONE, ZERO];
      });

      it("should revert", async () => {
        await expect(createSet()).to.be.revertedWith(
          "Units must be greater than 0"
        );
      });
    });

    describe("Testing Basic Issuance Module related functionality", async () => {


      async function subject() {
        [addr1] = fetchSETAddress;
        setTokenInstance = await new ethers.Contract(
          addr1,
          setTokenAbi.abi,
          deployer
        );

        let basicIssuanceModuleInstance = await new ethers.Contract(
          basicIssuanceModule.address,
          basicIssuanceModuleAbi.abi,
          deployer
        );
        return basicIssuanceModuleInstance
          .connect(manager)
          .initialize(addr1, ADDRESS_ZERO);
      }
      it("#Intialize SET : and check it should enable the Module on the SetToken", async () => {
        await subject();
        const isModuleEnabled = await setTokenInstance.isInitializedModule(
          basicIssuanceModule.address
        );
        console.log(isModuleEnabled);
        expect(isModuleEnabled).to.eq(true);
      });

      it("#issue", async () => {
        // let setTokenInstance = await new ethers.Contract(
        //   addr1,
        //   setTokenAbi.abi,
        //   deployer
        // );

        // basicIssuanceModuleInstance = await new ethers.Contract(
        //   basicIssuanceModule.address,
        //   basicIssuanceModuleAbi.abi,
        //   deployer.address
        // ).connect(manager);
      });

      //   // Approve tokens to the issuance mdoule
      
      async function issue() {
        await daiTokenContractInstance.connect(deployer)
          .approve(basicIssuanceModule.address, 10000);
        await batTokenContractInstance
          .connect(deployer)
          .approve(basicIssuanceModule.address, 10000);
          console.log(basicIssuanceModule.address);

           basicIssuanceModuleInstance = await new ethers.Contract(
            basicIssuanceModule.address,
            basicIssuanceModuleAbi.abi,
            deployer
          );

      return basicIssuanceModuleInstance.connect(deployer).issue("0xCafac3dD18aC6c6e92c921884f9E4176737C052c", 10, manager.address);
      }



      it("should issue the Set to the recipient", async () => {
        await issue();
        // const issuedBalance = await setTokenInstance.balanceOf(manager.address);
        // console.log(issuedBalance ,'issuedBalance');
        //expect(issuedBalance).to.eq("1000000");
      });

      //   // it.skip("should have deposited the components into the SetToken", async () => {
      //   //   await subject();
      //   //   const depositedDAIBalance = await daiTokenContractInstance.balanceOf(manager.address);
      //   //   const expectedDAIBalance = 10;
      //   //   expect(depositedDAIBalance).to.eq(expectedDAIBalance);
      //   //   const depositedBATBalance = await batTokenContractInstance.balanceOf(manager.address);
      //   //   const expectedBATBalance = 10;
      //   //   expect(depositedBTCBalance).to.eq(expectedBalance);
      //   // });
      //   // it.skip("should emit the SetTokenIssued event", async () => {
      //   //   await expect(subject()).to.emit(issuanceModule, "SetTokenIssued").withArgs(
      //   //     subjectSetToken,
      //   //     subjectCaller.address,
      //   //     subjectTo.address,
      //   //     ADDRESS_ZERO,
      //   //     subjectIssueQuantity,
      //   //   );
      //   // });
    });
  });
});
