import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract'
import { formatEther } from 'viem'

export default function MyRecords({ onClose }) {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-[28px]" style={{ color: '#1F2937' }}>我的拍卖记录</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="px-3 py-2 rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>刷新</button>
            <button onClick={onClose} className="px-3 py-2 rounded-lg transition-all hover:bg-gray-100" style={{ color: '#6B7280' }}>关闭</button>
          </div>
        </div>
        <div className="p-6">
          {!isConnected && (
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              请先连接钱包以查看拍卖记录
            </div>
          )}
          {isConnected && items.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl" style={{ color: '#6B7280' }}>暂无拍卖记录</p>
            </div>
          )}
          {isConnected && items.length > 0 && (
            <div className="space-y-4">
              {items.map((r, idx) => (
                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px]" style={{ color: '#9CA3AF' }}>拍卖 ID</div>
                    <div className="font-mono">#{String(r.auctionId)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px]" style={{ color: '#9CA3AF' }}>拍卖品名称</div>
                    <div className="font-medium" style={{ color: '#1F2937' }}>{String(r.itemName)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px]" style={{ color: '#9CA3AF' }}>最终成交价</div>
                    <div className="text-[18px]" style={{ color: '#6366F1' }}>{formatEther(BigInt(r.finalPrice))} MON</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[14px]" style={{ color: '#9CA3AF' }}>成交时间</div>
                    <div className="font-mono" style={{ color: '#374151' }}>{new Date(Number(r.timestamp) * 1000).toLocaleString()}</div>
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
