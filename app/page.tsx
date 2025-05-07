import RouletteGame from "@/components/roulette-game"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8 font-main">
        <RouletteGame />
      </div>

    </main>
  )
}