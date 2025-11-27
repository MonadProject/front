import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useChainId,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";
import { useEffect, useState } from "react";

export function useGetAuction(auctionId) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAuction",
    args: [BigInt(auctionId)],
    watch: true,
    pollingInterval: 3000,
  });
}

export function useAuctionCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "auctionCount",
    watch: true,
  });
}

export function useAuctions() {
  const client = usePublicClient();
  const chainId = useChainId();
  const { data: countData } = useAuctionCount();
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError("");
      const count = countData ? Number(countData) : 0;
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
          minBidIncrement: 1,
          endTime: endMs,
          status,
          isAntiSnipe: true,
          bids: 0,
          seller,
          highestBidder,
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
  }, [countData, chainId]);

  return { auctions, isLoading, error, refresh };
}

export function usePlaceBid() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const chainId = useChainId();
  const placeBid = async (auctionId, bidAmount) => {
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "placeBid",
      args: [BigInt(auctionId)],
      value: parseEther(bidAmount.toString()),
    });
  };
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  return { placeBid, isPending, isConfirming, isSuccess, hash };
}

export function useCreateAuction() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const chainId = useChainId();
  const createAuction = async (itemName, startPrice, duration) => {
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createAuction",
      args: [itemName, parseEther(startPrice.toString()), BigInt(duration)],
    });
  };
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  return { createAuction, isPending, isConfirming, isSuccess, hash };
}

export function useEndAuction() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const endAuction = async (auctionId) => {
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "endAuction",
      args: [BigInt(auctionId)],
    });
  };
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  return { endAuction, isPending, isConfirming, isSuccess, hash };
}
