import { useState, useEffect } from 'react'

export async function getENSName(address: string): Promise<string | null> {
  const isBrowser = typeof window !== 'undefined'

  // The namehash package is heavy, so let's lazy-load it in the browser
  // @ts-ignore
  const namehash = isBrowser ? await import('eth-ens-namehash') : require('eth-ens-namehash')

  const node = namehash.hash(`${address.substring(2)}.addr.reverse`)
  const req = await fetch('https://cloudflare-eth.com/', {
    'headers': {
      'content-type': "application/json",
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      id: 1,
      params: [
        {
          from: '0x0000000000000000000000000000000000000000',
          data: `0x691f3431${node.substr(2)}`,
          to: '0xa2c122be93b0074270ebee7f6b7292c7deb45047',
        },
        'latest',
      ],
    }),
    method: 'POST',
  })
  const response = await req.json()

  if (!response.result) {
    throw new Error(response.error || 'ENS query failed')
  }

  const length = parseInt(response.result.substr(66,64), 16)
  if (length === 0) {
    return null
  }
  const nameHex = response.result.substr(130, length * 2)
  const name = Buffer.from(nameHex,'hex').toString()
  return name
}

const cache: { [address: string]: string | null } = {}

export const useENSName = (address?: string | null, defaultName?: string | null) => {
  const initialName = (address && cache[address.toLowerCase()]) || defaultName || null;
  const [name, setName] = useState<string | null>(initialName)

  useEffect(() => {
    if (address) {
      if (name && name !== initialName) {
        setName(null)
      }
      getENSName(address).then((name: string | null) => {
        cache[address.toLowerCase()] = name
        setName(name)
      })
      .catch((e) => {
        console.warn(`Fetch name for ${address} failed: ${e.message || e.toString()}`)
      })
    } else {
      setName(null)
    }
  }, [address])

  return name || defaultName || null
}

export const setENSCache = (address: string, name: string) => {
  cache[address.toLowerCase()] = name
}
