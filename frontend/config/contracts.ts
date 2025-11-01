// Import generated ABI
import { EncryptedDebtRegisterABI } from "../abi/EncryptedDebtRegisterABI";

// Sepolia testnet deployment address
// Update this when deploying to a new network
export const CONTRACT_ADDRESS: `0x${string}` | undefined = 
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined) ||
  "0xf7CcdcDf8bfdf79187832777fB2Eb77a8A3cC6C7" as `0x${string}`; // Sepolia deployment

// Use generated ABI
export const CONTRACT_ABI = EncryptedDebtRegisterABI.abi;

