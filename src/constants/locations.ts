export interface LocationConfig {
  id: string;
  name: string;
  cities: string[];
}

export const districts: LocationConfig[] = [
  {
    id: "colombo",
    name: "Colombo",
    cities: ["Colombo 1-15", "Dehiwala", "Moratuwa", "Kotte", "Maharagama"],
  },
  {
    id: "gampaha",
    name: "Gampaha",
    cities: ["Gampaha", "Negombo", "Kelaniya", "Wattala", "Katunayake"],
  },
  {
    id: "kandy",
    name: "Kandy",
    cities: ["Kandy", "Peradeniya", "Katugastota", "Gampola", "Nawalapitiya"],
  },
  {
    id: "galle",
    name: "Galle",
    cities: ["Galle", "Ambalangoda", "Hikkaduwa", "Elpitiya"],
  },
  // We can add more districts later
];
