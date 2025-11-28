import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { useEffect } from "react";
import { toast } from "sonner";

export default function CreateAuctionForm({ onClose, onCreate }) {
  const { address, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({
    address,
    enabled: !!address,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startingPrice: 0.001,
    minBidIncrement: 0.001,
    duration: 60000,
    isAntiSnipe: true,
  });

  const [errors, setErrors] = useState({});

  /**
   * 验证表单
   * @returns
   */
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "请输入拍卖品名称";
    if (!formData.description.trim())
      newErrors.description = "请输入拍卖品描述";
    if (formData.startingPrice < 0.001)
      newErrors.startingPrice = "起拍价必须至少为 0.001 MON";
    if (formData.minBidIncrement <= 0)
      newErrors.minBidIncrement = "最低加价必须大于 0";
    if (formData.duration < 60000) newErrors.duration = "拍卖时长至少为 1 分钟";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 点击提交
   * @param {*} e
   * @returns
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast("请先连接钱包");
      return;
    }
    if (validate()) onCreate(formData);
  };

  /**
   * 获取用户余额
   */
  useEffect(() => {
    if (!address) return;
    const handler = () => refetch?.();
    window.addEventListener("tx-confirmed", handler);
    return () => window.removeEventListener("tx-confirmed", handler);
  }, [address, refetch]);

  /**
   * 拍卖时长选项
   */
  const durationOptions = [
    { label: "1 分钟", value: 60000 },
    { label: "5 分钟", value: 300000 },
    { label: "10 分钟", value: 600000 },
    { label: "30 分钟", value: 1800000 },
    { label: "1 小时", value: 3600000 },
    { label: "2 小时", value: 7200000 },
  ];

  return (
    <div className="max-w-xl mx-auto p-6" style={{ color: "white" }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: "rgba(91, 127, 255, 0.15)" }}
        >
          <Plus className="size-6" style={{ color: "#5B7FFF" }} />
        </div>
        <h2 className="text-[28px]">创建拍卖</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {isConnected && balance?.formatted && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{
              backgroundColor: "rgba(91, 127, 255, 0.12)",
              color: "#93C5FD",
              border: "1px solid rgba(91,127,255,0.25)",
            }}
          >
            <span>当前余额:</span>
            <span className="font-mono">
              {Number(balance.formatted).toFixed(4)} {balance.symbol}
            </span>
          </div>
        )}
        <div>
          <label
            className="block text-[14px] mb-2"
            style={{ color: "#FFFFFF" }}
          >
            拍卖品名称 <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors({ ...errors, name: undefined });
            }}
            className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
            style={{
              borderColor: errors.name ? "#EF4444" : "rgba(255,255,255,0.18)",
              borderWidth: errors.name ? "2px" : "1px",
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "#FFFFFF",
            }}
            placeholder="例如：稀有 NFT 艺术品"
          />
          {errors.name && (
            <div
              className="flex items-center gap-2 mt-2 text-[12px]"
              style={{ color: "#EF4444" }}
            >
              <AlertCircle className="size-4" />
              <span>{errors.name}</span>
            </div>
          )}
        </div>
        <div>
          <label
            className="block text-[14px] mb-2"
            style={{ color: "#FFFFFF" }}
          >
            拍卖品描述 <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              setErrors({ ...errors, description: undefined });
            }}
            className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none resize-none"
            style={{
              borderColor: errors.description
                ? "#EF4444"
                : "rgba(255,255,255,0.18)",
              borderWidth: errors.description ? "2px" : "1px",
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "#FFFFFF",
            }}
            placeholder="详细描述您的拍卖品..."
            rows={3}
          />
          {errors.description && (
            <div
              className="flex items-center gap-2 mt-2 text-[12px]"
              style={{ color: "#EF4444" }}
            >
              <AlertCircle className="size-4" />
              <span>{errors.description}</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-[14px] mb-2"
              style={{ color: "#FFFFFF" }}
            >
              起拍价 (MON) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="number"
              value={formData.startingPrice}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  startingPrice: Number(e.target.value),
                });
                setErrors({ ...errors, startingPrice: undefined });
              }}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
              style={{
                borderColor: errors.startingPrice
                  ? "#EF4444"
                  : "rgba(255,255,255,0.18)",
                borderWidth: errors.startingPrice ? "2px" : "1px",
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#FFFFFF",
              }}
              placeholder="0.001"
              min="0.001"
              step="0.001"
            />
            {errors.startingPrice && (
              <div
                className="flex items-center gap-2 mt-2 text-[12px]"
                style={{ color: "#EF4444" }}
              >
                <AlertCircle className="size-4" />
                <span>{errors.startingPrice}</span>
              </div>
            )}
          </div>
          <div>
            <label
              className="block text-[14px] mb-2"
              style={{ color: "#FFFFFF" }}
            >
              最低加价 (MON) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="number"
              value={formData.minBidIncrement}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  minBidIncrement: Number(e.target.value),
                });
                setErrors({ ...errors, minBidIncrement: undefined });
              }}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
              style={{
                borderColor: errors.minBidIncrement
                  ? "#EF4444"
                  : "rgba(255,255,255,0.18)",
                borderWidth: errors.minBidIncrement ? "2px" : "1px",
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#FFFFFF",
              }}
              placeholder="1"
              min="0"
              step="0.001"
            />
            {errors.minBidIncrement && (
              <div
                className="flex items-center gap-2 mt-2 text-[12px]"
                style={{ color: "#EF4444" }}
              >
                <AlertCircle className="size-4" />
                <span>{errors.minBidIncrement}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <label
            className="block text-[14px] mb-2"
            style={{ color: "#FFFFFF" }}
          >
            拍卖时长 <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, duration: option.value })
                }
                className="px-4 py-3 rounded-lg border-2 transition-all"
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  backgroundColor:
                    formData.duration === option.value
                      ? "#5B7FFF"
                      : "rgba(255,255,255,0.06)",
                  color:
                    formData.duration === option.value ? "#FFFFFF" : "#93C5FD",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div
          className="flex items-start gap-4 p-4 rounded-lg"
          style={{
            backgroundColor: "rgba(91, 127, 255, 0.12)",
            border: "1px solid rgba(91,127,255,0.25)",
          }}
        >
          <input
            type="checkbox"
            id="antiSnipe"
            checked={formData.isAntiSnipe}
            onChange={(e) =>
              setFormData({ ...formData, isAntiSnipe: e.target.checked })
            }
            className="mt-1"
          />
          <div>
            <label
              htmlFor="antiSnipe"
              className="block text-[14px] cursor-pointer"
              style={{ color: "#FFFFFF" }}
            >
              启用防狙击机制
            </label>
            <p className="text-[12px] mt-1" style={{ color: "#93C5FD" }}>
              在最后 1 分钟内的出价将自动延长拍卖时间
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: "#5B7FFF", color: "white" }}
          >
            创建
          </button>
        </div>
        {!isConnected && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-[13px]"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.18)",
              color: "#FBBF24",
            }}
          >
            <AlertCircle className="size-4" />
            <span>请先连接钱包以创建拍卖</span>
          </div>
        )}
      </form>
    </div>
  );
}
