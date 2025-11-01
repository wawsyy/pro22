import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the EncryptedDebtRegister contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the EncryptedDebtRegister contract
 *
 *   npx hardhat --network localhost task:submit-debt --amount 5000 --type 0
 *   npx hardhat --network localhost task:get-debt-count
 *   npx hardhat --network localhost task:decrypt-debt --id 1
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the EncryptedDebtRegister contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the EncryptedDebtRegister contract
 *
 *   npx hardhat --network sepolia task:submit-debt --amount 5000 --type 0
 *   npx hardhat --network sepolia task:get-debt-count
 *   npx hardhat --network sepolia task:decrypt-debt --id 1
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the EncryptedDebtRegister address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const debtRegister = await deployments.get("EncryptedDebtRegister");

  console.log("EncryptedDebtRegister address is " + debtRegister.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:submit-debt --amount 5000 --type 0
 *   - npx hardhat --network sepolia task:submit-debt --amount 5000 --type 0
 */
task("task:submit-debt", "Submits a new encrypted debt record")
  .addOptionalParam("address", "Optionally specify the EncryptedDebtRegister contract address")
  .addParam("amount", "The debt amount")
  .addParam("type", "The debt type (0=Loan, 1=CreditCard, 2=Borrowing, 3=Other)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const amount = parseInt(taskArguments.amount);
    const debtType = parseInt(taskArguments.type);
    
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error(`Argument --amount must be a positive integer`);
    }
    if (!Number.isInteger(debtType) || debtType < 0 || debtType > 3) {
      throw new Error(`Argument --type must be 0, 1, 2, or 3`);
    }

    await fhevm.initializeCLIApi();

    const DebtRegisterDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedDebtRegister");
    console.log(`EncryptedDebtRegister: ${DebtRegisterDeployment.address}`);

    const signers = await ethers.getSigners();

    const debtRegisterContract = await ethers.getContractAt("EncryptedDebtRegister", DebtRegisterDeployment.address);

    // Encrypt owner address
    const encryptedOwner = await fhevm
      .createEncryptedInput(DebtRegisterDeployment.address, signers[0].address)
      .addAddress(signers[0].address)
      .encrypt();

    // Encrypt debt amount
    const encryptedAmount = await fhevm
      .createEncryptedInput(DebtRegisterDeployment.address, signers[0].address)
      .add32(amount)
      .encrypt();

    const tx = await debtRegisterContract
      .connect(signers[0])
      .submitDebt(
        encryptedOwner.handles[0],
        encryptedAmount.handles[0],
        encryptedAmount.inputProof,
        debtType
      );
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const totalCount = await debtRegisterContract.getTotalDebtCount();
    console.log(`Total debt records: ${totalCount}`);

    console.log(`EncryptedDebtRegister submitDebt(amount=${amount}, type=${debtType}) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-debt-count
 *   - npx hardhat --network sepolia task:get-debt-count
 */
task("task:get-debt-count", "Gets the total number of debt records")
  .addOptionalParam("address", "Optionally specify the EncryptedDebtRegister contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const DebtRegisterDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedDebtRegister");
    console.log(`EncryptedDebtRegister: ${DebtRegisterDeployment.address}`);

    const signers = await ethers.getSigners();
    const debtRegisterContract = await ethers.getContractAt("EncryptedDebtRegister", DebtRegisterDeployment.address);

    const totalCount = await debtRegisterContract.getTotalDebtCount();
    const userCount = await debtRegisterContract.getUserDebtCount(signers[0].address);

    console.log(`Total debt records: ${totalCount}`);
    console.log(`Your debt records: ${userCount}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-debt --id 1
 *   - npx hardhat --network sepolia task:decrypt-debt --id 1
 */
task("task:decrypt-debt", "Decrypts a debt record")
  .addOptionalParam("address", "Optionally specify the EncryptedDebtRegister contract address")
  .addParam("id", "The debt record id")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const debtId = parseInt(taskArguments.id);
    if (!Number.isInteger(debtId) || debtId <= 0) {
      throw new Error(`Argument --id must be a positive integer`);
    }

    await fhevm.initializeCLIApi();

    const DebtRegisterDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedDebtRegister");
    console.log(`EncryptedDebtRegister: ${DebtRegisterDeployment.address}`);

    const signers = await ethers.getSigners();
    const debtRegisterContract = await ethers.getContractAt("EncryptedDebtRegister", DebtRegisterDeployment.address);

    const metadata = await debtRegisterContract.getDebtMetadata(debtId);
    console.log(`Debt ID: ${debtId}`);
    console.log(`Submitter: ${metadata.submitter}`);
    console.log(`Debt Type: ${metadata.debtType} (0=Loan, 1=CreditCard, 2=Borrowing, 3=Other)`);
    console.log(`Timestamp: ${metadata.timestamp}`);
    console.log(`Is Active: ${metadata.isActive}`);

    const encryptedAmount = await debtRegisterContract.getEncryptedAmount(debtId);
    if (encryptedAmount === ethers.ZeroHash) {
      console.log("Encrypted amount: uninitialized");
      return;
    }

    const clearAmount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedAmount,
      DebtRegisterDeployment.address,
      signers[0],
    );
    console.log(`Encrypted amount: ${encryptedAmount}`);
    console.log(`Clear amount: ${clearAmount}`);
  });

