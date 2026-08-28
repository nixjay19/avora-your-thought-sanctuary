import type { CookingEffort, FoodPreferences } from "../data/types";

/**
 * Curated local meal library. Suggestions are free to operate — AI is only an
 * optional "surprise me" the person taps on purpose.
 *
 * No calories, no macros, no portions-as-targets. Just warm ideas.
 */

export type Meal = {
  id: string;
  name: string;
  /** A short, gentle description. */
  note: string;
  effort: CookingEffort;
  ingredients: string[];
  times: ("morning" | "midday" | "evening" | "anytime")[];
  warmth: "cool" | "warm" | "hot";
};

const effortOrder: CookingEffort[] = ["none", "minimal", "some", "happy-to-cook"];

export const meals: Meal[] = [
  {
    id: "toast-honey-ricotta",
    name: "Honey ricotta toast",
    note: "Thick toast, soft cheese, a drizzle of honey.",
    effort: "none",
    ingredients: ["bread", "ricotta", "honey"],
    times: ["morning", "anytime"],
    warmth: "warm",
  },
  {
    id: "banana-oat-bowl",
    name: "Banana oat bowl",
    note: "Oats softened in warm milk with sliced banana.",
    effort: "minimal",
    ingredients: ["oats", "banana", "milk", "cinnamon"],
    times: ["morning"],
    warmth: "warm",
  },
  {
    id: "yoghurt-berries",
    name: "Yoghurt and berries",
    note: "Cold, simple, ready in a moment.",
    effort: "none",
    ingredients: ["yoghurt", "berries", "honey"],
    times: ["morning", "anytime"],
    warmth: "cool",
  },
  {
    id: "scrambled-eggs-herbs",
    name: "Soft scrambled eggs",
    note: "Low heat, stirred slowly, finished with herbs.",
    effort: "minimal",
    ingredients: ["eggs", "butter", "herbs", "bread"],
    times: ["morning", "midday"],
    warmth: "hot",
  },
  {
    id: "peanut-apple",
    name: "Apple and peanut butter",
    note: "Sliced apple, a spoon of peanut butter.",
    effort: "none",
    ingredients: ["apple", "peanut butter"],
    times: ["anytime"],
    warmth: "cool",
  },
  {
    id: "cheese-crackers-grapes",
    name: "Cheese, crackers, grapes",
    note: "A small plate that asks nothing of you.",
    effort: "none",
    ingredients: ["cheese", "crackers", "grapes"],
    times: ["midday", "anytime"],
    warmth: "cool",
  },
  {
    id: "tomato-soup-toast",
    name: "Tomato soup with toast",
    note: "Warm bowl, buttered toast for dipping.",
    effort: "minimal",
    ingredients: ["tomato", "soup", "bread", "butter"],
    times: ["midday", "evening"],
    warmth: "hot",
  },
  {
    id: "hummus-plate",
    name: "Hummus plate",
    note: "Hummus, cucumber, olives, warm flatbread.",
    effort: "none",
    ingredients: ["hummus", "cucumber", "olives", "flatbread"],
    times: ["midday", "anytime"],
    warmth: "cool",
  },
  {
    id: "rice-egg-soy",
    name: "Rice with a fried egg",
    note: "Warm rice, crisp-edged egg, a little soy.",
    effort: "minimal",
    ingredients: ["rice", "eggs", "soy sauce", "spring onion"],
    times: ["midday", "evening"],
    warmth: "hot",
  },
  {
    id: "pasta-garlic-oil",
    name: "Garlic and oil pasta",
    note: "Pasta, good olive oil, slow-golden garlic.",
    effort: "minimal",
    ingredients: ["pasta", "garlic", "olive oil", "parmesan"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "tuna-mayo-sandwich",
    name: "Tuna sandwich",
    note: "Soft bread, tuna, a spoon of mayo.",
    effort: "none",
    ingredients: ["bread", "tuna", "mayonnaise"],
    times: ["midday"],
    warmth: "cool",
  },
  {
    id: "miso-noodles",
    name: "Miso noodle bowl",
    note: "Hot broth, noodles, whatever greens you have.",
    effort: "minimal",
    ingredients: ["noodles", "miso", "greens", "sesame"],
    times: ["midday", "evening"],
    warmth: "hot",
  },
  {
    id: "baked-potato",
    name: "Baked potato",
    note: "Oven does the work. Butter, cheese, done.",
    effort: "minimal",
    ingredients: ["potato", "butter", "cheese"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "chickpea-tomato-stew",
    name: "Chickpea and tomato stew",
    note: "One pot, gentle simmer, plenty left over.",
    effort: "some",
    ingredients: ["chickpeas", "tomato", "onion", "garlic", "cumin"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "roast-veg-tray",
    name: "Roast vegetable tray",
    note: "Whatever's in the drawer, oil, salt, hot oven.",
    effort: "some",
    ingredients: ["carrot", "potato", "onion", "olive oil"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "omelette-cheese",
    name: "Cheese omelette",
    note: "Three eggs, a handful of cheese, folded over.",
    effort: "minimal",
    ingredients: ["eggs", "cheese", "butter"],
    times: ["midday", "evening"],
    warmth: "hot",
  },
  {
    id: "avocado-toast-chilli",
    name: "Avocado toast",
    note: "Mashed avocado, lemon, a pinch of chilli.",
    effort: "minimal",
    ingredients: ["bread", "avocado", "lemon", "chilli"],
    times: ["morning", "midday"],
    warmth: "warm",
  },
  {
    id: "lentil-soup",
    name: "Lentil soup",
    note: "Soft lentils, carrot, a long quiet simmer.",
    effort: "some",
    ingredients: ["lentils", "carrot", "onion", "stock"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "quesadilla",
    name: "Cheese quesadilla",
    note: "Tortilla, cheese, pan until golden.",
    effort: "minimal",
    ingredients: ["tortilla", "cheese", "beans"],
    times: ["midday", "evening"],
    warmth: "hot",
  },
  {
    id: "smoothie-oat",
    name: "Oat and berry smoothie",
    note: "For when chewing feels like too much.",
    effort: "minimal",
    ingredients: ["oats", "berries", "milk", "banana"],
    times: ["morning", "anytime"],
    warmth: "cool",
  },
  {
    id: "congee",
    name: "Simple rice congee",
    note: "Rice cooked soft in lots of water. Very kind.",
    effort: "some",
    ingredients: ["rice", "stock", "ginger", "spring onion"],
    times: ["morning", "evening"],
    warmth: "hot",
  },
  {
    id: "salmon-rice-cucumber",
    name: "Salmon, rice, cucumber",
    note: "Pan-seared salmon over warm rice.",
    effort: "some",
    ingredients: ["salmon", "rice", "cucumber", "soy sauce"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "greek-salad-bread",
    name: "Greek salad with bread",
    note: "Tomato, cucumber, feta, olives, good bread.",
    effort: "minimal",
    ingredients: ["tomato", "cucumber", "feta", "olives", "bread"],
    times: ["midday"],
    warmth: "cool",
  },
  {
    id: "porridge-jam",
    name: "Porridge with jam",
    note: "A warm spoonful of morning.",
    effort: "minimal",
    ingredients: ["oats", "milk", "jam"],
    times: ["morning"],
    warmth: "hot",
  },
  {
    id: "stir-fry-noodles",
    name: "Quick vegetable stir fry",
    note: "High heat, a few minutes, whatever's crisp.",
    effort: "some",
    ingredients: ["noodles", "pepper", "broccoli", "soy sauce", "garlic"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "beans-toast",
    name: "Beans on toast",
    note: "Old faithful. No notes.",
    effort: "none",
    ingredients: ["beans", "bread", "butter"],
    times: ["anytime"],
    warmth: "hot",
  },
  {
    id: "shakshuka",
    name: "Shakshuka",
    note: "Eggs poached in spiced tomato, bread alongside.",
    effort: "happy-to-cook",
    ingredients: ["eggs", "tomato", "pepper", "onion", "paprika", "bread"],
    times: ["morning", "evening"],
    warmth: "hot",
  },
  {
    id: "risotto-lemon",
    name: "Lemon risotto",
    note: "Slow stirring, if stirring sounds nice today.",
    effort: "happy-to-cook",
    ingredients: ["rice", "stock", "lemon", "parmesan", "butter"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "dal-rice",
    name: "Dal with rice",
    note: "Soft lentils, turmeric, a spoonful of ghee.",
    effort: "some",
    ingredients: ["lentils", "rice", "turmeric", "ghee", "onion"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "chicken-soup",
    name: "Chicken and noodle soup",
    note: "The kind that helps just by existing.",
    effort: "happy-to-cook",
    ingredients: ["chicken", "noodles", "carrot", "stock", "celery"],
    times: ["evening"],
    warmth: "hot",
  },
  {
    id: "fruit-nuts",
    name: "Fruit and a handful of nuts",
    note: "Something is better than nothing, always.",
    effort: "none",
    ingredients: ["fruit", "nuts"],
    times: ["anytime"],
    warmth: "cool",
  },
  {
    id: "cheese-omelette-wrap",
    name: "Egg wrap",
    note: "Egg cooked flat, rolled into a tortilla.",
    effort: "minimal",
    ingredients: ["eggs", "tortilla", "cheese", "spinach"],
    times: ["midday"],
    warmth: "hot",
  },
];

export function timeOfDay(date = new Date()): "morning" | "midday" | "evening" {
  const hour = date.getHours();
  if (hour < 11) return "morning";
  if (hour < 16) return "midday";
  return "evening";
}

function excluded(meal: Meal, food: FoodPreferences) {
  const blocked = [...food.avoid, ...food.dontEat]
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (blocked.length === 0) return false;
  const haystack = [meal.name, ...meal.ingredients].join(" ").toLowerCase();
  return blocked.some((entry) => haystack.includes(entry));
}

function score(meal: Meal, food: FoodPreferences, slot: string) {
  let value = 0;
  if (meal.times.includes(slot as Meal["times"][number])) value += 3;
  if (meal.times.includes("anytime")) value += 1;

  const liked = food.likes.map((entry) => entry.trim().toLowerCase()).filter(Boolean);
  const haystack = [meal.name, ...meal.ingredients].join(" ").toLowerCase();
  value += liked.filter((entry) => haystack.includes(entry)).length * 2;

  const wanted = effortOrder.indexOf(food.effort);
  const has = effortOrder.indexOf(meal.effort);
  if (has <= wanted) value += 2 - (wanted - has) * 0.4;
  else value -= (has - wanted) * 2;

  return value;
}

/** Deterministic-ish suggestions: preference-filtered, gently shuffled. */
export function suggestMeals(
  food: FoodPreferences,
  { count = 3, at = new Date() }: { count?: number; at?: Date } = {},
): Meal[] {
  const slot = timeOfDay(at);
  const candidates = meals
    .filter((meal) => !excluded(meal, food))
    .map((meal) => ({ meal, value: score(meal, food, slot) + Math.random() * 1.6 }))
    .sort((a, b) => b.value - a.value)
    .map((entry) => entry.meal);

  if (candidates.length === 0) return meals.slice(0, count);
  return candidates.slice(0, count);
}

export const effortLabel: Record<CookingEffort, string> = {
  none: "no cooking",
  minimal: "barely cooking",
  some: "a little cooking",
  "happy-to-cook": "happy to cook",
};
