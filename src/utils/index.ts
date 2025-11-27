export const formatTimeLeft = (endMs: string) => {
  const now = Date.now();
  const diff = Math.max(0, Number(endMs) - now);
  const hh = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

export const short = (addr: string) => {
  if (!addr || typeof addr !== "string") return "-";
  const lower = addr.toLowerCase();
  if (lower === "0x0000000000000000000000000000000000000000") return "暂无";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
};
