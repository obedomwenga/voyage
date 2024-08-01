"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import Image from "next/image"
import Link from "next/link"

const Navbar = () => {
    const [account, setAccount] = useState(null)
    const [balance, setBalance] = useState({ tbnb: 0, voy: 0 })
    const [loading, setLoading] = useState(false)

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                setLoading(true) // Start loading
                await window.ethereum.request({ method: "eth_requestAccounts" })

                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const address = await signer.getAddress()
                setAccount(address)

                // Fetch TBNB balance (assuming the user is on the BSC testnet)
                const bscProvider = new ethers.providers.JsonRpcProvider(
                    "https://data-seed-prebsc-1-s1.binance.org:8545/"
                )
                const tbnbBalance = await bscProvider.getBalance(address)
                const formattedTbnbBalance = ethers.utils.formatUnits(tbnbBalance, 18)

                // Fetch VOY balance from the contract
                const voyContract = new ethers.Contract(
                    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                    ["function balanceOf(address owner) view returns (uint256)"],
                    signer
                )
                const voyBalance = await voyContract.balanceOf(address)
                const formattedVoyBalance = ethers.utils.formatUnits(voyBalance, 18)

                setBalance({
                    tbnb: formattedTbnbBalance,
                    voy: formattedVoyBalance,
                })
            } catch (error) {
                console.error("Error connecting wallet:", error)
                if (error.code === -32000) {
                    alert(
                        "Cannot estimate gas; transaction may fail or may require manual gas limit."
                    )
                } else {
                    alert("An error occurred while connecting the wallet.")
                }
            } finally {
                setLoading(false) // End loading
            }
        } else {
            alert("MetaMask not detected. Please install MetaMask.")
        }
    }

    const disconnectWallet = () => {
        setAccount(null)
        setBalance({ tbnb: 0, voy: 0 })
    }

    return (
        <nav className="flex items-center justify-between p-4 text-white bg-black">
            <div className="flex items-center text-lg font-bold">
                <Image
                    src="/voyage-logo.png"
                    alt="Voyage"
                    width={32}
                    height={32}
                    className="mr-2"
                />
                <Link href="/">Voyage</Link>
            </div>
            <div className="flex items-center">
                <Link href="/#game-rules" className="mx-2">
                    Game Rules & Tips
                </Link>
                {account ? (
                    <div className="flex items-center space-x-2">
                        <span className="px-4 py-2 bg-green-500 rounded">TBNB: {balance.tbnb}</span>
                        <span className="px-4 py-2 bg-green-500 rounded">VOY: {balance.voy}</span>
                        <span className="px-4 py-2 bg-green-500 rounded">
                            {account.substring(0, 6)}...{account.substring(account.length - 4)}
                        </span>
                        <button onClick={disconnectWallet} className="px-4 py-2 bg-red-500 rounded">
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={connectWallet}
                        className="px-4 py-2 bg-blue-500 rounded"
                        disabled={loading}
                    >
                        {loading ? "Connecting..." : "Connect Wallet"}
                    </button>
                )}
            </div>
            
        </nav>
    )
}

export default Navbar
