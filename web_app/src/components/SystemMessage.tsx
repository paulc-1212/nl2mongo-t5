import { MessageFromSystem } from "@/lib/Message";
import Link from "next/link";

export default function SystemMessage({ message }: { message: MessageFromSystem }) {

    return <div className="flex justify-start">
        {
            message.isError
                ? (
                    <div className="inline-block p-3 rounded-md bg-red-900/50 border border-red-600 text-red-300 text-sm shadow-md max-w-xl">
                        {message.content.map(item => Object.keys(item).map(k => (<div key={k}><strong>{k?.toUpperCase()}:</strong>&nbsp;<span>{JSON.stringify(item[k])}</span></div>)))}
                    </div>

                )
                : (
                    <Link href={`/details/${message.id}`} className="inline-block p-3 rounded-md max-w-xl shadow-lg transition-colors duration-150 bg-gray-800 text-gray-200 border border-gray-700 cursor-pointer hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-950">
                        <div className="inline-block p-3 rounded-md max-w-xl shadow-lg transition-colors duration-150 bg-gray-800 text-gray-200 border border-gray-700 cursor-pointer hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-950">
                            <div className="flex flex-col items-start space-y-1.5">
                                <div className="inline-flex items-center gap-1.5 text-sm text-gray-100">
                                    📱 View Data
                                </div>
                                {message.durationMs && (
                                    <span className="text-[10px] text-gray-500">
                                        Generated in {(message.durationMs / 1000).toFixed(2)}s
                                    </span>
                                )}
                                <span className="text-[10px] text-gray-500">
                                    Details: {JSON.stringify(message.content)}
                                </span>
                            </div>
                        </div>
                    </Link>
                )
        }

    </div>
}