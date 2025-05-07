import RouletteGame from "@/components/roulette-game"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8 font-main">
        <h1 className="text-4xl font-bold text-center mb-2 text-red-500">Text Roulette</h1>
        <p className="text-center mb-8 text-gray-300">Spin the wheel with your custom text!</p>
        <RouletteGame />
      </div>

    </main>
  )
}