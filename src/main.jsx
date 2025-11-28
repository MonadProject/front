import React from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import App from "./App";
import { config, chains, localhost } from "./config/wagmi";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <WagmiProvider
    config={config}
    pollingInterval={0} //完全关闭 Wagmi 的自动轮询（block watcher）
  >
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        chains={chains}
        initialChain={localhost}
        theme={darkTheme()}
      >
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
