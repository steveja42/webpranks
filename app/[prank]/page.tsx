'use client'
import dynamic from 'next/dynamic'
import { use } from 'react'

const PrankRunner = dynamic(() => import('../../src/prankrunner').then(m => ({ default: m.PrankRunner })), { ssr: false })

export default function PrankPage({ params }: { params: Promise<{ prank: string }> }) {
  const { prank } = use(params)
  return <PrankRunner prank={prank} url={undefined} isRunning={undefined} />
}
