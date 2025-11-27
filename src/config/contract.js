import deployedConfig from "./deployed.json";
import ABI from "./abi.json";

export const CONTRACT_ADDRESS = deployedConfig.contractAddress;
export const CONTRACT_ABI = ABI;
export const FUNCTIONS = {
  getAuction: "getAuction",
  auctionCount: "auctionCount",
  createAuction: "createAuction",
  placeBid: "placeBid",
  endAuction: "endAuction",
};
