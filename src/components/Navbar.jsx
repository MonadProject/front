import { Zap } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance, useSwitchChain, useChainId } from 'wagmi'
import { useEffect } from 'react'
import { monadTestnet } from '../config/wagmi'

export default function Navbar() {
  const { address, isConnected } = useAccount()
  const { data: balance, refetch } = useBalance({ address, enabled: !!address })
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  
  useEffect(() => {
    if (!address) return
    const handler = () => refetch?.()
    window.addEventListener('tx-confirmed', handler)
    return () => window.removeEventListener('tx-confirmed', handler)
  }, [address, refetch])

  const handleSwitchMonad = async () => {
    try {
      await switchChain({ chainId: monadTestnet.id })
    } catch (e) {
      if (window.ethereum?.request) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x' + monadTestnet.id.toString(16),
              chainName: monadTestnet.name,
              nativeCurrency: monadTestnet.nativeCurrency,
              rpcUrls: monadTestnet.rpcUrls.default.http,
              blockExplorerUrls: [monadTestnet.blockExplorers?.default?.url].filter(Boolean),
            },
          ],
        })
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + monadTestnet.id.toString(16) }],
        })
      }
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 h-16 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-6" style={{ color: '#6366F1' }} />
          <span className="text-[18px] font-bold" style={{ color: '#1F2937' }}>
            Monad Auction
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isConnected && balance?.formatted && (
            <div className="px-3 py-1 rounded-lg text-sm" style={{ backgroundColor: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
              余额: {Number(balance.formatted).toFixed(4)} {balance.symbol}
            </div>
          )}
          <ConnectButton
            chainStatus="icon"
            accountStatus={{ smallScreen: 'avatar', largeScreen: 'address' }}
            showBalance={false}
          />
        </div>
      </div>
    </nav>
  )
}
