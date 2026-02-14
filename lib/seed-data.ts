// ─────────────────────────────────────────────
// TRACE — Realistic Sickle Cell Seed Data
// ─────────────────────────────────────────────

import type {
  CausalChain,
  Suggestion,
  WeatherContext,
} from "./types";

// ── Demo User ────────────────────────────────

export const demoUser = {
  name: "Marcus Johnson",
  email: "marcus@demo.trace",
};

// ── Patient Profile ──────────────────────────

export const demoPatientProfile = {
  genotype: "HbSS" as const,
  hbfLevel: "12.0",
  baselineSpo2: "96.0",
};

export const demoPatient = {
  name: "Marcus Johnson",
  genotype: "HbSS",
  hbfLevel: "12.0",
  knownTriggers: ["cold weather", "dehydration", "sinus infections", "poor sleep"],
  medications: [
    { name: "Hydroxyurea", dosage: "1000mg", frequency: "daily" },
    { name: "Folic acid", dosage: "1mg", frequency: "daily" },
  ],
  specialists: [
    { type: "hematologist", name: "Dr. Abiola Okafor" },
    { type: "pulmonologist", name: "Dr. Chen Wei" },
  ],
};

// ── Helper: days ago from now ────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
  return d;
}

// ── Trace 1 ──────────────────────────────────

const trace1Chains: CausalChain[] = [
  {
    id: "chain-t1-1",
    label: "Sinus congestion reducing oxygen saturation",
    overallConfidence: 0.85,
    nodes: [
      {
        id: "t1-n1",
        type: "symptom",
        title: "Lower back tightness",
        description:
          "Dull, persistent tightness in the lumbar region, consistent with vaso-occlusive microinfarcts in vertebral bone marrow.",
        bodySystem: "musculoskeletal",
        confidence: 0.92,
        patientEvidence: "Patient reports tightness worsening over the past 2 days.",
      },
      {
        id: "t1-n2",
        type: "mechanism",
        title: "Reduced oxygen delivery from nasal congestion",
        description:
          "Nasal congestion forces mouth breathing, reducing air humidification and filtration. This lowers effective oxygen exchange in the alveoli, dropping SpO2 below the patient's 96% baseline.",
        bodySystem: "respiratory",
        confidence: 0.85,
      },
      {
        id: "t1-n3",
        type: "root-cause",
        title: "Sinus congestion triggering HbS polymerization",
        description:
          "Lowered SpO2 from sinus congestion shifts hemoglobin S into its deoxy state, promoting polymerization and sickling. Red cells become rigid and occlude small vessels in the lumbar spine.",
        bodySystem: "circulatory",
        confidence: 0.85,
      },
    ],
    connections: [
      {
        fromNodeId: "t1-n2",
        toNodeId: "t1-n1",
        mechanism:
          "Reduced SpO2 increases deoxygenated HbS, causing sickling and vaso-occlusion in vertebral marrow vasculature.",
        strength: "strong",
      },
      {
        fromNodeId: "t1-n3",
        toNodeId: "t1-n2",
        mechanism:
          "Chronic sinus congestion impairs nasal airflow, reducing oxygen exchange efficiency in the lungs.",
        strength: "strong",
      },
    ],
  },
];

const trace1Suggestions: Suggestion[] = [
  {
    text: "Discuss recurring sinus issues with your hematologist — even mild congestion can drop your SpO2 enough to trigger sickling.",
    forDoctor: false,
    urgency: "discuss",
  },
  {
    text: "Use a humidifier at night and consider saline nasal rinse to keep airways clear.",
    forDoctor: false,
    urgency: "info",
  },
  {
    text: "Monitor SpO2 with pulse oximeter. If readings drop below 93%, contact your care team.",
    forDoctor: false,
    urgency: "discuss",
  },
];

// ── Trace 2 ──────────────────────────────────

const trace2Chains: CausalChain[] = [
  {
    id: "chain-t2-1",
    label: "Cold weather triggering vasoconstriction",
    overallConfidence: 0.73,
    nodes: [
      {
        id: "t2-n1",
        type: "symptom",
        title: "Worsening back pain",
        description:
          "Escalating pain in the mid and lower back, moving from dull tightness to sharper aching over the past 5 days.",
        bodySystem: "musculoskeletal",
        confidence: 0.88,
        patientEvidence: "Patient notes pain has been building since earlier this week.",
      },
      {
        id: "t2-n2",
        type: "mechanism",
        title: "Cold-induced peripheral vasoconstriction",
        description:
          "Ambient temperature drop causes sympathetic vasoconstriction in peripheral and deep vessels. Blood flow slows through small capillaries, increasing transit time for sickle cells.",
        bodySystem: "circulatory",
        confidence: 0.75,
      },
      {
        id: "t2-n3",
        type: "root-cause",
        title: "Cold front reducing ambient temperature",
        description:
          "A cold front moved through the area this week, dropping temperatures by 15°F. Cold exposure is a well-documented trigger for vaso-occlusive crises in HbSS patients.",
        bodySystem: "circulatory",
        confidence: 0.73,
      },
    ],
    connections: [
      {
        fromNodeId: "t2-n2",
        toNodeId: "t2-n1",
        mechanism:
          "Vasoconstriction slows blood flow, increasing HbS deoxygenation and promoting vaso-occlusion in vertebral vasculature.",
        strength: "moderate",
      },
      {
        fromNodeId: "t2-n3",
        toNodeId: "t2-n2",
        mechanism:
          "Cold ambient temperatures activate sympathetic vasoconstriction response, reducing peripheral blood flow.",
        strength: "moderate",
      },
    ],
  },
];

const trace2Suggestions: Suggestion[] = [
  {
    text: "Layer up and avoid sudden cold exposure. Cold is one of your documented triggers.",
    forDoctor: false,
    urgency: "info",
  },
  {
    text: "Increase fluid intake during cold weather — vasoconstriction plus dehydration compounds sickling risk.",
    forDoctor: false,
    urgency: "info",
  },
];

// ── Trace 3 ──────────────────────────────────

const trace3Chains: CausalChain[] = [
  {
    id: "chain-t3-1",
    label: "Upper respiratory inflammation cascade",
    overallConfidence: 0.81,
    nodes: [
      {
        id: "t3-n1",
        type: "symptom",
        title: "Chest throbbing with sinus congestion",
        description:
          "Patient reports a pulsing, aching sensation in the anterior chest wall alongside significant sinus congestion and pressure.",
        bodySystem: "respiratory",
        confidence: 0.9,
        patientEvidence:
          "Sinus congestion has persisted for 3 days; chest throbbing started yesterday.",
      },
      {
        id: "t3-n2",
        type: "mechanism",
        title: "Inflammatory cytokine cascade",
        description:
          "Upper respiratory inflammation triggers release of IL-6, TNF-alpha, and other pro-inflammatory cytokines. These activate endothelial cells, increasing expression of adhesion molecules (VCAM-1, ICAM-1) that trap sickle cells.",
        bodySystem: "immune",
        confidence: 0.82,
      },
      {
        id: "t3-n3",
        type: "root-cause",
        title: "Upper respiratory inflammation driving endothelial activation",
        description:
          "Sinus infection or viral URI has triggered a systemic inflammatory response. In SCD patients, this disproportionately activates vascular endothelium, creating a pro-adhesive environment that increases vaso-occlusion risk in pulmonary vasculature.",
        bodySystem: "immune",
        confidence: 0.81,
      },
    ],
    connections: [
      {
        fromNodeId: "t3-n2",
        toNodeId: "t3-n1",
        mechanism:
          "Endothelial activation in pulmonary vessels traps sickle cells, causing chest wall ischemia and throbbing pain.",
        strength: "strong",
      },
      {
        fromNodeId: "t3-n3",
        toNodeId: "t3-n2",
        mechanism:
          "URI triggers systemic inflammatory cytokine release, activating endothelium throughout the vasculature.",
        strength: "strong",
      },
    ],
  },
];

const trace3Suggestions: Suggestion[] = [
  {
    text: "Chest throbbing with congestion could indicate early acute chest syndrome. Discuss this pattern with your hematologist promptly.",
    forDoctor: true,
    urgency: "discuss",
  },
  {
    text: "Use incentive spirometry (10 deep breaths every 2 hours) to keep lungs expanded and reduce atelectasis risk.",
    forDoctor: false,
    urgency: "discuss",
  },
  {
    text: "If chest throbbing worsens, fever develops, or you feel short of breath, go to the ER immediately.",
    forDoctor: false,
    urgency: "urgent",
  },
];

// ── Trace 4 ──────────────────────────────────

const trace4Chains: CausalChain[] = [
  {
    id: "chain-t4-1",
    label: "Temperature drop with reduced hydration",
    overallConfidence: 0.68,
    nodes: [
      {
        id: "t4-n1",
        type: "symptom",
        title: "Upper back tightness with stuffy nose",
        description:
          "Patient reports upper back tightness between the shoulder blades, accompanied by nasal stuffiness from the cold front.",
        bodySystem: "musculoskeletal",
        confidence: 0.82,
        patientEvidence:
          "Symptoms started with the cold front; patient also notes drinking less water this week.",
      },
      {
        id: "t4-n2",
        type: "mechanism",
        title: "Dual dehydration and vasoconstriction pathway",
        description:
          "Cold weather reduces thirst sensation, leading to unnoticed dehydration. Simultaneously, cold triggers vasoconstriction. Both pathways increase blood viscosity and HbS polymer concentration in red cells.",
        bodySystem: "circulatory",
        confidence: 0.7,
      },
      {
        id: "t4-n3",
        type: "root-cause",
        title: "Temperature drop compounding reduced fluid intake",
        description:
          "The combination of sudden temperature drop (cold front) and reduced hydration creates a dual insult: vasoconstriction plus increased blood viscosity. In HbSS patients, this synergistically raises sickling and vaso-occlusion risk.",
        bodySystem: "circulatory",
        confidence: 0.68,
      },
    ],
    connections: [
      {
        fromNodeId: "t4-n2",
        toNodeId: "t4-n1",
        mechanism:
          "Increased blood viscosity and vasoconstriction slow flow through thoracic vertebral vasculature, causing ischemic tightness.",
        strength: "moderate",
      },
      {
        fromNodeId: "t4-n3",
        toNodeId: "t4-n2",
        mechanism:
          "Cold exposure reduces thirst and triggers vasoconstriction, both increasing effective HbS concentration per red cell.",
        strength: "possible",
      },
    ],
  },
];

const trace4Suggestions: Suggestion[] = [
  {
    text: "Set hydration reminders — in cold weather, you may not feel thirsty but still need 2-3 liters daily.",
    forDoctor: false,
    urgency: "info",
  },
  {
    text: "Warm fluids (herbal tea, warm water with lemon) can help with both hydration and staying warm.",
    forDoctor: false,
    urgency: "info",
  },
];

// ── Trace 5 ──────────────────────────────────

const trace5Chains: CausalChain[] = [
  {
    id: "chain-t5-1",
    label: "Sleep deprivation lowering oxygen levels",
    overallConfidence: 0.76,
    nodes: [
      {
        id: "t5-n1",
        type: "symptom",
        title: "Persistent headaches since Tuesday",
        description:
          "Dull, bilateral headaches that worsen in the afternoon. Not responsive to standard analgesics.",
        bodySystem: "neurological",
        confidence: 0.86,
        patientEvidence:
          "Patient reports averaging 4-5 hours of sleep per night since the weekend.",
      },
      {
        id: "t5-n2",
        type: "mechanism",
        title: "Sleep deprivation-induced inflammation and hypoxia",
        description:
          "Chronic sleep loss elevates inflammatory markers (CRP, IL-6) and disrupts normal nocturnal oxygen saturation patterns. In SCD, sleep fragmentation often coexists with nocturnal desaturation, compounding daytime hypoxia.",
        bodySystem: "neurological",
        confidence: 0.78,
      },
      {
        id: "t5-n3",
        type: "root-cause",
        title: "Poor sleep driving cerebrovascular sickling",
        description:
          "Sleep deprivation raises systemic inflammation and lowers average SpO2. In the cerebral vasculature of HbSS patients, this promotes microvasculopathy and silent cerebral ischemia, manifesting as persistent headaches.",
        bodySystem: "circulatory",
        confidence: 0.76,
      },
    ],
    connections: [
      {
        fromNodeId: "t5-n2",
        toNodeId: "t5-n1",
        mechanism:
          "Neuroinflammation and cerebral microvasculopathy from sickling in small cerebral vessels cause persistent headache.",
        strength: "moderate",
      },
      {
        fromNodeId: "t5-n3",
        toNodeId: "t5-n2",
        mechanism:
          "Sleep deprivation raises inflammatory cytokines and disrupts normal nocturnal SpO2, accelerating HbS polymerization.",
        strength: "moderate",
      },
    ],
  },
];

const trace5Suggestions: Suggestion[] = [
  {
    text: "Prioritize sleep — aim for 7-8 hours. Poor sleep is a documented trigger for SCD crises.",
    forDoctor: false,
    urgency: "info",
  },
  {
    text: "Persistent headaches in SCD may warrant a transcranial Doppler. Mention this pattern to your hematologist.",
    forDoctor: true,
    urgency: "discuss",
  },
  {
    text: "If headaches become severe, sudden, or accompanied by vision changes, seek emergency care immediately.",
    forDoctor: false,
    urgency: "info",
  },
];

// ── Weather data for traces ──────────────────

const weatherData: WeatherContext[] = [
  {
    temperature: 42,
    humidity: 65,
    airQualityIndex: 38,
    conditions: "Partly cloudy",
  },
  {
    temperature: 28,
    humidity: 55,
    airQualityIndex: 42,
    conditions: "Cold front, clear skies",
    alerts: ["Cold weather advisory"],
  },
  {
    temperature: 35,
    humidity: 70,
    airQualityIndex: 51,
    conditions: "Overcast, light rain",
  },
  {
    temperature: 31,
    humidity: 48,
    airQualityIndex: 35,
    conditions: "Cold, dry, and windy",
    alerts: ["Wind chill advisory"],
  },
  {
    temperature: 38,
    humidity: 62,
    airQualityIndex: 40,
    conditions: "Cloudy",
  },
];

// ── All traces assembled ─────────────────────

export interface SeedTrace {
  inputText: string;
  thinking: string;
  chains: CausalChain[];
  summary: string;
  suggestions: Suggestion[];
  weatherData: WeatherContext;
  createdAt: Date;
}

export const seedTraces: SeedTrace[] = [
  {
    inputText: "Lower back tightness and dehydration",
    thinking:
      "Patient reports lower back tightness alongside dehydration. Given HbSS genotype with known sinus infection trigger, I should investigate whether nasal congestion (often underreported) is reducing oxygen saturation. The lumbar spine is a common site for vaso-occlusive microinfarcts due to its dependence on small end-arteries. Dehydration compounds this by increasing blood viscosity. The 12% HbF level offers some protection but won't fully prevent sickling at lower SpO2 levels.",
    chains: trace1Chains,
    summary:
      "Your lower back tightness likely traces back to sinus congestion reducing your oxygen levels. Even mild nasal stuffiness can drop your SpO2 below your 96% baseline, which triggers HbS sickling in the small vessels of your lumbar spine. Dehydration makes this worse by thickening your blood.",
    suggestions: trace1Suggestions,
    weatherData: weatherData[0],
    createdAt: daysAgo(18),
  },
  {
    inputText: "Back pain getting worse this week",
    thinking:
      "Escalating back pain over a week in an HbSS patient warrants checking environmental factors. A cold front has been moving through the area. Cold-induced vasoconstriction is a well-established SCD trigger. Combined with the previous trace showing sinus-related issues, there may be a compounding pattern. The patient's known cold weather trigger aligns with this hypothesis.",
    chains: trace2Chains,
    summary:
      "The worsening back pain this week correlates with the cold front that moved through your area. Cold temperatures cause your blood vessels to constrict, slowing blood flow and giving sickle cells more time to polymerize and block small vessels in your spine. This is a pattern consistent with your known cold weather trigger.",
    suggestions: trace2Suggestions,
    weatherData: weatherData[1],
    createdAt: daysAgo(14),
  },
  {
    inputText: "Sinus congestion with chest throbbing",
    thinking:
      "This is concerning — chest symptoms in SCD always warrant careful evaluation for acute chest syndrome (ACS). The combination of sinus congestion (URI) and chest throbbing suggests an inflammatory cascade. Upper respiratory infections are one of the most common precipitants of ACS. The inflammatory cytokines from the URI activate pulmonary endothelium, creating a pro-adhesive environment for sickle cells. This patient's previous traces show a pattern of sinus issues leading to sickling events.",
    chains: trace3Chains,
    summary:
      "The combination of sinus congestion and chest throbbing is important to take seriously. Your sinus infection is triggering inflammatory signals throughout your body, including in your lung blood vessels. This makes it easier for sickle cells to stick and block pulmonary vessels — which is the early stage of acute chest syndrome. Your pattern shows sinus issues consistently triggering sickling events.",
    suggestions: trace3Suggestions,
    weatherData: weatherData[2],
    createdAt: daysAgo(10),
  },
  {
    inputText: "Stuffy nose, cold front, upper back tightness",
    thinking:
      "Patient is reporting multiple simultaneous factors: nasal congestion, cold weather exposure, and musculoskeletal symptoms. This is a dual-insult scenario — cold weather causes vasoconstriction while also reducing the patient's awareness of thirst, leading to dehydration. Both pathways independently increase sickling risk, and together they create a synergistic effect. The upper back location (thoracic spine) has a different vascular supply than the lumbar spine from earlier traces but is equally vulnerable.",
    chains: trace4Chains,
    summary:
      "Multiple factors are hitting you at once: the cold front is constricting your blood vessels, and you're likely drinking less water because cold weather suppresses thirst. Both of these independently increase sickling risk — together, they create a stronger effect. Your upper back tightness reflects vaso-occlusion in the thoracic spine vessels.",
    suggestions: trace4Suggestions,
    weatherData: weatherData[3],
    createdAt: daysAgo(5),
  },
  {
    inputText: "Headaches since Tuesday",
    thinking:
      "Persistent headaches in an HbSS patient should trigger evaluation of cerebrovascular risk. The patient mentions poor sleep, which is a significant but often overlooked trigger. Sleep deprivation raises inflammatory markers systemically and can cause nocturnal desaturation, particularly problematic in SCD where baseline hemoglobin is already compromised. The cerebral vasculature is vulnerable to sickling, and persistent headaches could indicate silent cerebral ischemia. The patient's 12% HbF offers partial protection but doesn't eliminate cerebrovascular risk.",
    chains: trace5Chains,
    summary:
      "Your headaches since Tuesday most likely connect to your poor sleep this week. Getting only 4-5 hours increases inflammation throughout your body and disrupts your oxygen levels at night. For someone with HbSS, this means more sickling in the small blood vessels of your brain. Your HbF of 12% helps but can't fully protect against this.",
    suggestions: trace5Suggestions,
    weatherData: weatherData[4],
    createdAt: daysAgo(2),
  },
];
