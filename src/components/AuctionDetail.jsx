import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export default function AuctionDetail({ item, onClose }) {
  const { address } = useAccount()
  const [bidAmount, setBidAmount] = useState('')
  const [timeLeft, setTimeLeft] = useState(item?.endsInSec || 0)
  const short = (addr) => {
    if (!addr || typeof addr !== 'string') return '-'
    const lower = addr.toLowerCase()
    if (lower === '0x0000000000000000000000000000000000000000') return '暂无'
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  const isActive = item?.status === '进行中'
  const isSeller = false
  const addQuick = (n) => {
    setBidAmount((v) => {
      const x = parseFloat(v || '0') + n
      return x.toString()
    })
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-gray-800">{item.title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
          <div className="space-y-6">
            <div className="w-full bg-amber-100 text-amber-700 rounded-lg px-4 py-3 font-semibold">
              剩余时间: {Math.floor(timeLeft / 3600)}小时 {Math.floor((timeLeft % 3600) / 60)}分钟 {(timeLeft % 60).toString().padStart(2, '0')}秒
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-gray-50">
                <p className="text-sm text-gray-600 mb-1">起拍价</p>
                <p className="text-2xl font-bold text-gray-800">{Math.max(0, item.currentPriceMON - 100)} MON</p>
              </div>
              <div className="card bg-primary/10">
                <p className="text-sm text-gray-600 mb-1">当前价格</p>
                <p className="text-2xl font-bold text-primary">{item.currentPriceMON} MON</p>
              </div>
            </div>
            <div className="card bg-indigo-50">
              <p className="text-sm text-gray-700">防狙击机制：如果在拍卖结束前5分钟内有新的出价，拍卖结束时间将自动延长5分钟。</p>
            </div>
            <div className="card bg-blue-50 border-2 border-primary">
              <h3 className="font-bold text-lg mb-4">出价</h3>
              <div className="text-sm text-gray-600 mb-2">最低加价：5 MON</div>
              <div className="flex gap-3 items-center">
                <input type="number" step="0.01" placeholder={`例如：${item.currentPriceMON + 5}`} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="input-field flex-1" />
                <button className="btn-primary px-8">确认出价</button>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => addQuick(5)} className="px-4 py-2 rounded-lg border border-primary text-primary">+5 MON</button>
                <button onClick={() => addQuick(10)} className="px-4 py-2 rounded-lg border border-primary text-primary">+10 MON</button>
                <button onClick={() => addQuick(25)} className="px-4 py-2 rounded-lg border border-primary text-primary">+25 MON</button>
              </div>
              <div className="text-xs text-gray-600 mt-2">最后 1 分钟出价将自动延长拍卖时间</div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>拍卖 ID: auction-{item.id}</p>
              <p>出价次数: {item.bids}</p>
              <p>状态: {item.status}</p>
              <p>卖家: <span className="font-mono">{short(item?.seller)}</span></p>
              <p>最新出价者: <span className="font-mono">{short(item?.highestBidder)}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
