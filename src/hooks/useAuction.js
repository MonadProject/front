import {
  useReadContract,
  useWriteContract,
  usePublicClient,
  useChainId,
  useAccount,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";
import { useEffect, useState, useRef } from "react";

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

export function useAuctions(options = {}) {
  const { onlyActive = false, auto = false, intervalMs = 10000 } = options;
  const client = usePublicClient();
  const chainId = useChainId();
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const activeIdsRef = useRef([]);
  const lastCountRef = useRef(0);
  const initializedRef = useRef(false);
  const lastFullAtRef = useRef(0);

  const refreshAll = async () => {
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
        activeIdsRef.current = [];
        lastCountRef.current = 0;
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

          seller,
          highestBidder,
          claimed,
          endedFlag: ended,
        };
      });
      const next = mapped;
      activeIdsRef.current = mapped
        .filter((a) => a.status === "active")
        .map((a) => a.id);
      lastCountRef.current = count;
      setAuctions(next);
      setIsLoading(false);
      initializedRef.current = true;
      lastFullAtRef.current = Date.now();
    } catch (e) {
      setError(e?.message || "加载拍卖失败");
      setIsLoading(false);
    }
  };

  const refreshActiveOnly = async () => {
    try {
      setIsLoading(true);
      setError("");
      const latestCount = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "auctionCount",
      });
      const count = Number(latestCount || 0n);
      const prevCount = lastCountRef.current || 0;
      const newIds =
        count > prevCount
          ? Array.from(
              { length: count - prevCount },
              (_, i) => prevCount + i + 1
            )
          : [];
      const idsToRead = Array.from(
        new Set([...(activeIdsRef.current || []), ...newIds])
      );
      if (idsToRead.length === 0) {
        lastCountRef.current = count;
        setIsLoading(false);
        return;
      }
      const reads = idsToRead.map((id) =>
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
          claimed,
        ] = r;
        const id = idsToRead[idx];
        const currentWei = highestBidWei === 0n ? startPriceWei : highestBidWei;
        const currentPrice = Number(formatEther(currentWei));
        const startingPrice = Number(formatEther(startPriceWei));
        const endMs = Number(endTimeSec) * 1000;
        const status = ended || nowMs >= endMs ? "ended" : "active";
        return {
          id,
          name: itemName,
          description: "",
          startingPrice,
          currentPrice,
          minBidIncrement: 0.00001,
          endTime: endMs,
          status,
          isAntiSnipe: true,

          seller,
          highestBidder,
          claimed,
          endedFlag: ended,
        };
      });
      setAuctions((prev) => {
        const updates = new Map(mapped.map((a) => [a.id, a]));
        const merged = prev.map((p) =>
          updates.has(p.id) ? updates.get(p.id) : p
        );
        for (const [id, a] of updates) {
          if (!merged.find((x) => x.id === id)) merged.push(a);
        }
        activeIdsRef.current = merged
          .filter((a) => a.status === "active")
          .map((a) => a.id);
        return merged.sort((a, b) => a.id - b.id);
      });
      lastCountRef.current = count;
      setIsLoading(false);
    } catch (e) {
      setError(e?.message || "加载拍卖失败");
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    if (onlyActive) {
      if (!initializedRef.current) {
        await refreshAll();
        return;
      }
      const now = Date.now();
      if (now - (lastFullAtRef.current || 0) > 60000) {
        await refreshAll();
      } else {
        await refreshActiveOnly();
      }
    } else {
      await refreshAll();
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  useEffect(() => {
    if (!auto) return;
    const iv = setInterval(() => {
      refresh();
    }, Math.max(3000, Number(intervalMs) || 10000));
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, intervalMs, chainId]);

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
    const t0 = Date.now();
    const receipt = await waitForConfirmations(publicClient, hash, minConf);
    const elapsedSec = (Date.now() - t0) / 1000;
    return { receipt, elapsedSec };
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
    const t0 = Date.now();
    const receipt = await waitForConfirmations(publicClient, hash, minConf);
    const elapsedSec = (Date.now() - t0) / 1000;
    return { receipt, elapsedSec };
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
