import 'tsconfig-paths/register'
import { resolve } from 'path'
import { HardhatUserConfig } from 'hardhat/config'
import { config as dotenvConfig } from 'dotenv'
import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-ethers'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import 'hardhat-deploy-ethers'

import '@typechain/hardhat'

const dotenvConfigPath: string = './.env'
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) })

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  namedAccounts: {
    deployer: 0,
  },

  gasReporter: {
    enabled: false,
  },

  networks: {
    hardhat: {
      saveDeployments: true,
      allowUnlimitedContractSize: true,
      // forking: {
      //   url: "https://mainnet.chainnodes.org/8fe75768-846a-427a-8651-b5c1adf9a1f1",
      // },
      chainId: 31337,
    },
    localhost: {
      saveDeployments: false,
    },
  },

  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          viaIR: false,
          optimizer: {
            enabled: true,
            runs: 4_294_967_295,
          },
        },
      },
    ],
  },

  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },

  typechain: {
    outDir: 'types',
    target: 'ethers-v6',
  },

  mocha: {
    timeout: 1000000,
  },
}

export default config
