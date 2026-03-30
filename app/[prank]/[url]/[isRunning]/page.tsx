'use client'
import dynamic from 'next/dynamic'
import { use } from 'react'

const PrankRunner = dynamic(() => import('../../../../src/prankrunner').then(m => ({ default: m.PrankRunner })), { ssr: false })

export default function PrankUrlRunningPage({ params }: { params: Promise<{ prank: string; url: string; isRunning: string }> }) {
  const { prank, url, isRunning } = use(params)
  return <PrankRunner prank={prank} url={url} isRunning={isRunning} />
}
