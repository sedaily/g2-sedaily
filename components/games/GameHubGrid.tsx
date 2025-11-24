import { GameCard } from "./GameCard"
import { GAMES } from "@/lib/games-data"

export function GameHubGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 place-items-stretch">
      {GAMES.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
