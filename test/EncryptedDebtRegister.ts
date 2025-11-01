import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedDebtRegister, EncryptedDebtRegister__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedDebtRegister")) as EncryptedDebtRegister__factory;
  const debtRegisterContract = (await factory.deploy()) as EncryptedDebtRegister;
  const debtRegisterContractAddress = await debtRegisterContract.getAddress();

  return { debtRegisterContract, debtRegisterContractAddress };
}

describe("EncryptedDebtRegister", function () {
  let signers: Signers;
  let debtRegisterContract: EncryptedDebtRegister;
  let debtRegisterContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ debtRegisterContract, debtRegisterContractAddress } = await deployFixture());
  });

  it("should initialize with zero debts", async function () {
    const totalCount = await debtRegisterContract.getTotalDebtCount();
    expect(totalCount).to.eq(0);
  });

  it("should submit a new debt record", async function () {
    const debtAmount = 5000; // $5000
    const debtType = 0; // Loan

    // Encrypt owner address
    const encryptedOwner = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();

    // Encrypt debt amount
    const encryptedAmount = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.alice.address)
      .add32(debtAmount)
      .encrypt();

    const tx = await debtRegisterContract
      .connect(signers.alice)
      .submitDebt(
        encryptedOwner.handles[0],
        encryptedAmount.handles[0],
        encryptedAmount.inputProof,
        debtType
      );
    await tx.wait();

    const totalCount = await debtRegisterContract.getTotalDebtCount();
    expect(totalCount).to.eq(1);

    const userDebtCount = await debtRegisterContract.getUserDebtCount(signers.alice.address);
    expect(userDebtCount).to.eq(1);

    const debtId = await debtRegisterContract.getUserDebtIdAt(signers.alice.address, 0);
    expect(debtId).to.eq(1);

    const metadata = await debtRegisterContract.getDebtMetadata(debtId);
    expect(metadata.submitter).to.eq(signers.alice.address);
    expect(metadata.debtType).to.eq(debtType);
    expect(metadata.isActive).to.eq(true);
  });

  it("should retrieve and decrypt encrypted debt amount", async function () {
    const debtAmount = 3000; // $3000
    const debtType = 1; // CreditCard

    // Encrypt owner address
    const encryptedOwner = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();

    // Encrypt debt amount
    const encryptedAmount = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.alice.address)
      .add32(debtAmount)
      .encrypt();

    const tx = await debtRegisterContract
      .connect(signers.alice)
      .submitDebt(
        encryptedOwner.handles[0],
        encryptedAmount.handles[0],
        encryptedAmount.inputProof,
        debtType
      );
    await tx.wait();

    const debtId = await debtRegisterContract.getUserDebtIdAt(signers.alice.address, 0);
    const encryptedDebtAmount = await debtRegisterContract.getEncryptedAmount(debtId);

    // Decrypt the amount
    const clearAmount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedDebtAmount,
      debtRegisterContractAddress,
      signers.alice,
    );

    expect(clearAmount).to.eq(debtAmount);
  });

  it("should update debt status", async function () {
    const debtAmount = 2000;
    const debtType = 2; // Borrowing

    // Encrypt owner address
    const encryptedOwner = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();

    // Encrypt debt amount
    const encryptedAmount = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.alice.address)
      .add32(debtAmount)
      .encrypt();

    let tx = await debtRegisterContract
      .connect(signers.alice)
      .submitDebt(
        encryptedOwner.handles[0],
        encryptedAmount.handles[0],
        encryptedAmount.inputProof,
        debtType
      );
    await tx.wait();

    const debtId = await debtRegisterContract.getUserDebtIdAt(signers.alice.address, 0);
    
    // Mark debt as inactive (paid/closed)
    tx = await debtRegisterContract
      .connect(signers.alice)
      .updateDebtStatus(debtId, false);
    await tx.wait();

    const metadata = await debtRegisterContract.getDebtMetadata(debtId);
    expect(metadata.isActive).to.eq(false);
  });

  it("should track debt type statistics", async function () {
    const debtAmount = 1000;

    // Submit Loan (type 0)
    const encryptedOwner1 = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();
    const encryptedAmount1 = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.alice.address)
      .add32(debtAmount)
      .encrypt();

    await debtRegisterContract
      .connect(signers.alice)
      .submitDebt(
        encryptedOwner1.handles[0],
        encryptedAmount1.handles[0],
        encryptedAmount1.inputProof,
        0
      );

    // Submit CreditCard (type 1)
    const encryptedOwner2 = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.bob.address)
      .addAddress(signers.bob.address)
      .encrypt();
    const encryptedAmount2 = await fhevm
      .createEncryptedInput(debtRegisterContractAddress, signers.bob.address)
      .add32(debtAmount)
      .encrypt();

    await debtRegisterContract
      .connect(signers.bob)
      .submitDebt(
        encryptedOwner2.handles[0],
        encryptedAmount2.handles[0],
        encryptedAmount2.inputProof,
        1
      );

    const loanCount = await debtRegisterContract.typeCounts(0);
    const creditCardCount = await debtRegisterContract.typeCounts(1);

    expect(loanCount).to.eq(1);
    expect(creditCardCount).to.eq(1);
  });
});

