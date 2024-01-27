import { NETWORK, NetworkNames } from '@penx/constants'

const developAddress = {
  Believer: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  BelieverFacet: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  Diamond: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  DiamondCutFacet: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  DiamondInit: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  DiamondLoupeFacet: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  LibDiamond: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  Multicall3: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
}

const sepoliaAddress = {}

export const addressMap: Record<keyof typeof developAddress, any> =
  (function () {
    if (NETWORK === NetworkNames?.SEPOLIA) return sepoliaAddress as any
    return developAddress
  })()

export const ADDRESS_TO_CONTRACT = new Map(
  Object.entries(addressMap).map(([contract, address]) => [address, contract]),
)
