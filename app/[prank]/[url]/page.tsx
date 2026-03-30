'use client'
import dynamic from 'next/dynamic'
import { use } from 'react'

const PrankRunner = dynamic(() => import('../../../src/prankrunner').then(m => ({ default: m.PrankRunner })), { ssr: false })

export default function PrankUrlPage({ params }: { params: Promise<{ prank: string; url: string }> }) {
  const { prank, url } = use(params)
  return <PrankRunner prank={prank} url={url} isRunning={undefined} />
}
