import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import PrankPage from './pages/PrankPage'
import FeedbackPage from './pages/FeedbackPage'
import AboutPage from './pages/AboutPage'

export default function App() {
	return (
		<RootLayout>
			<Routes>
				<Route path="/:prank?/:url?/:isRunning?" element={<PrankPage />} />
				<Route path="/feedback" element={<FeedbackPage />} />
				<Route path="/about" element={<AboutPage />} />
			</Routes>
		</RootLayout>
	)
}

