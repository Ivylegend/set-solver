import type { Player } from "@/lib/types";

const sampleNames = [
  "Tobi",
  "Malik",
  "Jay",
  "Omar",
  "Kelechi",
  "Seyi",
  "Dami",
  "Femi",
  "Andre",
  "Musa",
  "Victor",
  "Leo",
  "Ibrahim",
  "Sam",
  "Nate",
  "Chris",
  "Rafa",
  "Daniel",
  "Ayo",
  "Ken",
];

export function createSamplePlayers(): Player[] {
  return sampleNames.map((name) => ({
    id: crypto.randomUUID(),
    name,
  }));
}
