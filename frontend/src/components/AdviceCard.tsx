import Markdown from 'react-markdown'

interface Props {
  advice: string
}

export default function AdviceCard({ advice }: Props) {
  return (
    <div className="card advice-card">
      <div className="card-title">✦ Screenplay Consultant Advice</div>
      <div className="advice-scroll">
        <div className="prose">
          <Markdown>{advice}</Markdown>
        </div>
      </div>
    </div>
  )
}
