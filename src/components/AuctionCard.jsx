import { Clock, Flame } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AuctionCard({ auction, onClick }) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    const updateTime = () => {
      const now = Date.now()
      const diff = auction.endTime - now
      if (diff <= 0) {
        setTimeLeft('已结束')
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      if (hours > 0) setTimeLeft(`${hours}小时 ${minutes}分钟`)
      else if (minutes > 0) setTimeLeft(`${minutes}分钟 ${seconds}秒`)
      else setTimeLeft(`${seconds}秒`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [auction.endTime])

  const getStatusBadge = () => {
    if (auction.status === 'active') {
      return <span className="px-3 py-1 rounded-full text-[12px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>● 进行中</span>
    } else if (auction.status === 'ended') {
      return <span className="px-3 py-1 rounded-full text-[12px]" style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' }}>已结束</span>
    } else {
      return <span className="px-3 py-1 rounded-full text-[12px]" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>即将开始</span>
    }
  }

  const isUrgent = auction.status === 'active' && auction.endTime - Date.now() < 60000

  return (
    <div onClick={onClick} className="bg-white rounded-lg p-6 shadow-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[18px]" style={{ color: '#1F2937' }}>{auction.name}</h3>
        {getStatusBadge()}
      </div>
      <div className="mb-4">
        <p className="text-[14px] mb-3" style={{ color: '#6B7280' }}>{auction.description}</p>
        {auction.isAntiSnipe && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', color: '#6366F1' }}>
            <Flame className="size-4" />
            <span>防狙击保护：最后5分钟出价将延长时间</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[12px] mb-1" style={{ color: '#9CA3AF' }}>当前价格</div>
          <div className="text-[24px]" style={{ color: '#6366F1' }}>{auction.currentPrice} MON</div>
        </div>
        <div className="text-right">
          <div className="text-[12px] mb-1" style={{ color: '#9CA3AF' }}>{auction.bids} 次出价</div>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-4 border-t text-[14px]" style={{ borderColor: '#E5E7EB', color: isUrgent ? '#F59E0B' : '#6B7280' }}>
        <Clock className="size-4" />
        <span className={isUrgent ? 'font-medium' : ''}>剩余时间: {timeLeft}</span>
      </div>
    </div>
  )
}
