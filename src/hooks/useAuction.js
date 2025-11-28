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
import { waitForConfirmations } from "../utils";

export function useGetAuction(auctionId) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAuction",
    args: [BigInt(auctionId)],
    watch: false,
  });
}

/**
 * 获取用户记录
 * @param {*} userAddress
 * @returns
 */
export function useUserRecords(userAddress) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getUserRecords",
    args: [userAddress],
    watch: false,
  });
}

/**
 * 获取拍卖品的数量
 * @returns
 */
export function useAuctionCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "auctionCount",
    watch: false,
  });
}

/**
 * 获取拍卖品列表
 * @param {*} options
 * @returns
 */
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

  const loadIncMap = () => {
    let m = {};
    try {
      const raw = localStorage.getItem("auction_min_inc_map");
      m = raw ? JSON.parse(raw) : {};
    } catch (_) {}
    return m;
  };

  const mapTuple = (r, id, nowMs, incMap) => {
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
    const minInc = Number(incMap[id]) > 0 ? Number(incMap[id]) : 0.001;
    return {
      id,
      name: itemName,
      description: "",
      startingPrice,
      currentPrice,
      minBidIncrement: minInc,
      endTime: endMs,
      status,
      isAntiSnipe: true,

      seller,
      highestBidder,
      claimed,
      endedFlag: ended,
    };
  };

  const readAuctionsByIds = async (ids, incMap) => {
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
    return results.map((r, idx) => mapTuple(r, ids[idx], nowMs, incMap));
  };

  /**
   * 刷新所有拍卖品列表
   * @returns
   */
  const refreshAll = async () => {
    try {
      setIsLoading(true);
      setError("");
      const incMap = loadIncMap();
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
      const mapped = await readAuctionsByIds(ids, incMap);
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

  /**
   * 刷新活动拍卖品列表
   * @returns
   */
  const refreshActiveOnly = async () => {
    try {
      setIsLoading(true);
      setError("");
      const incMap = loadIncMap();
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
      const mapped = await readAuctionsByIds(idsToRead, incMap);
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

  /**
   * 刷新拍卖品列表
   * @returns
   */
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

  return { auctions, isLoading, error, refresh };
}

/**
 * 出价
 * @returns
 */
export function usePlaceBid() {
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const chainId = useChainId();

  /**
   * 出价
   * @param {number} auctionId 拍卖品ID
   * @param {number} bidAmount 出价金额
   * @returns
   */
  const placeBid = async (auctionId, bidAmount) => {
    try {
      // 模拟出价
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

    // 执行出价
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

/**
 * 创建拍卖品
 * @returns
 */
export function useCreateAuction() {
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const createAuction = async (
    itemName,
    startPrice,
    duration,
    minBidIncrement
  ) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createAuction",
      args: [itemName, parseEther(startPrice.toString()), BigInt(duration)],
    });
    const minConf = chainId === 31337 ? 0 : 2;
    const t0 = Date.now();
    const receipt = await waitForConfirmations(publicClient, hash, minConf);
    try {
      const latestCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "auctionCount",
      });
      const idNum = Number(latestCount || 0n);
      if (idNum > 0 && Number(minBidIncrement) > 0) {
        let incMap = {};
        try {
          const raw = localStorage.getItem("auction_min_inc_map");
          incMap = raw ? JSON.parse(raw) : {};
        } catch (_) {}
        incMap[idNum] = Number(minBidIncrement);
        try {
          localStorage.setItem("auction_min_inc_map", JSON.stringify(incMap));
        } catch (_) {}
      }
    } catch (_) {}
    const elapsedSec = (Date.now() - t0) / 1000;
    return { receipt, elapsedSec };
  };
  return { createAuction, isPending };
}

/**
 * 结束拍卖品
 * @returns
 */
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
