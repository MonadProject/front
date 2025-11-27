import {
  useReadContract,
  useWriteContract,
  usePublicClient,
  useChainId,
  useWatchContractEvent,
  useAccount,
} from "wagmi";
import { parseEther, formatEther, parseAbiItem } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";
import { useEffect, useState } from "react";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const waitForConfirmations = async (publicClient, hash, minConf) => {
  let receipt = null;
  while (!receipt) {
    try {
      receipt = await publicClient.getTransactionReceipt({ hash });
    } catch (_) {}
    if (!receipt) await delay(1500);
  }
  if (minConf > 0 && receipt.blockNumber) {
    let confirmed = false;
    const start = Date.now();
    while (!confirmed) {
      const head = await publicClient.getBlockNumber();
      const confs = Number(head) - Number(receipt.blockNumber);
      if (confs >= minConf) confirmed = true;
      else {
        if (Date.now() - start > 60000) break;
        await delay(1500);
      }
    }
  }
  return receipt;
};

export function useGetAuction(auctionId) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAuction",
    args: [BigInt(auctionId)],
    watch: false,
  });
}

export function useAuctionCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "auctionCount",
    watch: false,
  });
}

export function useAuctions() {
  const client = usePublicClient();
  const chainId = useChainId();
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError("");
      const latestCount = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "auctionCount",
      });
      const count = Number(latestCount || 0n);
      if (!count) {
        setAuctions([]);
        setIsLoading(false);
        return;
      }
      const ids = Array.from({ length: count }, (_, i) => i + 1);
      const reads = ids.map((id) =>
        client.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getAuction",
          args: [BigInt(id)],
        })
      );
      const results = await Promise.all(reads);
      const bidEvent = parseAbiItem(
        "event BidPlaced(uint256 indexed auctionId, address bidder, uint256 amount)"
      );
      const bidsCounts = await Promise.all(
        ids.map(async (id) => {
          try {
            const logs = await client.getLogs({
              address: CONTRACT_ADDRESS,
              event: bidEvent,
              args: { auctionId: BigInt(id) },
              fromBlock: 0n,
              toBlock: "latest",
            });
            return logs.length;
          } catch (_) {
            return 0;
          }
        })
      );
      const nowMs = Date.now();
      const mapped = results.map((r, idx) => {
        const [
          seller,
          startPriceWei,
          highestBidWei,
          highestBidder,
          endTimeSec,
          ended,
          itemName,
          claimed,
        ] = r;
        const currentWei = highestBidWei === 0n ? startPriceWei : highestBidWei;
        const currentPrice = Number(formatEther(currentWei));
        const startingPrice = Number(formatEther(startPriceWei));
        const endMs = Number(endTimeSec) * 1000;
        const status = ended || nowMs >= endMs ? "ended" : "active";
        return {
          id: idx + 1,
          name: itemName,
          description: "",
          startingPrice,
          currentPrice,
          minBidIncrement: 0.00001,
          endTime: endMs,
          status,
          isAntiSnipe: true,
          bids: bidsCounts[idx] || 0,
          seller,
          highestBidder,
          claimed,
          endedFlag: ended,
        };
      });
      setAuctions(mapped);
      setIsLoading(false);
    } catch (e) {
      setError(e?.message || "加载拍卖失败");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  // useWatchContractEvent({
  //   address: CONTRACT_ADDRESS,
  //   abi: CONTRACT_ABI,
  //   eventName: "AuctionCreated",
  //   onLogs: () => refresh(),
  // });
  // useWatchContractEvent({
  //   address: CONTRACT_ADDRESS,
  //   abi: CONTRACT_ABI,
  //   eventName: "BidPlaced",
  //   onLogs: () => refresh(),
  // });
  // useWatchContractEvent({
  //   address: CONTRACT_ADDRESS,
  //   abi: CONTRACT_ABI,
  //   eventName: "AuctionEnded",
  //   onLogs: () => refresh(),
  // });
  // useWatchContractEvent({
  //   address: CONTRACT_ADDRESS,
  //   abi: CONTRACT_ABI,
  //   eventName: "TimeExtended",
  //   onLogs: () => refresh(),
  // });

  return { auctions, isLoading, error, refresh };
}

export function usePlaceBid() {
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const chainId = useChainId();
  const placeBid = async (auctionId, bidAmount) => {
    try {
      await publicClient.simulateContract({
        account: address,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "placeBid",
        args: [BigInt(auctionId)],
        value: parseEther(bidAmount.toString()),
      });
    } catch (e) {
      throw new Error(e?.shortMessage || e?.message || "出价模拟失败");
    }
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "placeBid",
      args: [BigInt(auctionId)],
      value: parseEther(bidAmount.toString()),
    });
    const minConf = chainId === 31337 ? 0 : 2;
    const receipt = await waitForConfirmations(publicClient, hash, minConf);
    return receipt;
  };
  return { placeBid, isPending };
}

export function useCreateAuction() {
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const createAuction = async (itemName, startPrice, duration) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createAuction",
      args: [itemName, parseEther(startPrice.toString()), BigInt(duration)],
    });
    const minConf = chainId === 31337 ? 0 : 2;
    const receipt = await waitForConfirmations(publicClient, hash, minConf);
    return receipt;
  };
  return { createAuction, isPending };
}

export function useEndAuction() {
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const endAuction = async (auctionId) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "endAuction",
      args: [BigInt(auctionId)],
    });
    const minConf = chainId === 31337 ? 0 : 2;
    const receipt = await waitForConfirmations(publicClient, hash, minConf);
    return receipt;
  };
  return { endAuction, isPending };
}

// 方案一：移除手动提取资金逻辑，结算在 endAuction 中自动完成
