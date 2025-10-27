export const symptomCategories = {
  physical: {
    label: 'Physical Symptoms',
    color: 'rose',
    symptoms: [
      'Cramps',
      'Back pain',
      'Headache',
      'Migraine',
      'Breast tenderness',
      'Bloating',
      'Acne',
      'Hot flashes',
      'Cold flashes',
      'Dizziness',
      'Nausea',
      'Vomiting',
      'Joint pain',
      'Muscle aches',
    ],
  },
  emotional: {
    label: 'Emotional & Mental',
    color: 'violet',
    symptoms: [
      'Mood swings',
      'Anxiety',
      'Depression',
      'Irritability',
      'Crying spells',
      'Anger',
      'Social withdrawal',
      'Brain fog',
      'Difficulty concentrating',
    ],
  },
  energy: {
    label: 'Energy & Sleep',
    color: 'blue',
    symptoms: [
      'Fatigue',
      'Low energy',
      'Insomnia',
      'Oversleeping',
      'Restless sleep',
    ],
  },
  digestive: {
    label: 'Digestive',
    color: 'amber',
    symptoms: [
      'Constipation',
      'Diarrhea',
      'Food cravings',
      'Increased appetite',
      'Decreased appetite',
      'Nausea',
    ],
  },
  other: {
    label: 'Other',
    color: 'emerald',
    symptoms: [
      'Spotting',
      'Heavy flow',
      'Light flow',
      'Increased urination',
      'Tender breasts',
      'Swelling',
      'Weight gain',
    ],
  },
};

export const getAllSymptoms = () => {
  const all: string[] = [];
  Object.values(symptomCategories).forEach(category => {
    all.push(...category.symptoms);
  });
  return all;
};
