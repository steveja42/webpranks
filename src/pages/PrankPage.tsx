import { useParams } from 'react-router-dom'
import { PrankRunner } from '../prankrunner'

export default function PrankPage() {
	const { prank, url, isRunning } = useParams()
	return <PrankRunner prank={prank} url={url} isRunning={isRunning} />
}
