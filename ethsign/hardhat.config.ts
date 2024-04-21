import {HardhatUserConfig} from 'hardhat/config'
import {config as configENV} from 'dotenv'
import '@nomicfoundation/hardhat-foundry'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import 'solidity-docgen'
import 'hardhat-deploy'

if (process.env.NODE_ENV !== 'PRODUCTION') {
    configENV()
}

const config: HardhatUserConfig = {
    namedAccounts: {
        deployer: {
            default: 0
        }
    },
    solidity: {
        compilers: [
            {
                version: '0.8.24',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    networks: {
        chiado: {
            chainId: 10200,
            url: "https://rpc.chiadochain.net",
            loggingEnabled: true,
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false
        },
        avail: {
            chainId: 202402021700,
            url: "https://op-avail-sepolia.alt.technology",
            loggingEnabled: true,
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false
        },
        arbitrum: {
            chainId: 421614,
            url: "https://sepolia-rollup.arbitrum.io/rpc",
            loggingEnabled: true,
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false  
        }
    },
    etherscan: {
        apiKey: {
            polygon: process.env.POLYGONSCAN_KEY!,
            polygonMumbai: process.env.POLYGONSCAN_KEY!,
            mantaPacific: process.env.MANTAPACIFIC_KEY!,
            mantaPacificTestnet: process.env.MANTAPACIFIC_TEST_KEY!,
            avax: process.env.SNOWTRACE_KEY!,
            sepolia: process.env.ETHERSCAN_KEY!,
            mainnet: process.env.ETHERSCAN_KEY!,
            zetachainTestnet: process.env.ZETASCAN_API_KEY!,
            zetachain: process.env.ZETASCAN_API_KEY!,
            avail: "abc",
        },
        customChains: [
            {
                network: 'zetachainTestnet',
                chainId: 7001,
                urls: {
                    apiURL: 'https://zetachain-athens-3.blockscout.com/api',
                    browserURL: 'https://zetachain-athens-3.blockscout.com/'
                }
            },
            {
                network: 'zetachain',
                chainId: 7000,
                urls: {
                    apiURL: 'https://zetachain.blockscout.com/api',
                    browserURL: 'https://zetachain.blockscout.com/'
                }
            },
            {
                network: "avail",
                chainId: 202402021700,
                urls: {
                  apiURL: "https://op-avail-sepolia-explorer.alt.technology/api",
                  browserURL: "https://op-avail-sepolia-explorer.alt.technology/"
                }
              },
        ]
    },
    docgen: {
        pages: 'files',
        exclude: []
    }
}

export default config
