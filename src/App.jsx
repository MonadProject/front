import { useState } from "react";
import Navbar from "./components/Navbar";
import HomeHero from "./components/HomeHero";
import HomeFeaturedSection from "./components/HomeFeaturedSection";
import AuctionCard from "./components/AuctionCard";
import AuctionDetailModal from "./components/AuctionDetailModal";
import CreateAuctionForm from "./components/CreateAuctionForm";
import MyRecords from "./components/MyRecords";
import { Package } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useAuctions, usePlaceBid, useCreateAuction } from "./hooks/useAuction";
import { useEffect } from "react";
import { useChainId } from "wagmi";
import deployedConfig from "./config/deployed.json";
import ParticleBackground from "./components/ParticleBackground";

export default function App() {
  const [selectedTab, setSelectedTab] = useState("home");
  const { auctions, error, refresh } = useAuctions({
    onlyActive: selectedTab === "auctions",
    auto: selectedTab === "auctions",
    intervalMs: 3000,
  });
  const chainId = useChainId();
  const isMismatch =
    chainId && deployedConfig.chainId && chainId !== deployedConfig.chainId;
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const bid = usePlaceBid();
  const create = useCreateAuction();

  /**
   * 处理出价
   * @param {*} auctionId 拍卖ID
   * @param {*} amount 出价金额
   */
  const handlePlaceBid = async (auctionId, amount) => {
    try {
      toast.info("交易已提交，等待确认...");
      const { receipt, elapsedSec } = await bid.placeBid(auctionId, amount);
      if (receipt?.status === "success" || receipt?.status === 1) {
        toast.success(
          `出价成功，链上确认耗时 ${elapsedSec.toFixed(2)} 秒 (Monad)`
        );
        window.dispatchEvent(new Event("tx-confirmed"));
      } else {
        toast.warning("交易已上链但状态异常");
      }
      setSelectedAuction(null);
      refresh();
    } catch (e) {
      toast.error(e?.message || "提交出价失败");
    }
  };

  /**
   * 处理创建拍卖
   * @param {*} newAuction 新拍卖信息
   */
  const handleCreateAuction = async (newAuction) => {
    try {
      toast.info("交易已提交，等待确认...");
      const { receipt, elapsedSec } = await create.createAuction(
        newAuction.name,
        newAuction.startingPrice,
        Math.floor(newAuction.duration / 1000),
        newAuction.minBidIncrement
      );
      if (receipt?.status === "success" || receipt?.status === 1) {
        toast.success(
          `拍卖创建成功，链上确认耗时 ${elapsedSec.toFixed(2)} 秒 (Monad)`
        );
        window.dispatchEvent(new Event("tx-confirmed"));
      } else {
        toast.warning("交易已上链但状态异常");
      }
      setSelectedTab("auctions");
      refresh();
    } catch (e) {
      toast.error(e?.message || "创建拍卖失败");
    }
  };

  /**
   * 过滤
   */
  const filteredAuctions = auctions.filter((a) =>
    filter === "all" ? true : a.status === filter
  );
  const sortedFilteredAuctions = filteredAuctions
    .slice()
    .sort((a, b) => b.id - a.id);

  useEffect(() => {
    setVisibleCount(6);
  }, [filter, selectedTab]);

  /**
   * 监听交易确认事件，刷新拍卖列表
   */
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("tx-confirmed", handler);
    return () => window.removeEventListener("tx-confirmed", handler);
  }, []);

  return (
    <div
      style={{
        background:
          "radial-gradient(1200px 600px at -10% 0%, rgba(99,102,241,0.24), transparent), radial-gradient(800px 800px at 100% 0%, rgba(56,189,248,0.24), transparent), linear-gradient(180deg, #0B1220 0%, #0E1630 100%)",
        minHeight: "100vh",
      }}
      className="relative overflow-hidden"
    >
      <Toaster position="top-right" richColors />

      {/* 导航栏 */}
      <Navbar
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        isDark={true}
      />

      {/* 背景动画 */}
      {selectedTab !== "create" && <ParticleBackground />}

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 pt-24">
        {(error || isMismatch) && (
          <div
            className="mb-4 px-4 py-3 rounded-lg"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#EF4444",
            }}
          >
            {isMismatch
              ? `当前网络(${chainId})与合约部署网络(${deployedConfig.chainId})不一致，请切换网络或更新合约地址`
              : error}
          </div>
        )}

        {/* 主内容区域 */}
        {selectedTab === "home" && (
          <div style={{ color: "white" }}>
            <HomeHero onExplore={() => setSelectedTab("auctions")} />
            <HomeFeaturedSection
              auctions={auctions}
              onSelectAuction={setSelectedAuction}
            />
          </div>
        )}

        {/* 拍卖市场 */}
        {selectedTab === "auctions" && (
          <div style={{ color: "white" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[28px]">拍卖市场</h2>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              {[
                { key: "all", label: "全部" },
                { key: "active", label: "进行中" },
                { key: "ended", label: "已结束" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className="px-6 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor:
                      filter === tab.key ? "#5B7FFF" : "rgba(255,255,255,0.06)",
                    color: filter === tab.key ? "#FFFFFF" : "#93C5FD",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {sortedFilteredAuctions.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedFilteredAuctions
                    .slice(0, visibleCount)
                    .map((auction) => (
                      <AuctionCard
                        key={auction.id}
                        auction={auction}
                        onClick={() => setSelectedAuction(auction)}
                      />
                    ))}
                </div>
                {sortedFilteredAuctions.length > visibleCount && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setVisibleCount((c) => c + 6)}
                      className="px-6 py-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        color: "#93C5FD",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      加载更多
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-20"
                style={{ color: "white" }}
              >
                <div
                  className="p-6 rounded-full mb-4"
                  style={{ backgroundColor: "rgba(91, 127, 255, 0.15)" }}
                >
                  <Package className="size-12" style={{ color: "#5B7FFF" }} />
                </div>
                <h3 className="text-[20px] mb-2">暂无拍卖</h3>
                <p className="text-[14px] mb-6" style={{ color: "#93C5FD" }}>
                  {filter === "all"
                    ? "还没有任何拍卖项目"
                    : `当前没有${
                        filter === "active" ? "进行中" : "已结束"
                      }的拍卖`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 创建拍卖 */}
        {selectedTab === "create" && (
          <CreateAuctionForm
            onCreate={handleCreateAuction}
            onClose={() => setSelectedTab("auctions")}
          />
        )}

        {/* 我的记录 */}
        {selectedTab === "records" && <MyRecords />}
      </main>

      {/* 拍卖详情弹窗 */}
      {selectedAuction && (
        <AuctionDetailModal
          auction={selectedAuction}
          onClose={() => setSelectedAuction(null)}
          onPlaceBid={handlePlaceBid}
        />
      )}
    </div>
  );
}
