# Encrypted Household Debt Register

A privacy-preserving system for recording household debts (loans, credit cards, borrowing) using Fully Homomorphic Encryption (FHE) via the FHEVM protocol by Zama.

## Overview

This system allows users to:
- Record debt amounts and types without exposing sensitive financial information
- View encrypted debt records
- Decrypt and view their own debt status locally
- Track debt statistics by type (publicly, without revealing individual amounts)
- Add descriptions and priority levels to debt records
- Batch update multiple debt statuses
- Access emergency pause functionality for security
- View comprehensive user debt summaries

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Test on Sepolia Testnet**

   ```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
   ```

## 📁 Project Structure

```
encrypted-debt-register/
├── contracts/                    # Smart contract source files
│   └── EncryptedDebtRegister.sol # Main FHE debt register contract
├── deploy/                        # Deployment scripts
├── tasks/                         # Hardhat custom tasks
├── test/                          # Test files
├── frontend/                      # Next.js frontend application
├── hardhat.config.ts              # Hardhat configuration
└── package.json                   # Dependencies and scripts
```

## 📜 Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 🔐 Debt Types

- `0`: Loan
- `1`: Credit Card
- `2`: Borrowing
- `3`: Other

## 🔒 Security Considerations

### Privacy & Encryption
- **Fully Homomorphic Encryption (FHE)**: All debt amounts and owner addresses are encrypted on-chain
- **Local Decryption**: Only users with the correct private key can decrypt their own data
- **Zero-Knowledge Proofs**: Transaction inputs are validated without revealing sensitive information

### Smart Contract Security
- **Access Control**: Only contract owners can perform emergency operations
- **Input Validation**: All user inputs are validated before processing
- **Gas Optimization**: Efficient batch operations to reduce transaction costs
- **Emergency Pause**: Owner can pause contract functionality in case of issues

### Frontend Security
- **Wallet Integration**: Secure connection to user's Web3 wallet
- **Input Sanitization**: All user inputs are sanitized and validated
- **Error Handling**: Comprehensive error handling and user feedback
- **Network Validation**: Contract interactions validated against expected networks

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions to the Encrypted Debt Register project! Here's how you can help:

### Development Setup

1. **Fork and Clone** the repository
2. **Install Dependencies**: `npm install`
3. **Set up Environment**: Configure your environment variables
4. **Run Tests**: `npm run test` to ensure everything works
5. **Start Development**: `npm run dev` for frontend development

### Contribution Guidelines

- **Code Style**: Follow the existing ESLint and Prettier configurations
- **Testing**: Add tests for new features and ensure all tests pass
- **Documentation**: Update README and code comments for significant changes
- **Commits**: Use conventional commit format (see commit history)
- **Pull Requests**: Provide clear descriptions and link related issues

### Areas for Contribution

- **Smart Contract Improvements**: Gas optimizations, new features
- **Frontend Enhancements**: UI/UX improvements, accessibility
- **Testing**: Additional test cases, integration tests
- **Documentation**: Tutorials, API documentation
- **Security**: Security audits, vulnerability fixes

### Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes (formatting, etc.)
refactor: code refactoring
test: adding or updating tests
chore: maintenance tasks
```

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ using Zama FHEVM**

