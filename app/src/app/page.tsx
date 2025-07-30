'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle'

export default function Home() {
  const [account, setAccount] = useState<string>('')
  const [fhevmInstance, setFhevmInstance] = useState<any>(null)
  const [balance, setBalance] = useState<string>('0')
  const [isConnected, setIsConnected] = useState(false)

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        
        setAccount(address)
        setIsConnected(true)
        
        // Initialize FHEVM instance
        const config = { ...SepoliaConfig, network: (window as any).ethereum }
        const instance = await createInstance(config)
        setFhevmInstance(instance)
        
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount('')
    setIsConnected(false)
    setFhevmInstance(null)
    setBalance('0')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Wallet Connection */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Wallet Connection</h2>
        {!isConnected ? (
          <button onClick={connectWallet} className="btn-primary">
            Connect Wallet
          </button>
        ) : (
          <div>
            <p className="text-green-600 mb-2">✓ Connected</p>
            <p className="text-sm text-gray-600 mb-4">
              Address: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <button onClick={disconnectWallet} className="btn-secondary">
              Disconnect
            </button>
          </div>
        )}
      </div>

      {isConnected && (
        <>
          {/* Balance Display */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Platform Balance</h2>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {balance} cUSDT
            </div>
            <p className="text-sm text-gray-600">
              Your encrypted balance on SecretPlatform
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Deposit */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Deposit cUSDT</h3>
              <div className="mb-4">
                <label className="label">Amount</label>
                <input 
                  type="number" 
                  placeholder="Enter amount to deposit"
                  className="input-field"
                />
              </div>
              <button className="btn-primary w-full">
                Deposit
              </button>
            </div>

            {/* Withdraw */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Withdraw cUSDT</h3>
              <div className="mb-4">
                <label className="label">Amount</label>
                <input 
                  type="number" 
                  placeholder="Enter amount to withdraw"
                  className="input-field"
                />
              </div>
              <button className="btn-primary w-full">
                Withdraw
              </button>
            </div>

            {/* Transfer */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Secret Transfer</h3>
              <div className="mb-4">
                <label className="label">Recipient Address</label>
                <input 
                  type="text" 
                  placeholder="0x..."
                  className="input-field mb-4"
                />
                <label className="label">Amount</label>
                <input 
                  type="number" 
                  placeholder="Enter amount to transfer"
                  className="input-field"
                />
              </div>
              <button className="btn-primary w-full">
                Send Transfer
              </button>
            </div>

            {/* Claim */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Claim Transfer</h3>
              <div className="mb-4">
                <label className="label">Sender Address</label>
                <input 
                  type="text" 
                  placeholder="0x..."
                  className="input-field"
                />
              </div>
              <button className="btn-primary w-full">
                Claim Transfer
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="card mt-6">
            <h3 className="text-lg font-bold mb-4">How it works</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>1. Deposit:</strong> Transfer cUSDT tokens to the platform. Your balance is encrypted and only you can see it.
              </p>
              <p>
                <strong>2. Secret Transfer:</strong> Send encrypted amounts to other addresses. Recipients won't know the amount until they claim.
              </p>
              <p>
                <strong>3. Claim:</strong> Receive transfers sent to your address by claiming from the sender.
              </p>
              <p>
                <strong>4. Withdraw:</strong> Convert your platform balance back to cUSDT tokens in your wallet.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}