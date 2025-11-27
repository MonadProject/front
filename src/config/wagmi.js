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
  transports: {
    [localhost.id]: http("http://127.0.0.1:8545"),
    [monadTestnet.id]: http(
      import.meta.env.VITE_MONAD_RPC_URL || "https://monad-testnet.drpc.org"
    ),
  },
});
