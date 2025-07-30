import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

// Quick deployment for testing
task("quick-deploy", "Quick deploy for testing")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    console.log("🚀 Quick deployment starting...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    // Deploy MockUSDT
    const MockUSDT = await ethers.getContractFactory("MockERC20");
    const mockUSDT = await MockUSDT.deploy("Mock USDT", "USDT", 6);
    await mockUSDT.waitForDeployment();
    console.log("✅ MockUSDT:", await mockUSDT.getAddress());
    
    // Deploy cUSDT
    const cUSDTFactory = await ethers.getContractFactory("cUSDT");
    const cUSDT = await cUSDTFactory.deploy(await mockUSDT.getAddress());
    await cUSDT.waitForDeployment();
    console.log("✅ cUSDT:", await cUSDT.getAddress());
    
    // Deploy SecretPlatform
    const SecretPlatformFactory = await ethers.getContractFactory("SecretPlatform");
    const platform = await SecretPlatformFactory.deploy(await cUSDT.getAddress());
    await platform.waitForDeployment();
    console.log("✅ SecretPlatform:", await platform.getAddress());
    
    // Mint test tokens
    await mockUSDT.mint(deployer.address, ethers.parseUnits("10000", 6));
    console.log("💰 Minted 10,000 USDT to deployer");
    
    return {
      usdt: await mockUSDT.getAddress(),
      cUSDT: await cUSDT.getAddress(),
      platform: await platform.getAddress()
    };
  });

// Check contract info
task("info", "Show contract information")
  .addParam("address", "Contract address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const address = taskArguments.address;
    console.log("📋 Contract Info for:", address);
    
    try {
      // Try to get as cUSDT
      const cUSDT = await ethers.getContractAt("cUSDT", address);
      const name = await cUSDT.name();
      const symbol = await cUSDT.symbol();
      const decimals = await cUSDT.decimals();
      const underlying = await cUSDT.underlying();
      
      console.log("Type: cUSDT Token");
      console.log("Name:", name);
      console.log("Symbol:", symbol);
      console.log("Decimals:", decimals);
      console.log("Underlying:", underlying);
      return;
    } catch (e) {
      // Not a cUSDT contract
    }
    
    try {
      // Try to get as SecretPlatform
      const platform = await ethers.getContractAt("SecretPlatform", address);
      const cUSDTToken = await platform.cUSDTToken();
      
      console.log("Type: SecretPlatform");
      console.log("cUSDT Token:", cUSDTToken);
      return;
    } catch (e) {
      // Not a SecretPlatform contract
    }
    
    try {
      // Try to get as ERC20
      const erc20 = await ethers.getContractAt("IERC20", address);
      const mockERC20 = await ethers.getContractAt("MockERC20", address);
      const name = await mockERC20.name();
      const symbol = await mockERC20.symbol();
      const decimals = await mockERC20.decimals();
      
      console.log("Type: ERC20 Token");
      console.log("Name:", name);
      console.log("Symbol:", symbol);
      console.log("Decimals:", decimals);
      return;
    } catch (e) {
      console.log("❌ Unknown contract type or invalid address");
    }
  });

// Setup test environment
task("setup-test", "Setup test environment with sample data")
  .addParam("usdt", "USDT contract address")
  .addParam("cusdt", "cUSDT contract address")  
  .addParam("platform", "Platform contract address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [user1, user2] = await ethers.getSigners();
    
    console.log("🔧 Setting up test environment...");
    console.log("User1:", user1.address);
    console.log("User2:", user2.address);
    
    const usdt = await ethers.getContractAt("MockERC20", taskArguments.usdt);
    const cUSDT = await ethers.getContractAt("cUSDT", taskArguments.cusdt);
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    
    // Mint USDT to users
    await usdt.mint(user1.address, ethers.parseUnits("1000", 6));
    await usdt.mint(user2.address, ethers.parseUnits("1000", 6));
    console.log("💰 Minted USDT to users");
    
    // Approve and wrap to cUSDT
    await usdt.connect(user1).approve(taskArguments.cusdt, ethers.parseUnits("500", 6));
    await usdt.connect(user2).approve(taskArguments.cusdt, ethers.parseUnits("500", 6));
    
    await cUSDT.connect(user1).wrap(user1.address, ethers.parseUnits("500", 6));
    await cUSDT.connect(user2).wrap(user2.address, ethers.parseUnits("500", 6));
    console.log("🔄 Wrapped USDT to cUSDT");
    
    // Approve platform as operator
    const until = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    await platform.connect(user1).approveTokenOperator(until);
    await platform.connect(user2).approveTokenOperator(until);
    console.log("✅ Approved platform as operator");
    
    console.log("🎉 Test environment ready!");
  });

// Get all balances
task("balances", "Show all balances for an address")
  .addParam("user", "User address")
  .addParam("usdt", "USDT contract address")
  .addParam("cusdt", "cUSDT contract address")
  .addParam("platform", "Platform contract address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const userAddress = taskArguments.user;
    
    console.log("💰 Balances for:", userAddress);
    
    // USDT balance
    const usdt = await ethers.getContractAt("IERC20", taskArguments.usdt);
    const usdtBalance = await usdt.balanceOf(userAddress);
    console.log("USDT:", ethers.formatUnits(usdtBalance, 6));
    
    // cUSDT balance (encrypted - just show handle)
    const cUSDT = await ethers.getContractAt("cUSDT", taskArguments.cusdt);
    const cUSDTBalance = await cUSDT.confidentialBalanceOf(userAddress);
    console.log("cUSDT (encrypted handle):", cUSDTBalance);
    
    // Platform balance (encrypted - just show handle)
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    const platformBalance = await platform.getBalance(userAddress);
    console.log("Platform (encrypted handle):", platformBalance);
  });

export default {};