export const SUBJECTS: {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  icon: string;
  color: string;
  videoCount: number;
  pdfCount: number;
  imageCount: number;
  quizCount: number;
}[] = [
  {
    id: "aqidah",
    name: "Aqidah",
    arabicName: "العقيدة",
    description: "Islamic theology and creed — the foundational beliefs of a Muslim concerning Allah, His angels, books, messengers, the Last Day, and divine decree.",
    icon: "book",
    color: "#064E3B",
    videoCount: 0,
    pdfCount: 0,
    imageCount: 0,
    quizCount: 0,
  },
  {
    id: "tafsir",
    name: "Tafsir",
    arabicName: "التفسير",
    description: "The scholarly exegesis and interpretation of the Quran — understanding the meanings, context, and wisdom of the divine revelation.",
    icon: "book-open",
    color: "#065F46",
    videoCount: 0,
    pdfCount: 0,
    imageCount: 0,
    quizCount: 0,
  },
  {
    id: "hadith",
    name: "Hadith",
    arabicName: "الحديث",
    description: "The recorded sayings, actions, and approvals of the Prophet Muhammad ﷺ — the second primary source of Islamic law and guidance.",
    icon: "scroll",
    color: "#047857",
    videoCount: 0,
    pdfCount: 0,
    imageCount: 0,
    quizCount: 0,
  },
  {
    id: "fiqh",
    name: "Fiqh",
    arabicName: "الفقه",
    description: "Islamic jurisprudence — the detailed rulings and legal opinions derived from the Quran and Sunnah governing all aspects of a Muslim's life.",
    icon: "scale",
    color: "#059669",
    videoCount: 0,
    pdfCount: 0,
    imageCount: 0,
    quizCount: 0,
  },
  {
    id: "tarbiyah",
    name: "Tarbiyah",
    arabicName: "التربية",
    description: "Islamic education and character development — nurturing the soul, refining manners, and building a strong spiritual connection with Allah.",
    icon: "heart",
    color: "#0D9488",
    videoCount: 0,
    pdfCount: 0,
    imageCount: 0,
    quizCount: 0,
  },
  {
    id: "sirah",
    name: "Sirah",
    arabicName: "السيرة",
    description: "The biography of the Prophet Muhammad ﷺ — his life, character, struggles, and legacy as the final messenger sent as a mercy to all worlds.",
    icon: "star",
    color: "#0F766E",
    videoCount: 0,
    pdfCount: 0,
    imageCount: 0,
    quizCount: 0,
  },
];

export const PILLARS: {
  id: string;
  name: string;
  arabicName: string;
  order: number;
  shortDescription: string;
  icon: string;
}[] = [
  {
    id: "shahadah",
    name: "Shahadah",
    arabicName: "الشهادة",
    order: 1,
    shortDescription: "The declaration of faith: bearing witness that there is no god but Allah, and that Muhammad ﷺ is His messenger.",
    icon: "1",
  },
  {
    id: "salah",
    name: "Salah",
    arabicName: "الصلاة",
    order: 2,
    shortDescription: "The five daily prayers — the direct connection between the believer and their Lord, performed at prescribed times throughout the day.",
    icon: "2",
  },
  {
    id: "zakah",
    name: "Zakah",
    arabicName: "الزكاة",
    order: 3,
    shortDescription: "The obligatory annual almsgiving — purifying wealth by giving a portion to those in need, as commanded by Allah.",
    icon: "3",
  },
  {
    id: "sawm",
    name: "Sawm",
    arabicName: "الصوم",
    order: 4,
    shortDescription: "The fasting of Ramadan — abstaining from food, drink, and desires from dawn to sunset in worship and gratitude to Allah.",
    icon: "4",
  },
  {
    id: "hajj",
    name: "Hajj",
    arabicName: "الحج",
    order: 5,
    shortDescription: "The pilgrimage to Makkah — obligatory once in a lifetime for those who are able, uniting Muslims in devotion before Allah.",
    icon: "5",
  },
];

export const PILLAR_DETAILS: {
  id: string;
  name: string;
  arabicName: string;
  order: number;
  description: string;
  arabicText: string;
  videos: never[];
  links: never[];
}[] = [
  {
    id: "shahadah",
    name: "Shahadah",
    arabicName: "الشهادة",
    order: 1,
    description: "The Shahadah is the declaration of faith and the first of the Five Pillars of Islam. It is the testimony that affirms the oneness of Allah and the prophethood of Muhammad ﷺ.",
    arabicText: "أَشْهَدُ أَن لَّا إِلَٰهَ إِلَّا ٱللَّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَّسُولُ ٱللَّٰهِ",
    videos: [],
    links: [],
  },
  {
    id: "salah",
    name: "Salah",
    arabicName: "الصلاة",
    order: 2,
    description: "Salah is the ritual prayer performed five times daily. It is the most important act of worship after the Shahadah and serves as a direct connection between the believer and Allah.",
    arabicText: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    videos: [],
    links: [],
  },
  {
    id: "zakah",
    name: "Zakah",
    arabicName: "الزكاة",
    order: 3,
    description: "Zakah is the obligatory annual almsgiving. It purifies wealth and fulfils the right of the poor upon those who possess the minimum threshold (nisab) of wealth for a lunar year.",
    arabicText: "خُذْ مِنْ أَمْوَٰلِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا",
    videos: [],
    links: [],
  },
  {
    id: "sawm",
    name: "Sawm",
    arabicName: "الصوم",
    order: 4,
    description: "Sawm is the fasting observed during the month of Ramadan. Muslims abstain from food, drink, and other physical needs from the Fajr prayer until the Maghrib prayer.",
    arabicText: "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ كُتِبَ عَلَيۡكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبۡلِكُمۡ",
    videos: [],
    links: [],
  },
  {
    id: "hajj",
    name: "Hajj",
    arabicName: "الحج",
    order: 5,
    description: "Hajj is the annual pilgrimage to Makkah, obligatory once in a lifetime for every Muslim who is physically and financially able. It commemorates the trials of Ibrahim عليه السلام and his family.",
    arabicText: "وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا",
    videos: [],
    links: [],
  },
];

export const IMAGES: {
  id: string;
  title: string;
  bookTitle: string;
  author: string;
  pageRange: string;
  imageUrl: string;
  downloadUrl: string;
  subjectId: string;
}[] = [];

export const QUIZZES: {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  questionCount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}[] = [];
