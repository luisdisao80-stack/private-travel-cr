// Curated country dial codes used by the booking phone input.
// Order: top tourism source markets for Costa Rica first, then the rest sorted.

export type Country = {
  iso2: string;
  name: string;
  dial: string; // includes the leading "+"
  flag: string; // emoji
};

const TOP: Country[] = [
  { iso2: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { iso2: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { iso2: "CR", name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { iso2: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { iso2: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { iso2: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { iso2: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { iso2: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { iso2: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { iso2: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { iso2: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { iso2: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { iso2: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { iso2: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { iso2: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
];

const REST: Country[] = [
  { iso2: "AT", name: "Austria", dial: "+43", flag: "🇦🇹" },
  { iso2: "BE", name: "Belgium", dial: "+32", flag: "🇧🇪" },
  { iso2: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { iso2: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { iso2: "CZ", name: "Czechia", dial: "+420", flag: "🇨🇿" },
  { iso2: "DK", name: "Denmark", dial: "+45", flag: "🇩🇰" },
  { iso2: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { iso2: "FI", name: "Finland", dial: "+358", flag: "🇫🇮" },
  { iso2: "GR", name: "Greece", dial: "+30", flag: "🇬🇷" },
  { iso2: "GT", name: "Guatemala", dial: "+502", flag: "🇬🇹" },
  { iso2: "HK", name: "Hong Kong", dial: "+852", flag: "🇭🇰" },
  { iso2: "HN", name: "Honduras", dial: "+504", flag: "🇭🇳" },
  { iso2: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { iso2: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
  { iso2: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { iso2: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { iso2: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { iso2: "NI", name: "Nicaragua", dial: "+505", flag: "🇳🇮" },
  { iso2: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
  { iso2: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { iso2: "PA", name: "Panama", dial: "+507", flag: "🇵🇦" },
  { iso2: "PE", name: "Peru", dial: "+51", flag: "🇵🇪" },
  { iso2: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
  { iso2: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { iso2: "RU", name: "Russia", dial: "+7", flag: "🇷🇺" },
  { iso2: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { iso2: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { iso2: "SV", name: "El Salvador", dial: "+503", flag: "🇸🇻" },
  { iso2: "TR", name: "Turkey", dial: "+90", flag: "🇹🇷" },
  { iso2: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { iso2: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
  { iso2: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
];

export const COUNTRY_CODES: Country[] = [...TOP, ...REST.sort((a, b) => a.name.localeCompare(b.name))];

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]; // US
