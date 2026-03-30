'use client'
import dynamic from 'next/dynamic'

const PrankRunner = dynamic(() => import('../src/prankrunner').then(m => ({ default: m.PrankRunner })), { ssr: false })

export default function HomePage() {
  return <PrankRunner prank={undefined} url={undefined} isRunning={undefined} />
}
