import electricity from "@/assets/writing-electricity.png.asset.json";

export type WritingModule = {
  set: string;
  task: "Task 1" | "Task 2";
  minutes: number;
  words: number;
  prompt: string;
  image?: { url: string; caption?: string };
  bullets?: string[];
};

export const WRITING_MODULES: WritingModule[] = [
  {
    set: "Set 1",
    task: "Task 1",
    minutes: 20,
    words: 150,
    prompt:
      "The chart below shows the percentage of total electricity production from different sources in a European country between 2005 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: { url: electricity.url, caption: "Electricity generation by source, 2005–2025." },
    bullets: [
      "Describe the overall trend in one or two sentences.",
      "Group sources sensibly (e.g. fossil vs renewables).",
      "Use accurate data and at least one comparison.",
    ],
  },
  {
    set: "Set 1",
    task: "Task 2",
    minutes: 40,
    words: 250,
    prompt:
      "In many workplaces, artificial intelligence and automation are increasingly performing tasks that were previously done by humans. Some people believe this development will lead to widespread unemployment and social instability, while others argue it will increase overall productivity and create new types of fulfilling work. Discuss both these views and give your own opinion.",
    bullets: [
      "Discuss BOTH views in separate paragraphs.",
      "Give your own opinion clearly in the introduction and conclusion.",
      "Use real examples from work, study, or current events.",
    ],
  },
  {
    set: "Set 2",
    task: "Task 1",
    minutes: 20,
    words: 150,
    prompt:
      "The charts below show the average daily expenditure of international tourists from five different countries visiting a specific city in 2018 and 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    bullets: [
      "Identify the biggest spender and the smallest in each year.",
      "Highlight changes between 2018 and 2023.",
      "Use varied comparison language (rose, fell, remained stable).",
    ],
  },
  {
    set: "Set 2",
    task: "Task 2",
    minutes: 40,
    words: 250,
    prompt:
      "In many major cities around the world, populations are growing rapidly, leading to increased demand for housing and public services. What problems can this situation cause? How can governments manage this growth effectively?",
    bullets: [
      "Address BOTH questions: problems and solutions.",
      "Give concrete examples of cities or policies.",
      "Maintain a clear paragraph for each part of the answer.",
    ],
  },
];
