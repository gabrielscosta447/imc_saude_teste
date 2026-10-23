import React, { useState } from 'react';
import { Measurement, UserProfile } from '../types';
import { BiometricChart } from './BiometricChart';
import { EditMeasurementModal } from './EditMeasurementModal';
import {
  formatDateBR,
  getBMIInfo,
  getIdealWeightRange,
  exportToCSV,
  DEMO_MEASUREMENTS,
} from '../utils/bmi';

interface DashboardScreenProps {
  measurements: Measurement[];
  isDark: boolean;
  userHeight: number;
  user: UserProfile;
  onNavigateToNew: () => void;
  onUpdateMeasurement: (updated: Measurement) => void;
  onDeleteMeasurement: (id: string) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  onManualSync: () => Promise<{ successCount: number; errorCount: number; lastError?: string; code?: string }>;
  onTestFirestore: () => Promise<{ connected: boolean; canWrite: boolean; message: string; code?: string }>;
  onConnectGoogle: () => Promise<{ success: boolean; error?: string }>;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  measurements,
  isDark,
  userHeight,
  user,
  onNavigateToNew,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onLoadDemoData,
  onClearAllData,
  onManualSync,
  onTestFirestore,
  onConnectGoogle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<Measurement | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Measurement | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const itemsPerPage = 5;

  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingFirestore, setSyncingFirestore] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    connected: boolean;
    canWrite: boolean;
    message: string;
    code?: string;
  } | null>(null);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleTestFirestore = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await onTestFirestore();
      setConnectionResult(res);
      if (res.canWrite) {
        showToast('Firestore conectado e gravando com sucesso!');
      }
    } catch (err: unknown) {
      setConnectionResult({
        connected: false,
        canWrite: false,
        message: err instanceof Error ? err.message : 'Falha na conexão com Firestore.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncingFirestore(true);
    try {
      const res = await onManualSync();
      if (res.errorCount === 0 && res.successCount > 0) {
        showToast(`${res.successCount} medições salvas no Firestore!`);
      } else if (res.successCount > 0) {
        showToast(`${res.successCount} salvas, ${res.errorCount} falhas. Verifique regras.`);
      } else if (res.lastError) {
        showToast(`Erro ao gravar: ${res.code || 'Verifique as regras do Firebase'}`);
      } else {
        showToast('Nenhuma medição para sincronizar.');
      }
    } catch {
      showToast('Falha na sincronização com Firestore.');
    } finally {
      setSyncingFirestore(false);
    }
  };

  const handleConnectGoogleClick = async () => {
    setConnectingGoogle(true);
    try {
      const res = await onConnectGoogle();
      if (res.success) {
        showToast('Conta Google conectada com sucesso!');
      } else if (res.error) {
        showToast(res.error);
      }
    } finally {
      setConnectingGoogle(false);
    }
  };

  const copyRulesToClipboard = () => {
    const rulesText = `rules_version = '2';\n\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;
    navigator.clipboard.writeText(rulesText);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
    showToast('Regras copiadas para a área de transferência!');
  };

  // Most recent measurement (if any)
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime()
  );

  const latestMeasurement = sortedMeasurements[0] || null;
  const previousMeasurement = sortedMeasurements[1] || null;

  // Weight delta
  const weightDelta =
    latestMeasurement && previousMeasurement
      ? Number((latestMeasurement.weight - previousMeasurement.weight).toFixed(1))
      : null;

  // IMC info
  const latestBMIInfo = latestMeasurement ? getBMIInfo(latestMeasurement.bmi) : null;

  // Ideal weight range based on user's height
  const effectiveHeight = latestMeasurement ? latestMeasurement.height : userHeight || 1.77;
  const idealRange = getIdealWeightRange(effectiveHeight);

  // Distance from ideal limit
  let distanceMessage = 'Dentro da faixa';
  if (latestMeasurement) {
    if (latestMeasurement.weight > idealRange.max) {
      const over = (latestMeasurement.weight - idealRange.max).toFixed(1);
      distanceMessage = `+${over} kg acima da faixa`;
    } else if (latestMeasurement.weight < idealRange.min) {
      const under = (idealRange.min - latestMeasurement.weight).toFixed(1);
      distanceMessage = `-${under} kg abaixo da faixa`;
    } else {
      const margin = (idealRange.max - latestMeasurement.weight).toFixed(1);
      distanceMessage = `+${margin} kg de margem`;
    }
  }

  // Filter table rows
  const filteredMeasurements = sortedMeasurements.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const dateFormatted = formatDateBR(m.date).toLowerCase();
    return (
      m.date.includes(term) ||
      dateFormatted.includes(term) ||
      m.classification.toLowerCase().includes(term) ||
      m.weight.toString().includes(term) ||
      m.bmi.toString().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredMeasurements.length / itemsPerPage) || 1;
  const paginatedMeasurements = filteredMeasurements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    if (measurements.length === 0) {
      alert('Não há medições cadastradas para exportar.');
      return;
    }
    exportToCSV(measurements);
  };

  return (
    <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all border animate-fade-in ${
            isDark
              ? 'bg-[#163832] border-[#8EB69B]/40 text-[#DAF1DE] shadow-black/60'
              : 'bg-[#053c31] border-[#235347] text-white shadow-lg'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-[#8EB69B]">check_circle</span>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditMeasurementModal
          measurement={editingItem}
          isDark={isDark}
          onSave={(updated) => {
            onUpdateMeasurement(updated);
            setEditingItem(null);
            showToast('Medição atualizada com sucesso!');
          }}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* In-App Delete Confirmation Modal (NO window.confirm!) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-6 sm:p-7 rounded-3xl border shadow-2xl relative transition-all ${
              isDark
                ? 'bg-[#0B2B26] border-[#8EB69B]/30 text-[#cde8e8]'
                : 'bg-white border-[#c0c8c4] text-[#051F20]'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg font-display">Excluir Medição</h3>
                <p className={`text-xs ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
            </div>

            <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              Deseja realmente remover o registro de{' '}
              <strong className={isDark ? 'text-white' : 'text-[#051F20]'}>
                {itemToDelete.weight.toFixed(1)} kg
              </strong>{' '}
              realizado em{' '}
              <strong className={isDark ? 'text-white' : 'text-[#051F20]'}>
                {formatDateBR(itemToDelete.date)} às {itemToDelete.time || '08:30'}
              </strong>
              ?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/[0.15] hover:bg-white/[0.08] text-[#c1c8c1]'
                    : 'border-[#c0c8c4] hover:bg-gray-100 text-[#404945]'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMeasurement(itemToDelete.id);
                  if (paginatedMeasurements.length === 1 && currentPage > 1) {
                    setCurrentPage((p) => p - 1);
                  }
                  setItemToDelete(null);
                  showToast('Medição excluída com sucesso!');
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer active:scale-95"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Clear All Data Confirmation Modal (NO window.confirm!) */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-6 sm:p-7 rounded-3xl border shadow-2xl relative transition-all ${
              isDark
                ? 'bg-[#0B2B26] border-[#8EB69B]/30 text-[#cde8e8]'
                : 'bg-white border-[#c0c8c4] text-[#051F20]'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg font-display">Limpar Todas as Medições</h3>
                <p className={`text-xs ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                  Retornar ao ambiente limpo inicial
                </p>
              </div>
            </div>

            <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              Tem certeza que deseja apagar todos os{' '}
              <strong className={isDark ? 'text-white' : 'text-[#051F20]'}>
                {measurements.length} registros
              </strong>
              ? O painel voltará ao estado limpo inicial sem medições.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/[0.15] hover:bg-white/[0.08] text-[#c1c8c1]'
                    : 'border-[#c0c8c4] hover:bg-gray-100 text-[#404945]'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setCurrentPage(1);
                  setShowClearConfirm(false);
                  showToast('Ambiente limpo! Todos os dados foram resetados.');
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer active:scale-95"
              >
                Limpar Todos os Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Console Guide Modal */}
      {showFirebaseGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-xl p-6 sm:p-7 rounded-3xl border shadow-2xl relative transition-all max-h-[90vh] overflow-y-auto ${
              isDark
                ? 'bg-[#0B2B26] border-[#8EB69B]/30 text-[#cde8e8]'
                : 'bg-white border-[#c0c8c4] text-[#051F20]'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-400 text-2xl">local_fire_department</span>
                <h3 className="font-bold text-lg font-display">Como Ver os Dados no Firebase Firestore</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFirebaseGuide(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              Se você salvou medições mas elas não estão aparecendo no console do Firebase (<strong>imc-saude-71e4a</strong>),
              isto geralmente ocorre por um destes dois motivos simples:
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/25 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <p className="font-bold text-emerald-400 mb-1">Passo 1: Criar o Banco Firestore no Console</p>
                <p className="opacity-90 leading-relaxed mb-2">
                  No console do Firebase, o Firestore precisa ser criado manualmente se o projeto for novo. Acesse:
                  <br />
                  <a
                    href="https://console.firebase.google.com/project/imc-saude-71e4a/firestore"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-emerald-300 font-mono break-all inline-block mt-1"
                  >
                    https://console.firebase.google.com/project/imc-saude-71e4a/firestore
                  </a>
                  <br />
                  Clique no botão <strong>"Criar banco de dados"</strong> e selecione o modo de teste ou produção.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/25 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <p className="font-bold text-emerald-400 mb-1">Passo 2: Publicar as Regras de Gravação (Rules)</p>
                <p className="opacity-90 leading-relaxed mb-2">
                  Por padrão, o Firebase cria com regras que bloqueiam gravações (<code>allow read, write: if false;</code>). Na aba <strong>Regras (Rules)</strong> do Firestore no console, cole o código abaixo e clique no botão <strong>Publicar (Publish)</strong>:
                </p>
                <div className="relative mt-2">
                  <pre className="p-3 rounded-xl bg-black/60 text-[#a9d2b6] font-mono text-[11px] overflow-x-auto border border-white/10 leading-relaxed">
{`rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                  </pre>
                  <button
                    type="button"
                    onClick={copyRulesToClipboard}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#8EB69B] text-[#051F20] hover:bg-white transition-all cursor-pointer shadow-sm"
                  >
                    {copiedRules ? 'Copiado!' : 'Copiar Regras'}
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/25 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <p className="font-bold text-emerald-400 mb-1">Passo 3: Onde visualizar os dados no Console</p>
                <p className="opacity-90 leading-relaxed">
                  O aplicativo grava automaticamente em duas coleções:
                  <br />• <strong className="text-[#8EB69B]">/measurements</strong>: coleção raiz direta, visível no primeiro painel de dados.
                  <br />• <strong className="text-[#8EB69B]">/users/{'{uid}'}/measurements</strong>: subcoleção individual de cada usuário autenticado.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/25 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <p className="font-bold text-emerald-400 mb-1">Passo 4: Domínios Autorizados no Firebase Authentication</p>
                <p className="opacity-90 leading-relaxed mb-2">
                  Para o login com Google funcionar sem o erro <code>auth/unauthorized-domain</code>, adicione estes dois domínios em:
                  <br />
                  <a
                    href="https://console.firebase.google.com/project/imc-saude-71e4a/authentication/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-emerald-300 font-mono break-all inline-block mt-1"
                  >
                    Authentication &gt; Configurações (Settings) &gt; Domínios autorizados
                  </a>
                </p>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-[#a9d2b6]">
                    <span className="truncate">ais-dev-f43x7inknskqzfa2ld4nzk-798531392011.us-east1.run.app</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('ais-dev-f43x7inknskqzfa2ld4nzk-798531392011.us-east1.run.app');
                        showToast('Domínio de dev copiado!');
                      }}
                      className="px-2 py-1 rounded bg-[#8EB69B] text-[#051F20] text-[10px] font-bold hover:bg-white shrink-0 cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-[#a9d2b6]">
                    <span className="truncate">ais-pre-f43x7inknskqzfa2ld4nzk-798531392011.us-east1.run.app</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('ais-pre-f43x7inknskqzfa2ld4nzk-798531392011.us-east1.run.app');
                        showToast('Domínio preview copiado!');
                      }}
                      className="px-2 py-1 rounded bg-[#8EB69B] text-[#051F20] text-[10px] font-bold hover:bg-white shrink-0 cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFirebaseGuide(false)}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#8EB69B] text-[#051F20] hover:bg-[#a9d2b6] transition-all cursor-pointer font-display"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bioluminescent ambient background accents */}
      <div className="relative w-full overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-24 -left-20 w-96 h-96 rounded-full blur-3xl ${
            isDark ? 'bg-[#a9d2b6]/10' : 'bg-[#c3eccf]/30'
          }`}
        />
        <div
          className={`absolute top-48 -right-24 w-80 h-80 rounded-full blur-3xl ${
            isDark ? 'bg-[#163832]/60' : 'bg-[#d8f3f4]/40'
          }`}
        />
      </div>

      {/* Header Section with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mb-6 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-[#a9d2b6]' : 'bg-[#235347]'}`}
            />
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-[#a9d2b6]' : 'text-[#235347]'
              }`}
            >
              Acompanhamento Biológico
            </span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold font-display tracking-tight ${
              isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
            }`}
          >
            Evolução do IMC &amp; Peso
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateToNew}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg cursor-pointer ${
              isDark
                ? 'bg-gradient-to-r from-[#a9d2b6] to-[#8eb69b] hover:from-[#c3eccf] hover:to-[#a9d2b6] text-[#051F20] shadow-[#a9d2b6]/20'
                : 'bg-[#053c31] hover:bg-[#235347] text-white shadow-[#053c31]/25'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="text-sm">+ Nova Medição</span>
          </button>
        </div>
      </div>

      {/* Firebase Firestore Cloud Sync & Diagnostics Card */}
      <div
        className={`mb-6 p-4 sm:p-5 rounded-2xl border backdrop-blur-md transition-all relative z-10 ${
          isDark
            ? 'bg-[#0B2B26]/75 border-[#8EB69B]/25 text-[#cde8e8] shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
            : 'bg-white/95 border-[#cde8e8] text-[#051F20] shadow-[0_4px_20px_rgba(5,31,32,0.06)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                connectionResult?.canWrite
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : connectionResult && !connectionResult.canWrite
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : isDark
                  ? 'bg-[#163832] text-[#8EB69B] border-[#8EB69B]/30'
                  : 'bg-[#d8f3f4] text-[#053c31] border-[#235347]/20'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {connectionResult?.canWrite ? 'cloud_done' : 'cloud_sync'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8EB69B]">
                  Firebase Cloud Firestore
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-black/30 border-white/10 text-gray-300'
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                >
                  imc-saude-71e4a
                </span>
                {user.uid ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                    Autenticado ({user.email || user.name})
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                    Sessão Local (Não autenticado no Google)
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                Coleções ativas: <code className="text-[11px] font-mono text-[#8EB69B]">/measurements</code>{' '}
                e <code className="text-[11px] font-mono text-[#8EB69B]">/users/{user.uid || 'uid'}/measurements</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!user.uid && (
              <button
                type="button"
                onClick={handleConnectGoogleClick}
                disabled={connectingGoogle}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#163832] hover:bg-[#235347] text-white border border-[#8EB69B]/30'
                    : 'bg-[#d8f3f4] hover:bg-[#c2ecee] text-[#053c31] border border-[#235347]/20'
                }`}
                title="Conectar com o provedor Google Authentication"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{connectingGoogle ? 'Conectando...' : 'Conectar Google'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleTestFirestore}
              disabled={testingConnection}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isDark
                  ? 'border-[#8EB69B]/40 hover:bg-[#8EB69B]/15 text-[#cde8e8]'
                  : 'border-[#235347]/30 hover:bg-[#235347]/10 text-[#053c31]'
              }`}
              title="Testar se o Firestore está recebendo leituras e gravações"
            >
              <span className={`material-symbols-outlined text-[17px] ${testingConnection ? 'animate-spin' : ''}`}>
                {testingConnection ? 'sync' : 'network_check'}
              </span>
              <span>{testingConnection ? 'Testando...' : 'Testar Conexão'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncNow}
              disabled={syncingFirestore || measurements.length === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-gradient-to-r from-[#8EB69B] to-[#a9d2b6] hover:brightness-110 text-[#051F20]'
                  : 'bg-[#053c31] hover:bg-[#235347] text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Sincronizar medições salvas para o Firebase Console"
            >
              <span className={`material-symbols-outlined text-[17px] ${syncingFirestore ? 'animate-spin' : ''}`}>
                {syncingFirestore ? 'hourglass_top' : 'cloud_upload'}
              </span>
              <span>{syncingFirestore ? 'Sincronizando...' : `Sincronizar (${measurements.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFirebaseGuide(true)}
              className={`p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                isDark
                  ? 'border-white/10 hover:bg-white/10 text-gray-300'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
              title="Ver instruções do console e regras de segurança"
            >
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
            </button>
          </div>
        </div>

        {/* Live Test / Connection Diagnostic Alert */}
        {connectionResult && (
          <div
            className={`mt-3 p-3 rounded-xl border text-xs flex items-start justify-between gap-3 animate-fade-in ${
              connectionResult.canWrite
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                {connectionResult.canWrite ? 'check_circle' : 'error'}
              </span>
              <div>
                <p className="font-semibold">
                  {connectionResult.canWrite
                    ? 'Firestore Conectado e Operando!'
                    : `Diagnóstico: ${connectionResult.code || 'Atenção Necessária'}`}
                </p>
                <p className="mt-0.5 opacity-90 leading-relaxed">{connectionResult.message}</p>
                {!connectionResult.canWrite && (
                  <button
                    type="button"
                    onClick={() => setShowFirebaseGuide(true)}
                    className="mt-1.5 font-bold underline cursor-pointer text-amber-200 hover:text-white block"
                  >
                    Clique aqui para ver a regra do Firebase Console
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConnectionResult(null)}
              className="text-current opacity-70 hover:opacity-100 cursor-pointer p-0.5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
      </div>

      {/* 3 Summary Biometric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        {/* Card 1: Último Peso */}
        <div
          className={`border backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between transition-all group ${
            isDark
              ? 'bg-[#0B2B26]/65 border-white/[0.08] hover:border-[#8EB69B]/40 shadow-black/20 text-[#cde8e8]'
              : 'bg-white/85 border-white shadow-[0_4px_20px_-2px_rgba(5,31,32,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(5,31,32,0.08)] text-[#051F20]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#8EB69B]">monitor_weight</span>
              Último Peso
            </span>
            {weightDelta !== null ? (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-0.5 border ${
                  weightDelta <= 0
                    ? isDark
                      ? 'bg-[#163832] border-[#8EB69B]/30 text-[#DAF1DE]'
                      : 'bg-[#c3eccf] border-[#235347]/20 text-[#002111]'
                    : isDark
                    ? 'bg-[#3d2f19] border-[#ffdcb8]/30 text-[#ffdcb8]'
                    : 'bg-[#ffdcb8] border-[#ba1a1a]/30 text-[#0c1f14]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {weightDelta <= 0 ? 'arrow_downward' : 'arrow_upward'}
                </span>
                {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
              </span>
            ) : (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-white/[0.06] text-[#c1c8c1]' : 'bg-[#def9f9] text-[#707975]'
                }`}
              >
                Inicial
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span
              className={`text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
              }`}
            >
              {latestMeasurement ? latestMeasurement.weight.toFixed(1) : '--.-'}
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>kg</span>
          </div>

          <div
            className={`mt-2 flex items-center justify-between text-xs border-t pt-2.5 ${
              isDark ? 'border-white/[0.06] text-[#c1c8c1]' : 'border-[#c0c8c4]/30 text-[#404945]'
            }`}
          >
            <span>Último registro</span>
            <span className={`font-semibold ${isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}`}>
              {latestMeasurement
                ? `${formatDateBR(latestMeasurement.date).split(' ').slice(0, 2).join(' ')}, ${latestMeasurement.time || '08:30'}`
                : 'Nenhum ainda'}
            </span>
          </div>
        </div>

        {/* Card 2: Último IMC */}
        <div
          className={`border backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between transition-all group ${
            isDark
              ? 'bg-[#0B2B26]/65 border-white/[0.08] hover:border-[#8EB69B]/40 shadow-black/20 text-[#cde8e8]'
              : 'bg-white/85 border-white shadow-[0_4px_20px_-2px_rgba(5,31,32,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(5,31,32,0.08)] text-[#051F20]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#8EB69B]">vital_signs</span>
              Último IMC
            </span>
            {latestBMIInfo ? (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  isDark ? latestBMIInfo.badgeClassDark : latestBMIInfo.badgeClassLight
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8EB69B]" />
                {latestBMIInfo.label}
              </span>
            ) : (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-white/[0.06] text-[#c1c8c1]' : 'bg-[#def9f9] text-[#707975]'
                }`}
              >
                Aguardando
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span
              className={`text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
              }`}
            >
              {latestMeasurement ? latestMeasurement.bmi.toFixed(1) : '--.-'}
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>kg/m²</span>
          </div>

          <div
            className={`mt-2 flex items-center justify-between text-xs border-t pt-2.5 ${
              isDark ? 'border-white/[0.06] text-[#c1c8c1]' : 'border-[#c0c8c4]/30 text-[#404945]'
            }`}
          >
            <span>Estado ponderal</span>
            <span className={`font-semibold ${isDark ? 'text-[#a9d2b6]' : 'text-[#235347]'}`}>
              {latestBMIInfo ? latestBMIInfo.statusDetailed : 'Registre uma medição'}
            </span>
          </div>
        </div>

        {/* Card 3: Faixa Ideal (OMS) */}
        <div
          className={`border backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between transition-all group ${
            isDark
              ? 'bg-[#0B2B26]/65 border-white/[0.08] hover:border-[#8EB69B]/40 shadow-black/20 text-[#cde8e8]'
              : 'bg-white/85 border-white shadow-[0_4px_20px_-2px_rgba(5,31,32,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(5,31,32,0.08)] text-[#051F20]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#8EB69B]">health_and_safety</span>
              Faixa Ideal (OMS)
            </span>
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-white/[0.06] border-white/[0.08] text-[#DAF1DE]'
                  : 'bg-[#d8f3f4] border-[#c0c8c4]/40 text-[#053c31]'
              }`}
            >
              18.5 – 24.9
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
              }`}
            >
              {idealRange.min} – {idealRange.max}
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              kg estimado
            </span>
          </div>

          <div
            className={`mt-2 flex items-center justify-between text-xs border-t pt-2.5 ${
              isDark ? 'border-white/[0.06] text-[#c1c8c1]' : 'border-[#c0c8c4]/30 text-[#404945]'
            }`}
          >
            <span>Distância do limite</span>
            <span className={`font-semibold ${isDark ? 'text-[#a9d2b6]' : 'text-[#235347]'}`}>
              {latestMeasurement ? distanceMessage : `Para altura ${effectiveHeight.toFixed(2)} m`}
            </span>
          </div>
        </div>
      </div>

      {/* Trajetória e Tendência (Chart Section) */}
      <div className="mb-6 relative z-10">
        <BiometricChart
          measurements={measurements}
          isDark={isDark}
          userHeight={effectiveHeight}
          onAddNew={onNavigateToNew}
        />
      </div>

      {/* Histórico de Medições (Data Table Section) */}
      <div
        className={`border backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md transition-colors duration-200 relative z-10 ${
          isDark
            ? 'bg-[#0B2B26]/65 border-white/[0.08] text-[#cde8e8]'
            : 'bg-white/85 border-white/80 shadow-[0_4px_24px_-2px_rgba(5,31,32,0.06)] text-[#051F20]'
        }`}
      >
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2
              className={`text-lg sm:text-xl font-bold font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
              }`}
            >
              Histórico de Medições
            </h2>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              Listagem detalhada das aferições biométricas cadastradas
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <span
                className={`material-symbols-outlined absolute left-3 top-2.5 text-[18px] pointer-events-none ${
                  isDark ? 'text-[#8b938c]' : 'text-[#707975]'
                }`}
              >
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filtrar medição..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-full text-xs sm:text-sm outline-none transition-colors border ${
                  isDark
                    ? 'bg-[#001718]/80 border-white/[0.1] text-[#DAF1DE] placeholder:text-[#8b938c] focus:border-[#a9d2b6]'
                    : 'bg-[#def9f9]/70 border-[#c0c8c4]/60 text-[#051F20] placeholder:text-[#707975] focus:bg-white focus:border-[#053c31]'
                }`}
              />
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExport}
              title="Exportar CSV"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border cursor-pointer ${
                isDark
                  ? 'bg-[#001718]/80 border-white/[0.1] hover:bg-white/[0.1] text-[#DAF1DE]'
                  : 'bg-[#def9f9] border-[#c0c8c4]/60 hover:bg-[#d8f3f4] text-[#053c31]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
          </div>
        </div>

        {/* Clean Empty State or Measurements Table */}
        {filteredMeasurements.length === 0 ? (
          <div
            className={`text-center py-12 px-4 rounded-xl border border-dashed ${
              isDark ? 'border-white/[0.08] bg-[#001718]/40' : 'border-[#c0c8c4]/50 bg-[#def9f9]/30'
            }`}
          >
            <span className="material-symbols-outlined text-4xl text-[#8EB69B] mb-2">monitoring</span>
            <h3 className={`text-base font-bold font-display ${isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}`}>
              {searchTerm ? 'Nenhuma medição encontrada com o termo buscado' : 'Nenhuma medição cadastrada'}
            </h3>
            <p className={`text-xs sm:text-sm max-w-md mx-auto mt-1 mb-4 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              {searchTerm
                ? 'Tente ajustar os filtros ou limpar o campo de busca.'
                : 'Seu histórico começa limpo como solicitado. Clique no botão abaixo para adicionar sua primeira medição.'}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={onNavigateToNew}
                className={`px-5 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 ${
                  isDark
                    ? 'bg-[#a9d2b6] text-[#051F20] hover:bg-[#c3eccf]'
                    : 'bg-[#053c31] text-white hover:bg-[#235347]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Nova Medição</span>
              </button>
            )}
          </div>
        ) : (
          /* Measurements Data Table */
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr
                  className={`text-xs font-semibold uppercase tracking-wider border-b ${
                    isDark ? 'border-white/[0.08] text-[#8EB69B]' : 'border-[#c0c8c4]/40 text-[#235347]'
                  }`}
                >
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Peso (kg)</th>
                  <th className="py-3 px-3">Altura (m)</th>
                  <th className="py-3 px-3">IMC Calculado</th>
                  <th className="py-3 px-3">Classificação</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {paginatedMeasurements.map((m) => {
                  const info = getBMIInfo(m.bmi);
                  return (
                    <React.Fragment key={m.id}>
                      <tr
                        className={`transition-colors rounded-2xl group border ${
                          isDark
                            ? 'bg-[#001718]/50 hover:bg-[#001718]/80 border-white/[0.04]'
                            : 'bg-[#def9f9]/40 hover:bg-[#def9f9]/80 border-[#c0c8c4]/30'
                        }`}
                      >
                        {/* Data & Horário */}
                        <td className="py-3.5 px-3 rounded-l-2xl">
                          <span
                            className={`font-semibold text-xs sm:text-sm block ${
                              isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'
                            }`}
                          >
                            {formatDateBR(m.date)}
                          </span>
                          <span className={`text-[11px] font-normal ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                            {m.time || '08:30'}
                          </span>
                        </td>

                        {/* Peso */}
                        <td
                          className={`py-3.5 px-3 font-bold text-sm sm:text-base ${
                            isDark ? 'text-[#FFFFFF]' : 'text-[#051F20]'
                          }`}
                        >
                          {m.weight.toFixed(1)} kg
                        </td>

                        {/* Altura */}
                        <td className={`py-3.5 px-3 text-xs sm:text-sm ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
                          {m.height.toFixed(2)} m
                        </td>

                        {/* IMC Calculado */}
                        <td
                          className={`py-3.5 px-3 font-bold text-xs sm:text-sm ${
                            isDark ? 'text-[#a9d2b6]' : 'text-[#053c31]'
                          }`}
                        >
                          {m.bmi.toFixed(1)}
                        </td>

                        {/* Classificação */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isDark ? info.badgeClassDark : info.badgeClassLight
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                info.category === 'normal' ? 'bg-[#8EB69B]' : 'bg-[#ba1a1a]'
                              }`}
                            />
                            {m.classification || info.label}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-3 text-right rounded-r-2xl">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingItem(m)}
                              title="Editar"
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                isDark
                                  ? 'hover:bg-white/[0.1] text-[#c1c8c1] hover:text-[#DAF1DE]'
                                  : 'hover:bg-[#def9f9] text-[#707975] hover:text-[#053c31]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(m)}
                              title="Excluir"
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-red-500/15 text-red-400 hover:text-red-500"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Spacer between rows */}
                      <tr className="h-1.5" />
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Compact Footer Pagination */}
        <div
          className={`mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t ${
            isDark ? 'border-white/[0.06] text-[#c1c8c1]' : 'border-[#c0c8c4]/30 text-[#404945]'
          }`}
        >
          <span>
            Mostrando{' '}
            <strong className={isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}>
              {filteredMeasurements.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredMeasurements.length)}
            </strong>{' '}
            de{' '}
            <strong className={isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}>
              {filteredMeasurements.length}
            </strong>{' '}
            medições
          </span>

          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer border ${
                isDark
                  ? 'bg-[#001718]/80 border-white/[0.08] hover:bg-white/[0.1] text-[#DAF1DE]'
                  : 'bg-[#def9f9] border-[#c0c8c4]/40 hover:bg-[#d8f3f4] text-[#053c31]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border ${
                isDark
                  ? 'bg-[#a9d2b6]/20 border-[#a9d2b6]/40 text-[#a9d2b6]'
                  : 'bg-[#c3eccf] border-[#235347]/30 text-[#053c31]'
              }`}
            >
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer border ${
                isDark
                  ? 'bg-[#001718]/80 border-white/[0.08] hover:bg-white/[0.1] text-[#DAF1DE]'
                  : 'bg-[#def9f9] border-[#c0c8c4]/40 hover:bg-[#d8f3f4] text-[#053c31]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Environment Helper Strip */}
      <div
        className={`mt-6 p-4 rounded-2xl border backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDark
            ? 'bg-[#0B2B26]/50 border-white/[0.06] text-[#8b938c]'
            : 'bg-white/60 border-[#c0c8c4]/30 text-[#707975]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#8EB69B]">clean_hands</span>
          <span>
            {measurements.length === 0
              ? 'Ambiente limpo inicial ativo (nenhum dado fictício populado)'
              : `${measurements.length} medições salvas`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {measurements.length === 0 ? (
            <button
              type="button"
              onClick={() => {
                onLoadDemoData();
                showToast('5 medições de teste carregadas com sucesso!');
              }}
              className={`px-3 py-1.5 rounded-full font-semibold border cursor-pointer transition-colors ${
                isDark
                  ? 'bg-[#163832] border-[#8EB69B]/30 text-[#DAF1DE] hover:bg-[#235347]'
                  : 'bg-[#def9f9] border-[#235347]/20 text-[#053c31] hover:bg-[#c0eacc]'
              }`}
            >
              Carregar dados do anexo (5 medições de teste)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-full font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
            >
              Limpar dados (Voltar ao ambiente limpo)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
