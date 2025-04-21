'use client'
import { MessageFromSystem, RowValue } from "@/lib/Message";
import { getMessageById } from "@/store/messageStore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailsPage() {
  const { messageId } = useParams();
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState<MessageFromSystem | undefined>();
  useEffect(() => {
    if (!messageId) {
      setIsError(true);
      return;
    }
    const parsedMessageId = parseInt(messageId as string, 10);
    const foundMessage = getMessageById(parsedMessageId);
    if (!foundMessage) {
      setIsError(true);
      return;
    }
    setMessage(foundMessage as MessageFromSystem);
  }, [messageId, message, isError]);

  if (isError || !message) {
    return (
      <>
        <div className="inline-block p-3 rounded-md bg-red-900/50 border border-red-600 text-red-300 text-sm shadow-md max-w-xl">
          Something went wrong. Unable to view data at the moment.
        </div>
        <Link href="/" className="inline-block mt-3 p-3 rounded-md max-w-xl shadow-lg transition-colors duration-150 bg-sky-700 text-gray-200 cursor-pointer hover:bg-sky-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-sky-700 focus:ring-offset-2 focus:ring-offset-gray-950">
          ← BACK
        </Link>
      </>
    )
  }

  const renderCellContent = (content: RowValue): React.ReactNode => {
    if (!content) {
      return <span className="text-gray-400 italic text-[10px]">NULL</span>;
    } else if (typeof content === 'boolean') {
      return content ? 'True' : 'False';
    } else if (typeof content === 'object') {
      return (
        <pre className="text-[10px] bg-gray-300 p-1 rounded overflow-x-auto max-w-xs inline-block whitespace-pre-wrap">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }
    return String(content);
  };

  const headers = Object.keys(message.content[0] || {});
  return (
    <>
      <div className="overflow-x-auto max-w-full">
        <table className="min-w-full w-full table-auto text-left border-collapse rounded-md overflow-hidden border shadow-sm bg-white border-sky-300 text-xs">
          <thead className="bg-sky-500 text-white">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-3 py-2 text-xs font-semibold tracking-wider border-b border-green-600">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-green-200 text-gray-800">
            {message.content.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="hover:bg-sky-50 transition-colors duration-150">
                {headers.map((header, cellIndex) => (
                  <td key={`cell-${rowIndex}-${cellIndex}`} className="px-3 py-2 align-middle whitespace-nowrap">
                    {renderCellContent(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message.durationMs && (
        <div className="text-[10px] text-gray-500 mt-2">
          Generated in {(message.durationMs / 1000).toFixed(2)}s
        </div>
      )}
      <Link href="/" className="inline-block mt-3 p-3 rounded-md max-w-xl shadow-lg transition-colors duration-150 bg-sky-700 text-gray-200 cursor-pointer hover:bg-sky-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-sky-700 focus:ring-offset-2 focus:ring-offset-gray-950">
        ← BACK
      </Link>
      {message.stats && (
        <div className="text-[10px] text-gray-500 mt-2">
          <strong>Stats:</strong>
          {Object.entries(message.stats).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {JSON.stringify(value)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}