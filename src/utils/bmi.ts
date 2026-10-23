import { Measurement } from '../types';

export function calculateBMI(weightKg: number, heightM: number): number {
  if (weightKg <= 0 || heightM <= 0) return 0;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export interface BMIInfo {
  label: string;
  category: 'under' | 'normal' | 'over' | 'obese';
  badgeClassLight: string;
  badgeClassDark: string;
  message: string;
  statusDetailed: string;
}

export function getBMIInfo(bmi: number): BMIInfo {
  if (bmi <= 0) {
    return {
      label: 'Aguardando',
      category: 'normal',
      badgeClassLight: 'bg-[#d8f3f4] text-[#053c31]',
      badgeClassDark: 'bg-[#163832] text-[#DAF1DE]',
      message: 'Informe seu peso e altura para calcular seu IMC.',
      statusDetailed: 'Aguardando Medição',
    };
  }

  if (bmi < 18.5) {
    return {
      label: 'Abaixo do peso',
      category: 'under',
      badgeClassLight: 'bg-[#def9f9] text-[#235347] border border-[#c0c8c4]',
      badgeClassDark: 'bg-[#163832] border border-[#8EB69B]/30 text-[#DAF1DE]',
      message: 'Seu índice indica peso abaixo da faixa padrão recomendada pela OMS.',
      statusDetailed: 'Abaixo do Peso',
    };
  }

  if (bmi < 25) {
    return {
      label: 'Saudável',
      category: 'normal',
      badgeClassLight: 'bg-[#c3eccf] text-[#002111]',
      badgeClassDark: 'bg-[#235347] border border-[#a9d2b6]/40 text-[#FFFFFF]',
      message: 'Excelente! Seu peso está na faixa de perfeita harmonia biológica recomendada pela OMS.',
      statusDetailed: 'Eutrófico / Ótimo',
    };
  }

  if (bmi < 30) {
    return {
      label: 'Sobrepeso Leve',
      category: 'over',
      badgeClassLight: 'bg-[#d1e8d5] text-[#0c1f14]',
      badgeClassDark: 'bg-[#3d2f19] border border-[#ffdcb8]/30 text-[#ffdcb8]',
      message: 'Pequenas adaptações graduais na rotina e alimentação auxiliam no equilíbrio sustentável.',
      statusDetailed: 'Sobrepeso Leve',
    };
  }

  return {
    label: 'Obesidade',
    category: 'obese',
    badgeClassLight: 'bg-[#ffdad6] text-[#93000a]',
    badgeClassDark: 'bg-[#491617] border border-[#ffdad6]/30 text-[#ffdad6]',
    message: 'Acompanhamento com um profissional de saúde e nutrição é altamente benéfico.',
    statusDetailed: 'Atenção Biométrica',
  };
}

export function getIdealWeightRange(heightM: number): { min: number; max: number } {
  if (heightM <= 0) return { min: 0, max: 0 };
  const min = Math.round(18.5 * heightM * heightM);
  const max = Math.round(24.9 * heightM * heightM);
  return { min, max };
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${parts[2]} ${months[monthIndex] || parts[1]} ${parts[0]}`;
  }
  return dateStr;
}

export function exportToCSV(measurements: Measurement[]): void {
  if (measurements.length === 0) return;
  const header = ['Data', 'Horario', 'Peso (kg)', 'Altura (m)', 'IMC', 'Classificacao'];
  const rows = measurements.map((m) => [
    m.date,
    m.time,
    m.weight.toFixed(1),
    m.height.toFixed(2),
    m.bmi.toFixed(1),
    `"${m.classification}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `imc_saude_historico_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Exactly matching the mockup measurements if user wants to load demo data for testing
export const DEMO_MEASUREMENTS: Measurement[] = [
  {
    id: 'demo-1',
    date: '2025-03-12',
    time: '08:30',
    weight: 74.5,
    height: 1.77,
    bmi: 23.8,
    classification: 'Saudável',
    statusLabel: 'Eutrófico / Ótimo',
  },
  {
    id: 'demo-2',
    date: '2025-03-07',
    time: '07:15',
    weight: 75.3,
    height: 1.77,
    bmi: 24.0,
    classification: 'Saudável',
    statusLabel: 'Eutrófico / Ótimo',
  },
  {
    id: 'demo-3',
    date: '2025-03-02',
    time: '09:00',
    weight: 76.1,
    height: 1.77,
    bmi: 24.3,
    classification: 'Saudável',
    statusLabel: 'Eutrófico / Ótimo',
  },
  {
    id: 'demo-4',
    date: '2025-02-25',
    time: '07:45',
    weight: 77.0,
    height: 1.77,
    bmi: 24.6,
    classification: 'Saudável',
    statusLabel: 'Eutrófico / Ótimo',
  },
  {
    id: 'demo-5',
    date: '2025-02-10',
    time: '08:10',
    weight: 78.8,
    height: 1.77,
    bmi: 25.1,
    classification: 'Sobrepeso Leve',
    statusLabel: 'Sobrepeso Leve',
  },
];
