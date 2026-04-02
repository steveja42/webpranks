import Container from 'react-bootstrap/Container'
import { FeedbackForm } from '../feedback'

export default function FeedbackPage() {
	return (
		<Container className="prose-page py-4">
			<FeedbackForm />
		</Container>
	)
}
