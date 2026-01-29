export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">AuraStream v3.6</h1>
      <div className="grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <a href="/login" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">Auth &rarr;</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">Login and Signup flows.</p>
        </a>
        <a href="/venue" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">Venue &rarr;</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">B2B Player and Schedule.</p>
        </a>
        <a href="/creator" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">Creator &rarr;</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">Discovery and Licensing.</p>
        </a>
        <a href="/admin" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">Admin &rarr;</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">Management and QC.</p>
        </a>
      </div>
    </div>
  );
}
