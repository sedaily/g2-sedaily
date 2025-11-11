import { GameCard } from "./GameCard"
import { GAMES } from "@/lib/games-data"

export function GameHubGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 place-items-stretch">
      {GAMES.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
