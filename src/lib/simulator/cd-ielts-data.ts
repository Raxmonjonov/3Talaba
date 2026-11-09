export type QuestionType = "TFNG" | "MCQ" | "GAP_FILL";

export interface SimulatorQuestion {
  number: number; // 1 to 40
  passageId: "passage-1" | "passage-2" | "passage-3";
  groupTitle: string;
  groupInstruction: string;
  type: QuestionType;
  prompt: string;
  options?: Array<{ key: string; label: string }>;
  correctAnswer: string;
}

export interface ReadingPassageData {
  id: "passage-1" | "passage-2" | "passage-3";
  title: string;
  subtitle: string;
  questionRange: [number, number];
  paragraphs: Array<{ label: string; text: string }>;
}

export const CD_IELTS_PASSAGES: ReadingPassageData[] = [
  {
    id: "passage-1",
    title: "READING PASSAGE 1: Neuroplasticity and the Adult Cerebral Cortex",
    subtitle:
      "You should spend about 20 minutes on Questions 1–13, which are based on Reading Passage 1 below.",
    questionRange: [1, 13],
    paragraphs: [
      {
        label: "A",
        text: "For much of the twentieth century, prevailing neurobiological orthodoxy maintained that the adult human brain was anatomically immutable—a rigid organ incapable of generating new neurons once developmental maturation concluded in late adolescence. While baseline synaptic malleability does decline after early adulthood, high-resolution functional magnetic resonance imaging (fMRI) has decisively overturned the doctrine of permanent structural stasis. Adult neurogenesis continues within the subgranular zone of the hippocampal dentate gyrus, supporting spatial navigation and episodic memory consolidation.",
      },
      {
        label: "B",
        text: "During early childhood, the cerebral cortex experiences an exuberant phase of synaptogenesis in which neurons establish millions of provisional pathways. To maximize metabolic and computational efficiency, the developing brain subsequently executes a selective elimination process termed synaptic pruning. Rather than indicating pathological deterioration, this targeted removal of redundant connections reinforces frequently recruited neural circuits while dismantling dormant pathways.",
      },
      {
        label: "C",
        text: "Environmental enrichment and sustained aerobic activity exert remarkable influence over adult cortical remodeling. Controlled longitudinal trials demonstrate that four weeks of structured cardiovascular conditioning elevates circulating Brain-Derived Neurotrophic Factor (BDNF), a key protein catalyst that accelerates dendritic spine proliferation. Furthermore, lifelong bilinguals display significantly higher grey-matter density in the left inferior parietal cortex than monolingual peers, reflecting the continuous executive control required to arbitrate between two active linguistic systems.",
      },
      {
        label: "D",
        text: "Circadian sleep architecture plays an equally indispensable role in stabilizing newly encoded neural representations. Across slow-wave non-REM sleep and subsequent rapid-eye-movement (REM) intervals, synchronized hippocampal-neocortical oscillations replay waking experiences at compressed temporal speeds. This nocturnal replay transfers fragile short-term synaptic traces into resilient, distributed neocortical storage networks.",
      },
    ],
  },
  {
    id: "passage-2",
    title: "READING PASSAGE 2: Autonomous Maritime Desalination & Brine Valorization",
    subtitle:
      "You should spend about 20 minutes on Questions 14–26, which are based on Reading Passage 2 below.",
    questionRange: [14, 26],
    paragraphs: [
      {
        label: "A",
        text: "As arid coastal megacities confront acute freshwater deficits, reverse-osmosis (RO) desalination has expanded into a cornerstone of municipal water security. Conventional onshore desalination plants, however, consume roughly 3.5 kilowatt-hours of electrical energy per cubic meter of potable water and discharge hyper-saline brine effluent directly onto fragile benthic ecosystems, depleting dissolved oxygen across coastal continental shelves.",
      },
      {
        label: "B",
        text: "Recent advances in offshore wave-driven desalination barges seek to decouple freshwater production from fossil-fueled power grids. By coupling hydraulic Pelton turbines directly to oscillating wave-surge flaps, autonomous offshore platforms pressurize seawater to 65 bar without intermediate electrical conversion losses. Field deployments off Western Australia achieved a 38 percent reduction in lifecycle carbon intensity compared with grid-connected coastal plants.",
      },
      {
        label: "C",
        text: "Simultaneously, chemical engineers have pioneered zero-liquid-discharge (ZLD) electrodialysis cascades that transform concentrated brine from an ecological liability into a strategic mineral feedstock. Selective membrane crystallization recovers battery-grade lithium carbonate, magnesium hydroxide, and industrial sodium hydroxide from reject streams, generating secondary revenue that offsets up to 27 percent of membrane replacement expenditures.",
      },
    ],
  },
  {
    id: "passage-3",
    title: "READING PASSAGE 3: Algorithmic Price Signaling in Digital Marketplaces",
    subtitle:
      "You should spend about 20 minutes on Questions 27–40, which are based on Reading Passage 3 below.",
    questionRange: [27, 40],
    paragraphs: [
      {
        label: "A",
        text: "In classical microeconomic theory, tacit collusion among oligopolistic competitors breaks down when market participants exceed three or four firms, because monitoring secret price deviations becomes prohibitively costly. The proliferation of reinforcement-learning pricing algorithms across e-commerce platforms has fundamentally challenged this assumption. Autonomous Q-learning agents observe rival price adjustments in milliseconds, punishing defections instantaneously without explicit human communication.",
      },
      {
        label: "B",
        text: "Empirical simulations conducted by computational economists reveal that when two or more deep-reinforcement pricing models interact repeatedly, they converge toward supra-competitive price equilibria even when programmed solely to maximize individual firm profit. Because neither algorithm contains an instruction to collude, traditional antitrust statutes—which require proof of an explicit agreement or concerted communication—struggle to prosecute algorithmic parallel pricing.",
      },
      {
        label: "C",
        text: "To counter synthetic price inflation, regulatory agencies have proposed mandatory algorithmic auditing sandboxes and stochastic price-latency buffers. By forcing dominant digital platforms to introduce randomized intervals between automated price updates, policymakers can disrupt the high-frequency retaliation loops that sustain supra-competitive margins while preserving dynamic inventory clearing.",
      },
    ],
  },
];

export const CD_IELTS_40_QUESTIONS: SimulatorQuestion[] = [
  // ================= PASSAGE 1 (Questions 1 - 13) =================
  {
    number: 1,
    passageId: "passage-1",
    groupTitle: "Questions 1–7 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 1? Choose TRUE, FALSE, or NOT GIVEN.",
    type: "TFNG",
    prompt:
      "Twentieth-century neurobiologists initially believed that the adult human brain could not produce new neurons after adolescence.",
    correctAnswer: "TRUE",
  },
  {
    number: 2,
    passageId: "passage-1",
    groupTitle: "Questions 1–7 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 1?",
    type: "TFNG",
    prompt:
      "Modern fMRI scans prove that baseline synaptic malleability increases steadily after the age of forty.",
    correctAnswer: "FALSE",
  },
  {
    number: 3,
    passageId: "passage-1",
    groupTitle: "Questions 1–7 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 1?",
    type: "TFNG",
    prompt:
      "Synaptic pruning in childhood is a symptom of neurological disease and cognitive decline.",
    correctAnswer: "FALSE",
  },
  {
    number: 4,
    passageId: "passage-1",
    groupTitle: "Questions 1–7 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 1?",
    type: "TFNG",
    prompt:
      "Four weeks of structured aerobic exercise can increase circulating levels of BDNF.",
    correctAnswer: "TRUE",
  },
  {
    number: 5,
    passageId: "passage-1",
    groupTitle: "Questions 1–7 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 1?",
    type: "TFNG",
    prompt:
      "Bilingual speakers learn third and fourth languages twice as fast as monolingual speakers.",
    correctAnswer: "NOT GIVEN",
  },
  {
    number: 6,
    passageId: "passage-1",
    groupTitle: "Questions 1–7 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 1?",
    type: "TFNG",
    prompt:
      "Hippocampal-neocortical replay during sleep occurs at a faster speed than the original daytime experience.",
    correctAnswer: "TRUE",
  },
  {
    number: 7,
    passageId: "passage-1",
    groupTitle: "Questions 1–7 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 1?",
    type: "TFNG",
    prompt:
      "Dietary omega-3 supplementation is more effective than sleep for memory consolidation.",
    correctAnswer: "NOT GIVEN",
  },
  {
    number: 8,
    passageId: "passage-1",
    groupTitle: "Questions 8–10 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "According to Paragraph A, adult neurogenesis has been confirmed to occur within the:",
    options: [
      { key: "A", label: "Prefrontal motor cortex" },
      { key: "B", label: "Subgranular zone of the hippocampal dentate gyrus" },
      { key: "C", label: "Occipital visual lobe" },
      { key: "D", label: "Brainstem medulla" },
    ],
    correctAnswer: "B",
  },
  {
    number: 9,
    passageId: "passage-1",
    groupTitle: "Questions 8–10 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "What is the primary biological purpose of synaptic pruning described in Paragraph B?",
    options: [
      { key: "A", label: "To eliminate all childhood memories before adulthood" },
      { key: "B", label: "To halt metabolic energy consumption in the hippocampus" },
      {
        key: "C",
        label:
          "To optimize computational efficiency by strengthening active circuits and removing dormant ones",
      },
      { key: "D", label: "To replace grey matter with cerebrospinal fluid" },
    ],
    correctAnswer: "C",
  },
  {
    number: 10,
    passageId: "passage-1",
    groupTitle: "Questions 8–10 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "Why do lifelong bilinguals exhibit denser grey matter in the left inferior parietal cortex?",
    options: [
      { key: "A", label: "Because they sleep longer than monolinguals" },
      {
        key: "B",
        label:
          "Due to continuous executive control needed to manage two active language systems",
      },
      { key: "C", label: "Because bilingualism prevents synaptic pruning" },
      { key: "D", label: "Due to higher baseline blood pressure" },
    ],
    correctAnswer: "B",
  },
  {
    number: 11,
    passageId: "passage-1",
    groupTitle: "Questions 11–13 • Sentence Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Complete the sentences below. Write NO MORE THAN TWO WORDS from Reading Passage 1 for each answer.",
    type: "GAP_FILL",
    prompt:
      "The selective removal of redundant neural connections during development is known as ________.",
    correctAnswer: "synaptic pruning",
  },
  {
    number: 12,
    passageId: "passage-1",
    groupTitle: "Questions 11–13 • Sentence Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Write NO MORE THAN TWO WORDS from Reading Passage 1 for each answer.",
    type: "GAP_FILL",
    prompt:
      "Cardiovascular conditioning increases circulating ________, which acts as a catalyst for dendritic spine growth.",
    correctAnswer: "BDNF",
  },
  {
    number: 13,
    passageId: "passage-1",
    groupTitle: "Questions 11–13 • Sentence Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Write NO MORE THAN TWO WORDS from Reading Passage 1 for each answer.",
    type: "GAP_FILL",
    prompt:
      "During sleep, fragile short-term traces are transferred into durable ________ storage networks.",
    correctAnswer: "neocortical",
  },

  // ================= PASSAGE 2 (Questions 14 - 26) =================
  {
    number: 14,
    passageId: "passage-2",
    groupTitle: "Questions 14–19 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 2? Choose TRUE, FALSE, or NOT GIVEN.",
    type: "TFNG",
    prompt:
      "Conventional onshore reverse-osmosis plants discharge hyper-saline brine that can reduce dissolved oxygen in coastal waters.",
    correctAnswer: "TRUE",
  },
  {
    number: 15,
    passageId: "passage-2",
    groupTitle: "Questions 14–19 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 2?",
    type: "TFNG",
    prompt:
      "Wave-driven desalination barges convert wave motion into electricity before pressurizing seawater.",
    correctAnswer: "FALSE",
  },
  {
    number: 16,
    passageId: "passage-2",
    groupTitle: "Questions 14–19 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 2?",
    type: "TFNG",
    prompt:
      "Offshore desalination trials in Western Australia lowered lifecycle carbon intensity by 38 percent.",
    correctAnswer: "TRUE",
  },
  {
    number: 17,
    passageId: "passage-2",
    groupTitle: "Questions 14–19 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 2?",
    type: "TFNG",
    prompt:
      "Zero-liquid-discharge (ZLD) cascades can extract battery-grade lithium carbonate from reject brine.",
    correctAnswer: "TRUE",
  },
  {
    number: 18,
    passageId: "passage-2",
    groupTitle: "Questions 14–19 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 2?",
    type: "TFNG",
    prompt:
      "Mineral recovery from brine completely pays for 100 percent of desalination plant construction costs.",
    correctAnswer: "FALSE",
  },
  {
    number: 19,
    passageId: "passage-2",
    groupTitle: "Questions 14–19 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 2?",
    type: "TFNG",
    prompt:
      "Offshore desalination barges require crew rotations every two weeks.",
    correctAnswer: "NOT GIVEN",
  },
  {
    number: 20,
    passageId: "passage-2",
    groupTitle: "Questions 20–23 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "How much electrical energy do conventional onshore RO plants consume per cubic meter of potable water?",
    options: [
      { key: "A", label: "Approximately 1.2 kWh" },
      { key: "B", label: "Roughly 3.5 kWh" },
      { key: "C", label: "Exactly 27 kWh" },
      { key: "D", label: "Over 65 kWh" },
    ],
    correctAnswer: "B",
  },
  {
    number: 21,
    passageId: "passage-2",
    groupTitle: "Questions 20–23 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "What pressure level do autonomous wave-driven barges achieve using hydraulic Pelton turbines?",
    options: [
      { key: "A", label: "15 bar" },
      { key: "B", label: "27 bar" },
      { key: "C", label: "38 bar" },
      { key: "D", label: "65 bar" },
    ],
    correctAnswer: "D",
  },
  {
    number: 22,
    passageId: "passage-2",
    groupTitle: "Questions 20–23 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "Which of the following compounds is NOT mentioned as being recovered by ZLD electrodialysis cascades?",
    options: [
      { key: "A", label: "Lithium carbonate" },
      { key: "B", label: "Magnesium hydroxide" },
      { key: "C", label: "Potassium nitrate" },
      { key: "D", label: "Sodium hydroxide" },
    ],
    correctAnswer: "C",
  },
  {
    number: 23,
    passageId: "passage-2",
    groupTitle: "Questions 20–23 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "Secondary revenue from brine mineral valorization can offset up to what share of membrane replacement costs?",
    options: [
      { key: "A", label: "12 percent" },
      { key: "B", label: "27 percent" },
      { key: "C", label: "38 percent" },
      { key: "D", label: "65 percent" },
    ],
    correctAnswer: "B",
  },
  {
    number: 24,
    passageId: "passage-2",
    groupTitle: "Questions 24–26 • Summary Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Write NO MORE THAN TWO WORDS from Reading Passage 2 for each answer.",
    type: "GAP_FILL",
    prompt:
      "Conventional desalination plants discharge hyper-saline ________ directly onto fragile benthic ecosystems.",
    correctAnswer: "brine effluent",
  },
  {
    number: 25,
    passageId: "passage-2",
    groupTitle: "Questions 24–26 • Summary Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Write NO MORE THAN TWO WORDS from Reading Passage 2 for each answer.",
    type: "GAP_FILL",
    prompt:
      "Offshore platforms couple hydraulic ________ directly to oscillating wave-surge flaps.",
    correctAnswer: "Pelton turbines",
  },
  {
    number: 26,
    passageId: "passage-2",
    groupTitle: "Questions 24–26 • Summary Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Write NO MORE THAN TWO WORDS from Reading Passage 2 for each answer.",
    type: "GAP_FILL",
    prompt:
      "Selective ________ recovers battery-grade lithium carbonate from concentrated brine streams.",
    correctAnswer: "membrane crystallization",
  },

  // ================= PASSAGE 3 (Questions 27 - 40) =================
  {
    number: 27,
    passageId: "passage-3",
    groupTitle: "Questions 27–32 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 3? Choose TRUE, FALSE, or NOT GIVEN.",
    type: "TFNG",
    prompt:
      "Classical microeconomic theory predicts that tacit collusion is easier to sustain when dozens of firms compete.",
    correctAnswer: "FALSE",
  },
  {
    number: 28,
    passageId: "passage-3",
    groupTitle: "Questions 27–32 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 3?",
    type: "TFNG",
    prompt:
      "Autonomous Q-learning algorithms can detect and punish rival price cuts in milliseconds.",
    correctAnswer: "TRUE",
  },
  {
    number: 29,
    passageId: "passage-3",
    groupTitle: "Questions 27–32 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 3?",
    type: "TFNG",
    prompt:
      "Reinforcement-learning models require explicit human instructions to collude in order to reach supra-competitive prices.",
    correctAnswer: "FALSE",
  },
  {
    number: 30,
    passageId: "passage-3",
    groupTitle: "Questions 27–32 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 3?",
    type: "TFNG",
    prompt:
      "Traditional antitrust laws typically require evidence of an explicit agreement or communication between firms.",
    correctAnswer: "TRUE",
  },
  {
    number: 31,
    passageId: "passage-3",
    groupTitle: "Questions 27–32 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 3?",
    type: "TFNG",
    prompt:
      "All European e-commerce companies have already banned reinforcement-learning pricing tools.",
    correctAnswer: "NOT GIVEN",
  },
  {
    number: 32,
    passageId: "passage-3",
    groupTitle: "Questions 27–32 • True / False / Not Given",
    groupInstruction:
      "Do the following statements agree with the information given in Reading Passage 3?",
    type: "TFNG",
    prompt:
      "Stochastic price-latency buffers introduce randomized time intervals between automated price changes.",
    correctAnswer: "TRUE",
  },
  {
    number: 33,
    passageId: "passage-3",
    groupTitle: "Questions 33–36 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "Why does tacit collusion normally fail in classical markets with many competitors?",
    options: [
      { key: "A", label: "Consumers refuse to buy standardized goods" },
      {
        key: "B",
        label: "Monitoring secret price deviations becomes prohibitively costly",
      },
      { key: "C", label: "Governments set fixed retail prices" },
      { key: "D", label: "Transportation costs eliminate profit margins" },
    ],
    correctAnswer: "B",
  },
  {
    number: 34,
    passageId: "passage-3",
    groupTitle: "Questions 33–36 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "What happens in simulations when two deep-reinforcement pricing models interact repeatedly?",
    options: [
      { key: "A", label: "They drive prices down to zero marginal cost" },
      { key: "B", label: "They crash the e-commerce server" },
      {
        key: "C",
        label: "They converge toward supra-competitive price equilibria",
      },
      { key: "D", label: "They delete rival product listings" },
    ],
    correctAnswer: "C",
  },
  {
    number: 35,
    passageId: "passage-3",
    groupTitle: "Questions 33–36 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "Why do existing antitrust statutes struggle to prosecute algorithmic parallel pricing?",
    options: [
      {
        key: "A",
        label:
          "Because neither algorithm contains an explicit agreement or concerted human communication",
      },
      { key: "B", label: "Because e-commerce firms are exempt from competition law" },
      { key: "C", label: "Because prices only change once per year" },
      { key: "D", label: "Because consumers prefer higher prices" },
    ],
    correctAnswer: "A",
  },
  {
    number: 36,
    passageId: "passage-3",
    groupTitle: "Questions 33–36 • Multiple Choice",
    groupInstruction: "Choose the correct letter, A, B, C, or D.",
    type: "MCQ",
    prompt:
      "What is the purpose of introducing stochastic price-latency buffers?",
    options: [
      { key: "A", label: "To increase server electricity consumption" },
      {
        key: "B",
        label:
          "To disrupt high-frequency retaliation loops that sustain supra-competitive margins",
      },
      { key: "C", label: "To guarantee identical prices across all sellers" },
      { key: "D", label: "To eliminate online customer reviews" },
    ],
    correctAnswer: "B",
  },
  {
    number: 37,
    passageId: "passage-3",
    groupTitle: "Questions 37–40 • Sentence Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Write NO MORE THAN TWO WORDS from Reading Passage 3 for each answer.",
    type: "GAP_FILL",
    prompt:
      "Autonomous ________ agents observe competitor price changes in milliseconds.",
    correctAnswer: "Q-learning",
  },
  {
    number: 38,
    passageId: "passage-3",
    groupTitle: "Questions 37–40 • Sentence Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Write NO MORE THAN TWO WORDS from Reading Passage 3 for each answer.",
    type: "GAP_FILL",
    prompt:
      "Traditional ________ statutes require proof of an explicit agreement between competing firms.",
    correctAnswer: "antitrust",
  },
  {
    number: 39,
    passageId: "passage-3",
    groupTitle: "Questions 37–40 • Sentence Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Write NO MORE THAN TWO WORDS from Reading Passage 3 for each answer.",
    type: "GAP_FILL",
    prompt:
      "Regulators have proposed mandatory algorithmic ________ sandboxes to inspect pricing models.",
    correctAnswer: "auditing",
  },
  {
    number: 40,
    passageId: "passage-3",
    groupTitle: "Questions 37–40 • Sentence Completion (Fill-in-the-blanks)",
    groupInstruction:
      "Write NO MORE THAN TWO WORDS from Reading Passage 3 for each answer.",
    type: "GAP_FILL",
    prompt:
      "Randomized update delays disrupt retaliation loops while preserving dynamic ________ clearing.",
    correctAnswer: "inventory",
  },
];
