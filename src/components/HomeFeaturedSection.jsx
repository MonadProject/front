import { formatTimeLeft } from "../utils/index";
import { memo } from "react";

function HomeFeaturedSection({ auctions, onSelectAuction }) {
  return (
    <div className="py-12">
      <h2 className="text-[42px] font-semibold mb-10">Featured Auctions</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(91, 127, 255, 0.3)",
                backdropFilter: "blur(20px)",
              }}
              onClick={() => auctions[0] && onSelectAuction(auctions[0])}
            >
              <div
                className="h-56 relative overflow-hidden flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)",
                }}
              >
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <defs>
                    <radialGradient id="spiral1">
                      <stop offset="0%" stopColor="#FF006E" />
                      <stop offset="50%" stopColor="#8338EC" />
                      <stop offset="100%" stopColor="#3A86FF" />
                    </radialGradient>
                  </defs>
                  {[...Array(8)].map((_, i) => (
                    <circle
                      key={i}
                      cx="100"
                      cy="100"
                      r={80 - i * 10}
                      fill="none"
                      stroke="url(#spiral1)"
                      strokeWidth="2"
                      opacity={0.8 - i * 0.1}
                    />
                  ))}
                  <circle
                    cx="100"
                    cy="100"
                    r="15"
                    fill="url(#spiral1)"
                    filter="url(#neonGlow)"
                  />
                </svg>
              </div>
              <div className="p-5">
                <h3 className="text-[18px] font-semibold mb-3">
                  Abstract Crypto NFT
                </h3>
                <div
                  className="text-[24px] font-bold mb-1"
                  style={{ color: "#5B7FFF" }}
                >
                  {auctions[0]
                    ? `${Number(auctions[0].currentPrice).toFixed(3)} MON`
                    : "63.420 MON"}
                </div>
                <div className="text-[13px]" style={{ color: "#6B7280" }}>
                  {auctions[0]
                    ? `Ends in ${formatTimeLeft(auctions[0].endTime)}`
                    : "Ends in 01:12:28"}
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(91, 127, 255, 0.3)",
                backdropFilter: "blur(20px)",
              }}
              onClick={() => auctions[1] && onSelectAuction(auctions[1])}
            >
              <div
                className="h-56 relative overflow-hidden flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #2d1b3d 0%, #1a1a2e 100%)",
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    imageRendering: "pixelated",
                  }}
                >
                  <svg width="120" height="120" viewBox="0 0 16 16">
                    <rect x="4" y="2" width="8" height="2" fill="#FFA07A" />
                    <rect x="3" y="4" width="10" height="2" fill="#FFA07A" />
                    <rect x="5" y="6" width="2" height="2" fill="#000" />
                    <rect x="9" y="6" width="2" height="2" fill="#000" />
                    <rect x="3" y="8" width="10" height="2" fill="#FFA07A" />
                    <rect x="5" y="10" width="6" height="1" fill="#8B4513" />
                    <rect x="2" y="11" width="12" height="3" fill="#4169E1" />
                    <rect x="2" y="14" width="4" height="2" fill="#4169E1" />
                    <rect x="10" y="14" width="4" height="2" fill="#4169E1" />
                  </svg>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-[18px] font-semibold mb-3">
                  Custom Pixel Art
                </h3>
                <div
                  className="text-[24px] font-bold mb-1"
                  style={{ color: "#5B7FFF" }}
                >
                  {auctions[1]
                    ? `${Number(auctions[1].currentPrice).toFixed(3)} MON`
                    : "1.200 MON"}
                </div>
                <div className="text-[13px]" style={{ color: "#6B7280" }}>
                  {auctions[1]
                    ? `Ends in ${formatTimeLeft(auctions[1].endTime)}`
                    : "Ends in 02:33:47"}
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(91, 127, 255, 0.3)",
                backdropFilter: "blur(20px)",
              }}
              onClick={() => auctions[2] && onSelectAuction(auctions[2])}
            >
              <div
                className="h-56 relative overflow-hidden flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #0a1929 0%, #001e3c 100%)",
                }}
              >
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <defs>
                    <linearGradient
                      id="pyramidGrad"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#00D9FF" />
                      <stop offset="100%" stopColor="#0066FF" />
                    </linearGradient>
                  </defs>
                  <ellipse
                    cx="90"
                    cy="140"
                    rx="70"
                    ry="8"
                    fill="#0066FF"
                    opacity="0.3"
                  />
                  <polygon
                    points="90,50 40,120 140,120"
                    fill="url(#pyramidGrad)"
                    opacity="0.8"
                    stroke="#00D9FF"
                    strokeWidth="2"
                  />
                  <polygon
                    points="90,50 140,120 90,115"
                    fill="#0066FF"
                    opacity="0.6"
                  />
                  <circle
                    cx="90"
                    cy="50"
                    r="5"
                    fill="#00D9FF"
                    filter="url(#neonGlow)"
                  />
                </svg>
              </div>
              <div className="p-5">
                <h3 className="text-[18px] font-semibold mb-3">Virtual Land</h3>
                <div
                  className="text-[24px] font-bold mb-1"
                  style={{ color: "#5B7FFF" }}
                >
                  {auctions[2]
                    ? `${Number(auctions[2].currentPrice).toFixed(3)} MON`
                    : "285.000 MON"}
                </div>
                <div className="text-[13px]" style={{ color: "#6B7280" }}>
                  {auctions[2]
                    ? `Ends in ${formatTimeLeft(auctions[2].endTime)}`
                    : "Ends in 05:32:02"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div
            className="rounded-2xl p-6 h-full"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(91, 127, 255, 0.3)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h3 className="text-[28px] font-semibold mb-6">Live Updates</h3>
            <div className="space-y-6">
              {(auctions || []).slice(0, 2).map((a, i) => (
                <div
                  key={a.id ?? i}
                  className="pb-5 border-b last:border-0"
                  style={{ borderColor: "rgba(91, 127, 255, 0.2)" }}
                >
                  <div
                    className="text-[22px] font-bold mb-2"
                    style={{ color: "#E5E7EB" }}
                  >
                    {`${Number(a.currentPrice || a.startingPrice || 0).toFixed(
                      3
                    )} MON`}
                  </div>
                  <div
                    className="text-[14px] mb-3"
                    style={{ color: "#5B7FFF" }}
                  >
                    {a.highestBidder &&
                    a.highestBidder !==
                      "0x0000000000000000000000000000000000000000"
                      ? `${a.highestBidder.slice(
                          0,
                          6
                        )}...${a.highestBidder.slice(-3)}`
                      : `${a.seller?.slice(0, 6)}...${a.seller?.slice(-3)}`}
                  </div>
                  <button
                    onClick={() => onSelectAuction?.(a)}
                    className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(HomeFeaturedSection);
