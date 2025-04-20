import { MessageFromUser } from "@/lib/Message";

export default function UserMessage({ message }: { message: MessageFromUser }) {
    return <div className="flex justify-end">
        <div className="inline-block p-3 rounded-md max-w-xl shadow-lg transition-colors duration-150 bg-cyan-600 text-black">
            <p className="text-sm leading-relaxed">
                {message.content}
            </p>
        </div>
    </div>
}