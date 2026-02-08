export type SportCategory = "Singles" | "Doubles" | "Mixed Doubles";

export type WinningsRow = {
  round: string;
  australianOpenAud?: string;
  usOpenUsd?: string;
  rolandGarrosEur?: string;
  wimbledonGbp?: string;
  torontoUsd?: string;
};

export const winningsByCategory: Record<SportCategory, WinningsRow[]> = {
  Singles: [
    { round: "Winner", australianOpenAud: "$4,150,000", usOpenUsd: "$5,000,000", rolandGarrosEur: "€2,550,000", wimbledonGbp: "£3,000,000", torontoUsd: "$1,124,380" },
    { round: "Runner-up", australianOpenAud: "$2,150,000", usOpenUsd: "$2,500,000", rolandGarrosEur: "€1,275,000", wimbledonGbp: "£1,520,000", torontoUsd: "$597,890" },
    { round: "Semifinalists", australianOpenAud: "$1,250,000", usOpenUsd: "$1,260,000", rolandGarrosEur: "€690,000", wimbledonGbp: "£775,000", torontoUsd: "$332,160" },
    { round: "Quarterfinalists", australianOpenAud: "$750,000", usOpenUsd: "$660,000", rolandGarrosEur: "€440,000", wimbledonGbp: "£400,000", torontoUsd: "$189,075" },
    { round: "Round of 16", australianOpenAud: "$480,000", usOpenUsd: "$400,000", rolandGarrosEur: "€265,000", wimbledonGbp: "£240,000", torontoUsd: "$103,225" },
    { round: "Round of 32", australianOpenAud: "$327,750", usOpenUsd: "$237,000", rolandGarrosEur: "€168,000", wimbledonGbp: "£152,000", torontoUsd: "$60,400" },
    { round: "Round of 64", australianOpenAud: "$225,000", usOpenUsd: "$154,000", rolandGarrosEur: "€117,000", wimbledonGbp: "£99,000", torontoUsd: "$35,260" },
    { round: "First Round", australianOpenAud: "$150,000", usOpenUsd: "$110,000", rolandGarrosEur: "€78,000", wimbledonGbp: "£66,000", torontoUsd: "$23,760" },
    { round: "Qualifying - Q3", australianOpenAud: "$83,500", rolandGarrosEur: "€43,000", wimbledonGbp: "£38,000" },
    { round: "Qualifying - Q2", australianOpenAud: "$57,000", rolandGarrosEur: "€29,500", wimbledonGbp: "£25,000" },
    { round: "Qualifying - Q1", australianOpenAud: "$40,500", usOpenUsd: "$27,500", rolandGarrosEur: "€21,000", wimbledonGbp: "£15,750" },
  ],
  Doubles: [
    { round: "Winner", australianOpenAud: "A$900,000", usOpenUsd: "$1,000,000", rolandGarrosEur: "€590,000", wimbledonGbp: "£680,000" },
    { round: "Runner-up", australianOpenAud: "A$485,000", usOpenUsd: "$500,000", rolandGarrosEur: "€295,000", wimbledonGbp: "£345,000" },
    { round: "Semifinalists", australianOpenAud: "A$275,000", usOpenUsd: "$250,000", rolandGarrosEur: "€148,000", wimbledonGbp: "£174,000" },
    { round: "Quarterfinalists", australianOpenAud: "A$158,000", usOpenUsd: "$125,000", rolandGarrosEur: "€80,000", wimbledonGbp: "£87,500" },
    { round: "Third Round", australianOpenAud: "A$92,000", usOpenUsd: "$75,000" },
    { round: "Second Round", australianOpenAud: "A$64,000", usOpenUsd: "$45,000" },
    { round: "First Round", australianOpenAud: "A$44,000", usOpenUsd: "$30,000", rolandGarrosEur: "€17,500", wimbledonGbp: "£16,500" },
  ],
  "Mixed Doubles": [
    { round: "Winner", australianOpenAud: "$175,000", usOpenUsd: "$1,000,000", rolandGarrosEur: "€122,000", wimbledonGbp: "£135,000" },
    { round: "Runner-up", australianOpenAud: "$97,750", usOpenUsd: "$400,000", rolandGarrosEur: "€61,000", wimbledonGbp: "£68,000" },
    { round: "Semifinalists", australianOpenAud: "$52,500", usOpenUsd: "$200,000", rolandGarrosEur: "€31,000", wimbledonGbp: "£34,000" },
    { round: "Quarterfinalists", australianOpenAud: "$27,750", usOpenUsd: "$100,000", rolandGarrosEur: "€17,500", wimbledonGbp: "£17,500" },
    { round: "Round of 16", australianOpenAud: "$14,000", usOpenUsd: "$20,000", rolandGarrosEur: "€10,000", wimbledonGbp: "£9,000" },
    { round: "First Round", australianOpenAud: "$7,250", rolandGarrosEur: "€5,000", wimbledonGbp: "£4,500" },
  ],
};

export const categories: SportCategory[] = ["Singles", "Doubles", "Mixed Doubles"];
