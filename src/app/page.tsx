export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Smile Handyman AI Chatbot Service&nbsp;
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-bold text-[#1e3a8a] mb-4">Smile Handyman Assistant</h1>
        <p className="text-lg text-gray-600 text-center max-w-2xl">
          This is a standalone chatbot service for Smile Handyman. 
          You can test the chat widget on the bottom right of this page.
        </p>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1e3a8a] mb-2">Standalone</h3>
            <p className="text-sm text-gray-500">Built as an independent app for easy integration.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1e3a8a] mb-2">Smart RAG</h3>
            <p className="text-sm text-gray-500">Knows specifically about Smile Handyman services.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1e3a8a] mb-2">Multilingual</h3>
            <p className="text-sm text-gray-500">Communicates in both Korean and English fluently.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
