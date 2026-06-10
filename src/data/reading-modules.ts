import waterCycle from "@/assets/reading-water-cycle.png.asset.json";
import seaLevel from "@/assets/reading-sea-level.png.asset.json";

export type ReadingQuestion = {
  t: "mcq" | "tfn" | "match" | "fill";
  q: string;
  opts?: string[];
  answer: string;
};

export type ReadingModule = {
  title: string;
  topic: string;
  test: string;
  passage: string;
  image?: { url: string; caption?: string };
  questions: ReadingQuestion[];
};

export const READING_MODULES: ReadingModule[] = [
  {
    test: "Practice Test 1",
    title: "Forests and Climate Regulation",
    topic: "Environment",
    image: { url: waterCycle.url, caption: "Simplified water cycle diagram." },
    passage:
`Forests cover roughly 30% of Earth's land and are crucial to climate stability and ecosystem health. They harbor a vast array of biodiversity and deliver essential products (timber, medicines) to people. Crucially, forests absorb carbon dioxide as they grow, acting as a carbon storage "bank" that helps offset fossil fuel emissions. If trees are cut or burned, this stored carbon is released back into the atmosphere, exacerbating the greenhouse effect.

Forests also influence the water cycle. Through transpiration, trees move vast amounts of water from soil to air: for example, a single oak tree can transpire up to 1,600 litres of water per day. In Europe, forest evapotranspiration equals roughly half of annual rainfall. In fact, forest canopies produce condensation nuclei and create "flying rivers" of moisture that sustain rainfall far inland.

Human activities threaten these benefits. Deforestation and conversion of forests to farms or settlements release nearly all of the stored carbon. Climate change increases droughts, fires, and insect outbreaks, weakening forests and reducing their ability to supply water and sequester carbon. Protecting and restoring forests is therefore a key strategy for climate mitigation and water management. Intact forests continue to supply clean air and water, regulate climate, and provide habitat for wildlife.`,
    questions: [
      { t: "tfn", q: "Forests can act as a sink for carbon dioxide.", opts: ["True", "False", "Not Given"], answer: "True" },
      { t: "tfn", q: "A single tree can transpire more than 1000 litres of water per day.", opts: ["True", "False", "Not Given"], answer: "True" },
      { t: "tfn", q: "Forests currently cover about 50% of the Earth's land area.", opts: ["True", "False", "Not Given"], answer: "False" },
      { t: "tfn", q: "Converting forests to agriculture releases carbon stored in trees.", opts: ["True", "False", "Not Given"], answer: "True" },
      { t: "match", q: "Match paragraphs A–C with headings: A. Forests and the Global Carbon Bank, B. Forests and the Global Water Cycle, C. Threats to Forests and Climate.", answer: "A–A; B–B; C–C" },
      { t: "fill", q: "Forests absorb CO₂ as they grow, acting as a carbon storage \"____\" that offsets emissions.", answer: "bank" },
      { t: "fill", q: "Trees have deeper _____ than other plants, allowing them to pump large volumes of water.", answer: "roots" },
      { t: "fill", q: "Look at the water cycle diagram. What process is labeled at point A?", answer: "Evaporation" },
    ],
  },
  {
    test: "Practice Test 1",
    title: "Endangered Languages and Culture",
    topic: "Society & Culture",
    passage:
`Around 6,000–7,000 distinct languages are spoken worldwide today. Many of these are at risk: currently about 41% of the world's languages are considered endangered (no longer being learned by children). Speakers often shift to dominant or economically powerful languages, and factors such as globalization, migration, and cultural changes accelerate this loss. Linguists estimate that between 50% and 90% of these languages could be severely endangered or extinct by the end of the 21st century.

Efforts to preserve languages focus on education and community support. UNESCO reports that two-fifths of the world's population cannot access education in a language they understand (their mother tongue). Mother-tongue-based multilingual education and cultural programs are therefore promoted. For example, UNESCO highlights that indigenous languages can be kept alive through bilingual schooling and community initiatives, which also "promote peaceful dialogue" between groups.

Some endangered cross-border languages (e.g. Kiswahili, Quechua) thrive in communities where they remain in everyday use. Globally, many countries have enacted laws and policies to protect minority and indigenous languages, recognizing the importance of preserving this cultural heritage.`,
    questions: [
      { t: "mcq", q: "What percentage of the world's languages are currently endangered?", opts: ["20%", "41%", "60%", "79%"], answer: "41%" },
      { t: "mcq", q: "By 2100, linguists predict that about what proportion of languages may become extinct?", opts: ["10–20%", "30–50%", "50–90%", "90–100%"], answer: "50–90%" },
      { t: "mcq", q: "According to UNESCO, what percentage of people lack education in their native language?", opts: ["20%", "30%", "40%", "50%"], answer: "40%" },
      { t: "mcq", q: "Which approach does UNESCO encourage to help preserve endangered languages?", opts: ["Teaching only international languages", "Mother-tongue-based multilingual education", "Requiring minority children to attend boarding schools", "Using only digital media"], answer: "Mother-tongue-based multilingual education" },
      { t: "match", q: "Match paragraphs with: A. Scale of Language Diversity, B. Causes of Language Loss, C. Preservation Efforts.", answer: "1–A; 2–B; 3–C" },
      { t: "fill", q: "By 2100, linguists estimate ___ to ___% of today's languages will be extinct.", answer: "50, 90" },
      { t: "fill", q: "About ___% of the world's approximately 7,000 languages are endangered.", answer: "41" },
    ],
  },
  {
    test: "Practice Test 1",
    title: "Industrial Robotics",
    topic: "Technology",
    passage:
`The field of industrial robotics has grown rapidly in recent years. Industrial robots are programmable machines used in factories and manufacturing plants, where they perform repetitive or precise tasks such as assembly, welding, painting, packaging, and material handling. These robots increase production speed, ensure consistent quality, and reduce operational costs, often working alongside human operators in automotive, electronics, and other industries.

According to market analysis, the global industrial robotics market was valued at about US$87.1 billion in 2024 and is projected to reach US$162.7 billion by 2030, growing at about 11% per year. This growth is driven by expanding manufacturing, rising labor costs, and advances in technology. Innovations in AI, machine learning and sensor technologies are making robots smarter and more autonomous. For example, modern robots can learn new tasks, adapt to changing conditions, and operate safely around humans.

Industrial robots can also enhance workplace safety. They can perform hazardous or physically demanding tasks, reducing injuries and fatigue for human workers. In industries like metalworking, chemicals and heavy machinery, robots handle dangerous materials and extreme environments. Government initiatives that fund advanced manufacturing and promote automation further support this trend.`,
    questions: [
      { t: "mcq", q: "What is NOT listed as a primary task of industrial robots?", opts: ["Assembly in factories", "Medical surgery procedures", "Welding and painting", "Packaging and material handling"], answer: "Medical surgery procedures" },
      { t: "tfn", q: "By 2030, the industrial robotics market is expected to be worth over US$160 billion.", opts: ["True", "False", "Not Given"], answer: "True" },
      { t: "fill", q: "In 2024 the global industrial robotics market was valued at US$___ billion.", answer: "87.1" },
      { t: "fill", q: "By 2030 it is projected to reach US$___ billion.", answer: "162.7" },
      { t: "fill", q: "Robots help ensure consistent product ____ and reduce operational ____.", answer: "quality, costs" },
      { t: "mcq", q: "Which factor is mentioned as driving the growth of the robotics market?", opts: ["Higher manual labor wages", "Increased investment in automation", "Declining global manufacturing output", "Government bans on robot use"], answer: "Increased investment in automation" },
    ],
  },
  {
    test: "Practice Test 2",
    title: "Climate Change Indicators",
    topic: "Environment",
    image: { url: seaLevel.url, caption: "NASA satellite record of global sea-level rise (1993–2024)." },
    passage:
`Global sea levels have been rising over the past decades, driven by both melting ice and the thermal expansion of oceans. In 2024, NASA analysis found a faster-than-expected rise of 0.59 cm in global mean sea level. This was higher than the forecast of 0.43 cm/year, largely because 2024 was the warmest year on record. Normally, about two-thirds of sea-level rise comes from meltwater (glaciers and ice sheets) and one-third from thermal expansion, but that pattern flipped in 2024: two-thirds of the rise was due to ocean warming (thermal expansion), and only one-third from meltwater. Satellite measurements show an overall sea level increase of about 10.1 cm by 2024, and the rate of rise has more than doubled since 1993.

Another key climate indicator is atmospheric carbon dioxide. Continuous CO₂ monitoring at Mauna Loa Observatory (Hawaii) began with C. D. Keeling's measurements in March 1958. NOAA reports that in June 2025 the CO₂ concentration averaged 429.61 ppm (up from 426.91 ppm in June 2024). Each monthly mean CO₂ value is based on daily averages, which in turn are based on hourly measurements under 'background' conditions.`,
    questions: [
      { t: "mcq", q: "The unexpectedly high global sea-level rise in 2024 was mainly caused by:", opts: ["Increased melting of Greenland ice", "Warmer ocean waters expanding", "A series of storms", "Coastal subsidence"], answer: "Warmer ocean waters expanding" },
      { t: "fill", q: "In 2024, two-thirds of sea-level rise was due to ______ and one-third to meltwater.", answer: "thermal expansion" },
      { t: "fill", q: "Each monthly CO₂ mean at Mauna Loa is based on daily means, which are based on ______ averages.", answer: "hourly" },
      { t: "fill", q: "The continuous record of CO₂ at Mauna Loa began in March 19__.", answer: "58" },
      { t: "fill", q: "In June 2025, NOAA reported a CO₂ concentration of ___ ppm.", answer: "429.61" },
      { t: "tfn", q: "Ocean thermal expansion was responsible for most of the 2024 sea-level rise.", opts: ["True", "False", "Not Given"], answer: "True" },
      { t: "tfn", q: "Satellite records of sea level extend back to before 1990.", opts: ["True", "False", "Not Given"], answer: "False" },
      { t: "tfn", q: "C. David Keeling took the first CO₂ measurements at Mauna Loa.", opts: ["True", "False", "Not Given"], answer: "True" },
      { t: "tfn", q: "Global sea level has risen by about 10 cm since 1993.", opts: ["True", "False", "Not Given"], answer: "True" },
    ],
  },
  {
    test: "Practice Test 2",
    title: "Cultural Heritage and Repatriation",
    topic: "History & Culture",
    passage:
`The British Museum has faced calls to return some of its treasures to their countries of origin. Recent research by historian Justin M. Jacobs reveals that many Chinese antiquities in Western museums were not taken by force or imperial plunder. Instead, Jacobs found documents showing that Chinese officials often cooperated fully with foreign archaeologists and collectors. For example, he discovered letters and recollections indicating Chinese authorities believed helping Western scholars (such as the explorer Aurel Stein) would sweeten diplomatic relations with Britain. One 1914 letter even praised Stein's "stunning perseverance" in excavation. Jacobs argues that, in that era, Chinese leaders viewed gifting antiquities to foreign museums as a form of "diplomatic gift" or exchange. He suggests modern outrage is partly a projection of today's values onto the past.

Jacobs does make clear distinctions: he acknowledges that some items (e.g. the Benin Bronzes taken during the 1897 British expedition) were outright wartime plunder and merit restitution. But he cautions that not every museum piece was acquired this way. In one key example, he cites a painted Chinese panel (7th–8th century) of the silk-making legend, now in the British Museum, which Chinese officials knew Stein was removing at the time. A Chinese magistrate's note to Stein in 1914 praised the scientific value of his work, undermining the idea that all such excavations were exploitative. Jacobs concludes that understanding historical context is crucial.`,
    questions: [
      { t: "mcq", q: "According to Jacobs, Chinese authorities most often viewed the removal of antiquities by foreign museums as:", opts: ["Coerced plunder", "A way to build diplomatic goodwill", "An unavoidable loss of heritage", "Purely financial transactions"], answer: "A way to build diplomatic goodwill" },
      { t: "fill", q: "Chinese antiquities in the British Museum were frequently acquired with the full ________ of Chinese officials.", answer: "cooperation" },
      { t: "fill", q: "Jacobs suggests present-day outrage results from projecting contemporary values ________ in time.", answer: "backward" },
      { t: "fill", q: "Jacobs describes the sharing of artifacts as an altruistic and ________ display of scientific endeavour.", answer: "altruistic" },
      { t: "fill", q: "A 1914 letter commended Aurel Stein's \"stunning ________\" in archaeological work.", answer: "perseverance" },
      { t: "tfn", q: "Jacobs found evidence that Chinese officials actively helped remove treasures to please Western scholars.", opts: ["True", "False", "Not Given"], answer: "True" },
      { t: "tfn", q: "Jacobs concludes that all artefacts in Western museums were acquired by imperialist plunder.", opts: ["True", "False", "Not Given"], answer: "False" },
      { t: "tfn", q: "Jacobs believes the Benin Bronzes were taken as military loot and deserve restitution.", opts: ["True", "False", "Not Given"], answer: "True" },
      { t: "tfn", q: "An archival letter praised Stein's perseverance and thoroughness in archaeology.", opts: ["True", "False", "Not Given"], answer: "True" },
    ],
  },
];
