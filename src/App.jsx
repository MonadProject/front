import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import AuctionCard from './components/AuctionCard'
import AuctionDetailModal from './components/AuctionDetailModal'
import CreateAuctionForm from './components/CreateAuctionForm'
import { Plus, Package } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { useAuctions, usePlaceBid, useCreateAuction } from './hooks/useAuction'

export default function App() {
  const { auctions, isLoading, error, refresh } = useAuctions()
  const [selectedAuction, setSelectedAuction] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const bid = usePlaceBid()
  const create = useCreateAuction()

  useEffect(() => {
    if (bid.isSuccess) {
      toast.success('出价成功！')
      setSelectedAuction(null)
      refresh()
    }
  }, [bid.isSuccess])

  useEffect(() => {
    if (create.isSuccess) {
      toast.success('拍卖创建成功！')
      setShowCreateForm(false)
      refresh()
    }
  }, [create.isSuccess])

  const handlePlaceBid = async (auctionId, amount) => {
    try {
      await bid.placeBid(auctionId, amount)
      toast.info('交易已提交，等待确认...')
    } catch (e) {
      toast.error(e?.message || '提交出价失败')
    }
  }

  const handleCreateAuction = async (newAuction) => {
    try {
      await create.createAuction(newAuction.name, newAuction.startingPrice, Math.floor(newAuction.duration / 1000))
      toast.info('交易已提交，等待确认...')
    } catch (e) {
      toast.error(e?.message || '创建拍卖失败')
    }
  }

  const filteredAuctions = auctions.filter((a) => (filter === 'all' ? true : a.status === filter))

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <Toaster position="top-right" richColors />
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[36px] mb-2" style={{ color: '#1F2937' }}>拍卖市场</h1>
            <p className="text-[16px]" style={{ color: '#6B7280' }}>在 Monad 上探索和参与数字资产拍卖</p>
          </div>
          <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: '#6366F1', color: 'white' }}>
            <Plus className="size-5" />
            <span>创建拍卖</span>
          </button>
        </div>
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: '全部' },
            { key: 'active', label: '进行中' },
            { key: 'ended', label: '已结束' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} className="px-6 py-2 rounded-lg transition-all" style={{ backgroundColor: filter === tab.key ? '#6366F1' : 'white', color: filter === tab.key ? 'white' : '#6B7280' }}>
              {tab.label}
            </button>
          ))}
        </div>
        {filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} onClick={() => setSelectedAuction(auction)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 rounded-full mb-4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
              <Package className="size-12" style={{ color: '#6366F1' }} />
            </div>
            <h3 className="text-[20px] mb-2" style={{ color: '#1F2937' }}>暂无拍卖</h3>
            <p className="text-[14px] mb-6" style={{ color: '#6B7280' }}>{filter === 'all' ? '还没有任何拍卖项目' : `当前没有${filter === 'active' ? '进行中' : '已结束'}的拍卖`}</p>
            {filter === 'all' && (
              <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: '#6366F1', color: 'white' }}>
                <Plus className="size-5" />
                <span>创建首个拍卖</span>
              </button>
            )}
          </div>
        )}
      </main>
      {selectedAuction && (
        <AuctionDetailModal auction={selectedAuction} onClose={() => setSelectedAuction(null)} onPlaceBid={handlePlaceBid} />
      )}
      {showCreateForm && (
        <CreateAuctionForm onClose={() => setShowCreateForm(false)} onCreate={handleCreateAuction} />
      )}
    </div>
  )
}
