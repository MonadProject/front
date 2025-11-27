import { useState } from 'react'
import { useCreateAuction } from '../hooks/useAuction'

export default function CreateAuction({ onClose, onSuccess }) {
  const { createAuction, isPending, isSuccess } = useCreateAuction()
  const [formData, setFormData] = useState({ itemName: '', desc: '', startPrice: '', duration: 3600, antiSniping: true })
  const durations = [1800, 3600, 7200, 21600, 43200, 86400]
  const handleSubmit = async (e) => {
    e.preventDefault()
    await createAuction(formData.itemName, formData.startPrice, parseInt(formData.duration))
  }
  if (isSuccess) {
    onSuccess?.()
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">创建拍卖</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">拍卖品名称</label>
            <input className="input-field" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} placeholder="例如：稀有 NFT 艺术品" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">拍卖品描述</label>
            <input className="input-field" value={formData.desc} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} placeholder="详细描述您的拍卖品…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">起拍价 (MON)</label>
              <input className="input-field" type="number" step="0.01" value={formData.startPrice} onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })} placeholder="10" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">最低加价 (MON)</label>
              <input className="input-field" type="number" step="1" placeholder="1" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">拍卖时长</label>
            <div className="grid grid-cols-3 gap-3">
              {durations.map((d) => (
                <button type="button" key={d} onClick={() => setFormData({ ...formData, duration: d })} className={`px-4 py-2 rounded-lg border ${formData.duration === d ? 'border-primary text-primary bg-primary/10' : 'border-gray-300 text-gray-700 bg-white'}`}>
                  {d === 1800 ? '30 分钟' : d === 3600 ? '1 小时' : d === 7200 ? '2 小时' : d === 21600 ? '6 小时' : d === 43200 ? '12 小时' : '24 小时'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="anti" type="checkbox" checked={formData.antiSniping} onChange={(e) => setFormData({ ...formData, antiSniping: e.target.checked })} />
            <label htmlFor="anti" className="text-sm text-gray-700">启用防狙击机制</label>
          </div>
          <button type="submit" disabled={isPending} className="btn-primary w-full py-3">{isPending ? '处理中...' : '创建拍卖'}</button>
        </form>
      </div>
    </div>
  )
}
