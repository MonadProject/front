import { useState } from "react";
import { useSendTransaction, usePublicClient, useChainId } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { X402_CONFIG } from "../config/x402";
import { waitForConfirmations } from "../utils";

export function useX402API() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  const callX402API = async (endpoint) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      let response = await fetch(`${X402_CONFIG.API_URL}${endpoint}`);
      if (response.status === 402) {
        const info = await response.json();
        toast.info(`x402支付: ${info.payment.amount} MON`);
        const tPayStart = Date.now();
        const hash = await sendTransactionAsync({
          to: info.payment.recipient,
          value: parseEther(info.payment.amount),
        });
        const tBroadcast = Date.now();
        toast.loading("等待支付确认...", { id: "x402-payment" });
        const minConf = chainId === 31337 ? 0 : 2;
        const receipt = await waitForConfirmations(publicClient, hash, minConf);
        const tConfirmed = Date.now();
        toast.success("支付成功！", { id: "x402-payment" });
        response = await fetch(`${X402_CONFIG.API_URL}${endpoint}`, {
          headers: { "X-Payment-Proof": hash },
        });
        const tDataReady = Date.now();
        const metrics = {
          tPayStart,
          tBroadcast,
          tConfirmed,
          tDataReady,
          approval_ms: tBroadcast - tPayStart,
          confirm_ms: tConfirmed - tBroadcast,
          fetch_ms: tDataReady - tConfirmed,
          total_ms_click: tDataReady - tPayStart,
          total_ms_chain: tDataReady - tBroadcast,
        };
        const payment = {
          txHash: hash,
          blockNumber: Number(receipt.blockNumber),
          recipient: info.payment.recipient,
          amount: info.payment.amount,
          chainId,
        };
        const ok = response.ok;
        const result = ok ? await response.json() : null;
        if (!ok) throw new Error(`API error: ${response.status}`);
        const merged = { ...result, metrics, payment };
        setData(merged);
        toast.success("数据获取成功！");
        return merged;
      }
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      const merged = { ...result };
      setData(merged);
      toast.success("数据获取成功！");
      return merged;
    } catch (err) {
      setError(err.message);
      toast.error("操作失败: " + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { callX402API, isLoading, data, error };
}
