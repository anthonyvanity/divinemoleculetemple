const v = "?v=4";

const LINES = [
  `/shop/seal.jpg${v}`,
  `/shop/round.png${v}`,
  `/shop/eye.png${v}`,
  `/shop/divinism.png${v}`,
  `/shop/divinism-flame.png${v}`,
  `/shop/dmt.png${v}`,
  `/shop/circuit.png${v}`,
  `/shop/dmt-flame.png${v}`,
  `/shop/run.png${v}`,
  `/shop/run-flame.png${v}`,
  `/shop/stack.png${v}`,
  `/shop/temple.png${v}`,
  `/shop/dna.png${v}`,
  `/shop/mandala.png${v}`,
  `/shop/flower.png${v}`,
  `/shop/portal.png${v}`,
] as const;

export const STICKERS = [
  {
    id: "seal",
    name: "The seal",
    price: 5,
    art: [`/shop/seal.jpg${v}`],
    line: "The star and the flame.",
  },
  {
    id: "round",
    name: "The circle",
    price: 5,
    art: [`/shop/round.png${v}`],
    line: "Divine Molecule Temple.",
  },
  {
    id: "eye",
    name: "The eye",
    price: 5,
    art: [`/shop/eye.png${v}`],
    line: "Ex Deo et Spiritu. Molecula æterna.",
  },
  {
    id: "divinism",
    name: "Divinism",
    price: 5,
    art: [`/shop/divinism.png${v}`],
    line: "The religion of the enlightened.",
  },
  {
    id: "divinism-flame",
    name: "Divinism flame",
    price: 5,
    art: [`/shop/divinism-flame.png${v}`],
    line: "Divinism.",
  },
  {
    id: "dmt",
    name: "Chrome DMT",
    price: 5,
    art: [`/shop/dmt.png${v}`],
    line: "DMT.",
  },
  {
    id: "circuit",
    name: "Circuit DMT",
    price: 5,
    art: [`/shop/circuit.png${v}`],
    line: "DMT.",
  },
  {
    id: "dmt-flame",
    name: "Flame DMT",
    price: 5,
    art: [`/shop/dmt-flame.png${v}`],
    line: "DMT.",
  },
  {
    id: "run",
    name: "Run light",
    price: 5,
    art: [`/shop/run.png${v}`],
    line: "Run light. Terminate darkness. Stay online.",
  },
  {
    id: "run-flame",
    name: "Run light, flame",
    price: 5,
    art: [`/shop/run-flame.png${v}`],
    line: "Run light. Terminate darkness. Stay online.",
  },
  {
    id: "stack",
    name: "The name",
    price: 5,
    art: [`/shop/stack.png${v}`],
    line: "Divine Molecule Temple.",
  },
  {
    id: "temple",
    name: "The flame",
    price: 5,
    art: [`/shop/temple.png${v}`],
    line: "Divine Molecule Temple.",
  },
  {
    id: "dna",
    name: "The helix",
    price: 5,
    art: [`/shop/dna.png${v}`],
    line: "The molecule.",
  },
  {
    id: "mandala",
    name: "The molecule",
    price: 5,
    art: [`/shop/mandala.png${v}`],
    line: "The molecule.",
  },
  {
    id: "flower",
    name: "The flower",
    price: 5,
    art: [`/shop/flower.png${v}`],
    line: "The flower.",
  },
  {
    id: "portal",
    name: "The gate",
    price: 5,
    art: [`/shop/portal.png${v}`],
    line: "Divinity. Unity. Infinity.",
  },
  {
    id: "pack",
    name: "Full pack",
    price: 40,
    art: [...LINES],
    line: "All of them.",
  },
] as const;

export type StickerId = (typeof STICKERS)[number]["id"];

export function shopSticker(id: string) {
  return STICKERS.find((item) => item.id === id) ?? null;
}
