import { useState } from "react";
import { X, Plus, AlertCircle } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { useEffect } from "react";

export default function CreateAuctionForm({ onClose, onCreate }) {
  const { address, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({ address, enabled: !!address })
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startingPrice: 0.001,
    minBidIncrement: 0.001,
    duration: 3600000,
    isAntiSnipe: true,
  });
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConnected) {
      alert("请先连接钱包");
      return;
    }
    if (validate()) onCreate(formData);
  };

  useEffect(() => {
    if (!address) return
    const handler = () => refetch?.()
    window.addEventListener('tx-confirmed', handler)
    return () => window.removeEventListener('tx-confirmed', handler)
  }, [address, refetch])

  const durationOptions = [
    { label: "1 分钟", value: 60000 },
    { label: "5 分钟", value: 300000 },
    { label: "10 分钟", value: 600000 },
    { label: "30 分钟", value: 1800000 },
    { label: "1 小时", value: 3600000 },
    { label: "2 小时", value: 7200000 },
    { label: "6 小时", value: 21600000 },
    { label: "12 小时", value: 43200000 },
    { label: "24 小时", value: 86400000 },  
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 bg-white border-b p-6 flex items-center justify-between"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "#EEF2FF" }}
            >
              <Plus className="size-6" style={{ color: "#6366F1" }} />
            </div>
            <h2 className="text-[28px]" style={{ color: "#1F2937" }}>
              创建拍卖
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="size-6" style={{ color: "#6B7280" }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {isConnected && balance?.formatted && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
              <span>当前余额:</span>
              <span className="font-mono">{Number(balance.formatted).toFixed(4)} {balance.symbol}</span>
            </div>
          )}
          <div>
            <label
              className="block text-[14px] mb-2"
              style={{ color: "#374151" }}
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
                borderColor: errors.name ? "#EF4444" : "#D1D5DB",
                borderWidth: errors.name ? "2px" : "1px",
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
              style={{ color: "#374151" }}
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
                borderColor: errors.description ? "#EF4444" : "#D1D5DB",
                borderWidth: errors.description ? "2px" : "1px",
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
                style={{ color: "#374151" }}
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
                  borderColor: errors.startingPrice ? "#EF4444" : "#D1D5DB",
                  borderWidth: errors.startingPrice ? "2px" : "1px",
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
                style={{ color: "#374151" }}
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
                  borderColor: errors.minBidIncrement ? "#EF4444" : "#D1D5DB",
                  borderWidth: errors.minBidIncrement ? "2px" : "1px",
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
              style={{ color: "#374151" }}
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
                    borderColor:
                      formData.duration === option.value
                        ? "#6366F1"
                        : "#E5E7EB",
                    backgroundColor:
                      formData.duration === option.value ? "#EEF2FF" : "white",
                    color:
                      formData.duration === option.value
                        ? "#6366F1"
                        : "#6B7280",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div
            className="flex items-start gap-4 p-4 rounded-lg"
            style={{ backgroundColor: "#F9FAFB" }}
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
                style={{ color: "#1F2937" }}
              >
                启用防狙击机制
              </label>
              <p className="text-[12px] mt-1" style={{ color: "#6B7280" }}>
                在最后 1 分钟内的出价将自动延长拍卖时间
              </p>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: "#6366F1", color: "white" }}
          >
            创建拍卖
          </button>
          {!isConnected && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-[13px]"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                color: "#F59E0B",
              }}
            >
              <AlertCircle className="size-4" />
              <span>请先连接钱包以创建拍卖</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
