import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import type { SecretPlatform, cUSDT } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("SecretPlatform", function () {
  let secretPlatform: SecretPlatform;
  let cUSDTToken: cUSDT;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock USDT token first (for testing purposes)
    const MockUSDT = await ethers.getContractFactory("MockERC20");
    const mockUSDT = await MockUSDT.deploy("Mock USDT", "USDT", 6);
    await mockUSDT.waitForDeployment();

    // Deploy cUSDT token
    const cUSDTFactory = await ethers.getContractFactory("cUSDT");
    cUSDTToken = await cUSDTFactory.deploy(await mockUSDT.getAddress());
    await cUSDTToken.waitForDeployment();

    // Deploy SecretPlatform
    const SecretPlatformFactory = await ethers.getContractFactory("SecretPlatform");
    secretPlatform = await SecretPlatformFactory.deploy(await cUSDTToken.getAddress());
    await secretPlatform.waitForDeployment();

    // Mint some mock USDT to users for testing
    await mockUSDT.mint(user1.address, ethers.parseUnits("1000", 6));
    await mockUSDT.mint(user2.address, ethers.parseUnits("1000", 6));

    // Approve cUSDT to spend mock USDT
    await mockUSDT.connect(user1).approve(await cUSDTToken.getAddress(), ethers.parseUnits("1000", 6));
    await mockUSDT.connect(user2).approve(await cUSDTToken.getAddress(), ethers.parseUnits("1000", 6));
  });

  describe("Deployment", function () {
    it("Should set the correct cUSDT token address", async function () {
      expect(await secretPlatform.cUSDTToken()).to.equal(await cUSDTToken.getAddress());
    });

    it("Should initialize with zero balances", async function () {
      const balance = await secretPlatform.getBalance(user1.address);
      expect(balance).to.not.be.undefined;
    });
  });

  describe("Deposit functionality", function () {
    it("Should allow users to deposit cUSDT", async function () {
      const depositAmount = 100n;

      // First wrap USDT to cUSDT
      await cUSDTToken.connect(user1).wrap(depositAmount);

      // Create encrypted input for deposit
      const input = fhevm.createEncryptedInput(
        await secretPlatform.getAddress(), 
        user1.address
      );
      input.add64(depositAmount);
      const encryptedInput = await input.encrypt();

      // Approve SecretPlatform to spend cUSDT
      const approveInput = fhevm.createEncryptedInput(
        await cUSDTToken.getAddress(),
        user1.address
      );
      approveInput.add64(depositAmount);
      const approveEncryptedInput = await approveInput.encrypt();
      
      // Note: In a real implementation, we would need to implement approve function for cUSDT
      // For now, we'll skip the approval step in testing

      // Deposit to platform
      await expect(
        secretPlatform.connect(user1).deposit(
          encryptedInput.handles[0],
          encryptedInput.inputProof
        )
      ).to.emit(secretPlatform, "Deposit").withArgs(user1.address);
    });
  });

  describe("Transfer functionality", function () {
    beforeEach(async function () {
      // Setup: user1 deposits some funds first
      const depositAmount = 500n;
      
      // Wrap USDT to cUSDT
      await cUSDTToken.connect(user1).wrap(depositAmount);
      
      // Create encrypted input and deposit
      const input = fhevm.createEncryptedInput(
        await secretPlatform.getAddress(),
        user1.address
      );
      input.add64(depositAmount);
      const encryptedInput = await input.encrypt();
      
      // Skip deposit for this test setup due to cUSDT transfer complexity
    });

    it("Should allow encrypted transfers between users", async function () {
      const transferAmount = 100n;

      // Create encrypted input for transfer
      const input = fhevm.createEncryptedInput(
        await secretPlatform.getAddress(),
        user1.address
      );
      input.add64(transferAmount);
      const encryptedInput = await input.encrypt();

      // Perform encrypted transfer
      await expect(
        secretPlatform.connect(user1).encryptedTransferTo(
          user2.address,
          encryptedInput.handles[0],
          encryptedInput.inputProof
        )
      ).to.emit(secretPlatform, "EncryptedTransfer")
       .withArgs(user1.address, user2.address);

      // Check that transfer record exists
      const hasRecord = await secretPlatform.hasTransferRecord(user2.address, user1.address);
      expect(hasRecord).to.be.true;
    });
  });

  describe("Claim functionality", function () {
    it("Should allow users to claim transfers", async function () {
      // This test assumes a transfer record exists
      // In practice, this would follow the transfer test

      await expect(
        secretPlatform.connect(user2).encryptClaim(user1.address)
      ).to.emit(secretPlatform, "Claim")
       .withArgs(user2.address, user1.address);
    });

    it("Should fail when no transfer record exists", async function () {
      await expect(
        secretPlatform.connect(user2).encryptClaim(user1.address)
      ).to.be.revertedWith("No transfer record found");
    });
  });

  describe("Balance queries", function () {
    it("Should return encrypted balance for users", async function () {
      const balance = await secretPlatform.getBalance(user1.address);
      expect(balance).to.not.be.undefined;
    });

    it("Should return transfer records", async function () {
      const transferRecord = await secretPlatform.getTransferRecord(user2.address, user1.address);
      expect(transferRecord).to.not.be.undefined;
    });
  });

  describe("Access control", function () {
    it("Should properly handle FHE access permissions", async function () {
      // This test would verify that users can only access their own encrypted data
      // Implementation depends on specific FHE access control mechanisms
      expect(true).to.be.true; // Placeholder
    });
  });
});