import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";

export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { decimals: 18, name: "Monad", symbol: "MON" },
  rpcUrls: {
    default: {
      http: [
        import.meta.env.VITE_MONAD_RPC_URL || "https://monad-testnet.drpc.org",
      ],
    },
    public: {
      http: [
        import.meta.env.VITE_MONAD_RPC_URL || "https://monad-testnet.drpc.org",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://explorer.testnet.monad.xyz",
    },
  },
  testnet: true,
};

export const localhost = {
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: { name: "Local", url: "http://localhost" },
  },
  testnet: true,
};

export const chains = [localhost, monadTestnet];

export const config = getDefaultConfig({
  appName: "Monad Auction",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo",
  chains,
  // 默认情况下，您的 dApp 使用每个链的公共 RPC 提供商来获取余额、解析 ENS 名称等。 这通常会导致用户的可靠性问题，
  // 因为公共节点的速率有限。 您应该通过 Alchemy 或 QuickNode 等服务购买 RPC 提供商的访问权限，并在 Wagmi 中定义您自己的传输方式。
  // 这可以通过在 getDefaultConfig 中添加 transports 参数或通过 Wagmi 的 createConfig 直接实现。
  transports: {
    [localhost.id]: http("http://127.0.0.1:8545"),
    [monadTestnet.id]: http(
      import.meta.env.VITE_MONAD_RPC_URL || "https://monad-testnet.drpc.org"
    ),
  },
});
