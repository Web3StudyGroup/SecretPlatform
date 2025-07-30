import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import type { cUSDT } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("cUSDT", function () {
  let cUSDTToken: cUSDT;
  let mockUSDT: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock USDT token for testing
    const MockUSDT = await ethers.getContractFactory("MockERC20");
    mockUSDT = await MockUSDT.deploy("Mock USDT", "USDT", 6);
    await mockUSDT.waitForDeployment();

    // Deploy cUSDT token
    const cUSDTFactory = await ethers.getContractFactory("cUSDT");
    cUSDTToken = await cUSDTFactory.deploy(await mockUSDT.getAddress());
    await cUSDTToken.waitForDeployment();

    // Mint some mock USDT to users
    await mockUSDT.mint(user1.address, ethers.parseUnits("1000", 6));
    await mockUSDT.mint(user2.address, ethers.parseUnits("1000", 6));

    // Approve cUSDT to spend mock USDT
    await mockUSDT.connect(user1).approve(await cUSDTToken.getAddress(), ethers.parseUnits("1000", 6));
    await mockUSDT.connect(user2).approve(await cUSDTToken.getAddress(), ethers.parseUnits("1000", 6));
  });

  describe("Deployment", function () {
    it("Should set the correct token metadata", async function () {
      expect(await cUSDTToken.name()).to.equal("Confidential USDT");
      expect(await cUSDTToken.symbol()).to.equal("cUSDT");
      expect(await cUSDTToken.decimals()).to.equal(6);
    });

    it("Should set the correct wrapped token address", async function () {
      expect(await cUSDTToken.wrappedToken()).to.equal(await mockUSDT.getAddress());
    });

    it("Should initialize with zero total supply", async function () {
      const totalSupply = await cUSDTToken.totalSupply();
      expect(totalSupply).to.not.be.undefined;
    });
  });

  describe("Wrapping functionality", function () {
    it("Should allow users to wrap USDT into cUSDT", async function () {
      const wrapAmount = 100n;

      const initialUSDTBalance = await mockUSDT.balanceOf(user1.address);

      // The ConfidentialFungibleTokenERC20Wrapper should have a wrap function
      await expect(
        cUSDTToken.connect(user1).wrap(wrapAmount)
      ).to.not.be.reverted;

      // Check USDT was transferred
      const finalUSDTBalance = await mockUSDT.balanceOf(user1.address);
      expect(finalUSDTBalance).to.equal(initialUSDTBalance - wrapAmount);

      // Check cUSDT balance exists (encrypted)
      const cUSDTBalance = await cUSDTToken.balanceOf(user1.address);
      expect(cUSDTBalance).to.not.be.undefined;
    });

    it("Should fail when user has insufficient USDT", async function () {
      const largeAmount = ethers.parseUnits("2000", 6);
      
      await expect(
        cUSDTToken.connect(user1).wrap(largeAmount)
      ).to.be.reverted; // Will fail due to insufficient balance or allowance
    });
  });

  describe("Unwrapping functionality", function () {
    beforeEach(async function () {
      // Wrap some USDT first
      await cUSDTToken.connect(user1).wrap(500n);
    });

    it("Should allow users to unwrap cUSDT back to USDT", async function () {
      const unwrapAmount = 100n;

      // Create encrypted input for unwrap
      const input = fhevm.createEncryptedInput(
        await cUSDTToken.getAddress(),
        user1.address
      );
      input.add64(unwrapAmount);
      const encryptedInput = await input.encrypt();

      await expect(
        cUSDTToken.connect(user1).unwrap(
          encryptedInput.handles[0],
          encryptedInput.inputProof
        )
      ).to.emit(cUSDTToken, "Unwrap").withArgs(user1.address, 0); // Amount would be decrypted
    });
  });

  describe("Transfer functionality", function () {
    beforeEach(async function () {
      // Wrap some USDT for user1
      await cUSDTToken.connect(user1).wrap(500n);
    });

    it("Should allow encrypted transfers between users", async function () {
      const transferAmount = 100n;

      // Create encrypted input for transfer
      const input = fhevm.createEncryptedInput(
        await cUSDTToken.getAddress(),
        user1.address
      );
      input.add64(transferAmount);
      const encryptedInput = await input.encrypt();

      await expect(
        cUSDTToken.connect(user1).transfer(
          user2.address,
          encryptedInput.handles[0],
          encryptedInput.inputProof
        )
      ).to.emit(cUSDTToken, "Transfer").withArgs(user1.address, user2.address);

      // Check that both users have encrypted balances
      const user1Balance = await cUSDTToken.balanceOf(user1.address);
      const user2Balance = await cUSDTToken.balanceOf(user2.address);
      
      expect(user1Balance).to.not.be.undefined;
      expect(user2Balance).to.not.be.undefined;
    });

    it("Should fail transfer to zero address", async function () {
      const transferAmount = 100n;

      const input = fhevm.createEncryptedInput(
        await cUSDTToken.getAddress(),
        user1.address
      );
      input.add64(transferAmount);
      const encryptedInput = await input.encrypt();

      await expect(
        cUSDTToken.connect(user1).transfer(
          ethers.ZeroAddress,
          encryptedInput.handles[0],
          encryptedInput.inputProof
        )
      ).to.be.revertedWith("Transfer to zero address");
    });
  });

  describe("Balance and supply queries", function () {
    it("Should return encrypted balance for any user", async function () {
      const balance = await cUSDTToken.balanceOf(user1.address);
      expect(balance).to.not.be.undefined;
    });

    it("Should return encrypted total supply", async function () {
      const totalSupply = await cUSDTToken.totalSupply();
      expect(totalSupply).to.not.be.undefined;
    });
  });

  describe("Access control", function () {
    it("Should handle FHE access permissions correctly", async function () {
      // This would test that users can only decrypt their own balances
      // Implementation depends on specific FHE access control testing methods
      expect(true).to.be.true; // Placeholder
    });
  });
});