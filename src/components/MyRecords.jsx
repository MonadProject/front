import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract'
import { formatEther } from 'viem'

export default function MyRecords({ onClose, asPage = false }) {
  const { address, isConnected } = useAccount()
  const { data: records, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserRecords',
    args: [address],
    watch: false,
  })

  const items = Array.isArray(records) ? records : []

  const handleRefresh = async () => {
    await refetch?.()
  }

  if (asPage) {
    return (
      <div className="max-w-5xl mx-auto p-6" style={{ color: 'white' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[28px]">我的拍卖记录</h2>
          <button onClick={handleRefresh} className="px-3 py-2 rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#93C5FD', border: '1px solid rgba(255,255,255,0.12)' }}>刷新</button>
        </div>
        <div>
          {!isConnected && (
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.18)', color: '#FBBF24' }}>
              请先连接钱包以查看拍卖记录
            </div>
          )}
          {isConnected && items.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl" style={{ color: '#93C5FD' }}>暂无拍卖记录</p>
            </div>
          )}
          {isConnected && items.length > 0 && (
            <div className="space-y-4">
              {items.map((r, idx) => (
                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(18px)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.65)' }}>拍卖 ID</div>
                    <div className="font-mono">#{String(r.auctionId)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.65)' }}>拍卖品名称</div>
                    <div className="font-medium" style={{ color: '#FFFFFF' }}>{String(r.itemName)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.65)' }}>最终成交价</div>
                    <div className="text-[18px]" style={{ color: '#5B7FFF' }}>{formatEther(BigInt(r.finalPrice))} MON</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.65)' }}>成交时间</div>
                    <div className="font-mono" style={{ color: 'rgba(255,255,255,0.8)' }}>{new Date(Number(r.timestamp) * 1000).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}>
      <div
        className="rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 p-6 flex items-center justify-between"
          style={{ background: 'rgba(10, 16, 30, 0.6)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}
        >
          <h2 className="text-[28px]">我的拍卖记录</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="px-3 py-2 rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#93C5FD', border: '1px solid rgba(255,255,255,0.12)' }}>刷新</button>
            <button onClick={onClose} className="px-3 py-2 rounded-lg transition-all hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.7)' }}>关闭</button>
          </div>
        </div>
        <div className="p-6" style={{ color: '#FFFFFF' }}>
          {!isConnected && (
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.18)', color: '#FBBF24' }}>
              请先连接钱包以查看拍卖记录
            </div>
          )}
          {isConnected && items.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl" style={{ color: '#93C5FD' }}>暂无拍卖记录</p>
            </div>
          )}
          {isConnected && items.length > 0 && (
            <div className="space-y-4">
              {items.map((r, idx) => (
                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(18px)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.65)' }}>拍卖 ID</div>
                    <div className="font-mono">#{String(r.auctionId)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.65)' }}>拍卖品名称</div>
                    <div className="font-medium" style={{ color: '#FFFFFF' }}>{String(r.itemName)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.65)' }}>最终成交价</div>
                    <div className="text-[18px]" style={{ color: '#5B7FFF' }}>{formatEther(BigInt(r.finalPrice))} MON</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.65)' }}>成交时间</div>
                    <div className="font-mono" style={{ color: 'rgba(255,255,255,0.8)' }}>{new Date(Number(r.timestamp) * 1000).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
