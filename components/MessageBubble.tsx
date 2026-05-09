import { Message } from '@/types/chat'

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isBot = message.role === 'assistant'

  return (
    <div className={`flex gap-2 items-start ${isBot ? '' : 'justify-end'}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">R</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isBot
            ? 'bg-white border border-gray-200 rounded-tl-none text-gray-800'
            : 'bg-green-600 text-white rounded-tr-none'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
