import { useState } from "react";
import { useSendTransaction, usePublicClient, useChainId } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { X402_CONFIG } from "../config/x402";

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
        const hash = await sendTransactionAsync({
          to: info.payment.recipient,
          value: parseEther(info.payment.amount),
        });
        toast.loading("等待支付确认...", { id: "x402-payment" });
        const minConf = chainId === 31337 ? 0 : 2;
        await waitForConfirmation(publicClient, hash, minConf);
        toast.success("支付成功！", { id: "x402-payment" });
        response = await fetch(`${X402_CONFIG.API_URL}${endpoint}`, {
          headers: { "X-Payment-Proof": hash },
        });
      }
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      setData(result);
      toast.success("数据获取成功！");
      return result;
    } catch (err) {
      setError(err.message);
      toast.error("操作失败: " + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const waitForConfirmation = async (client, hash, minConf = 2) => {
    let receipt = null;
    while (!receipt) {
      try {
        receipt = await client.getTransactionReceipt({ hash });
      } catch {}
      if (!receipt) await new Promise((r) => setTimeout(r, 1500));
    }
    if (minConf > 0) {
      const start = Date.now();
      while (true) {
        const head = await client.getBlockNumber();
        const confs = Number(head) - Number(receipt.blockNumber);
        if (confs >= minConf) break;
        if (Date.now() - start > 60000) break;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    return receipt;
  };

  return { callX402API, isLoading, data, error };
}
