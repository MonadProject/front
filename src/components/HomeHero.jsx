import NeonGavel from "./NeonGavel";
import { memo } from "react";

function HomeHero({ onExplore }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 py-20">
      <div className="space-y-8">
        <div>
          <h1
            className="leading-none mb-4"
            style={{
              fontSize: "80px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            AUCTION HOUSE
          </h1>
          <p
            className="text-[20px]"
            style={{
              color: "#93C5FD",
              fontWeight: 400,
              letterSpacing: "0.1em",
            }}
          >
            WEB3 HIGH-PERFORMANCE MARKETPLACE
          </p>
        </div>
        <button
          onClick={onExplore}
          className="px-10 py-4 rounded-xl transition-all font-semibold text-[18px] hover:scale-105"
          style={{
            backgroundColor: "#5B7FFF",
            color: "white",
            boxShadow: "0 20px 60px rgba(91, 127, 255, 0.5)",
          }}
        >
          探索拍卖
        </button>
      </div>

      <div
        className="hidden lg:flex items-center justify-center relative"
        style={{ height: "500px" }}
      >
        <NeonGavel
          width={500}
          height={500}
          style={{ filter: "drop-shadow(0 20px 80px rgba(91, 127, 255, 0.6))" }}
        />
      </div>
    </div>
  );
}
export default memo(HomeHero);
