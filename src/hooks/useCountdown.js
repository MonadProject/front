import { useEffect, useState } from "react";

export function useCountdown(endTimeMs, options = {}) {
  const { mode = "full" } = options;
  const [text, setText] = useState("");
  const [secLeft, setSecLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = Number(endTimeMs) - now;
      if (!endTimeMs || diff <= 0) {
        setText(mode === "full" ? "拍卖已结束" : "已结束");
        setSecLeft(0);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      if (mode === "compact") {
        let t;
        if (hours > 0) t = `${hours}小时 ${minutes}分钟`;
        else if (minutes > 0) t = `${minutes}分钟 ${seconds}秒`;
        else t = `${seconds}秒`;
        setText(t);
      } else {
        setText(`${hours}小时 ${minutes}分钟 ${seconds}秒`);
      }
      setSecLeft(Math.ceil(diff / 1000));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [endTimeMs, mode]);

  const isEnded = secLeft <= 0;
  return { timeLeft: text, secondsLeft: secLeft, isEnded };
}
