import { Resident, MonthlyDuesRecord, IuranStatus } from '../types';
import { getPreviousMonthKey } from './format';

export interface ResidentDuesCalculation {
  resident: Resident;
  monthKey: string;
  iuranBulanIni: number;
  tunggakanBulanLalu: number;
  isManualArrears: boolean;
  autoCalculatedArrears: number;
  totalKewajiban: number;
  status: IuranStatus;
  sisaKewajiban: number;
  record?: MonthlyDuesRecord;
}

export function getMonthKeyFromTimestamp(timestamp?: number): string {
  if (!timestamp) return '2020-01';
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Calculates dues for a resident in a specific month, recursively resolving arrears
 * from previous months, while allowing manual intervention (override) by the treasurer.
 */
export function calculateResidentDues(
  resident: Resident,
  monthKey: string,
  monthlyRecords: Record<string, Record<string, MonthlyDuesRecord>>,
  depth: number = 0,
  maxDepth: number = 24
): ResidentDuesCalculation {
  const iuranBulanIni = resident.monthlyFee || 0;
  const currentRecord = monthlyRecords[monthKey]?.[resident.id];
  const status: IuranStatus = currentRecord ? currentRecord.status : 'Terutang';

  // 1. Calculate automatic arrears by recursing to previous months
  let autoCalculatedArrears = 0;

  if (depth < maxDepth) {
    const prevMonthKey = getPreviousMonthKey(monthKey);
    const prevRecord = monthlyRecords[prevMonthKey]?.[resident.id];
    const residentCreatedMonth = getMonthKeyFromTimestamp(resident.createdAt);

    if (prevRecord) {
      if (prevRecord.status === 'Terutang') {
        // Previous month was unpaid -> Roll over the total kewajiban of previous month
        const prevCalc = calculateResidentDues(
          resident,
          prevMonthKey,
          monthlyRecords,
          depth + 1,
          maxDepth
        );
        autoCalculatedArrears = prevCalc.totalKewajiban;
      } else {
        // Previous month was marked Lunas -> Arrears completely cleared!
        autoCalculatedArrears = 0;
      }
    } else {
      // No explicit record saved for previous month.
      // If resident was already registered in or before that month, they owe that month's dues
      if (prevMonthKey >= residentCreatedMonth) {
        const prevCalc = calculateResidentDues(
          resident,
          prevMonthKey,
          monthlyRecords,
          depth + 1,
          maxDepth
        );
        autoCalculatedArrears = prevCalc.totalKewajiban;
      } else {
        autoCalculatedArrears = 0;
      }
    }
  }

  // 2. Check for manual intervention (override) for the current month
  const isManualArrears = currentRecord?.manualArrears !== undefined && currentRecord.manualArrears !== null;
  const tunggakanBulanLalu = isManualArrears
    ? Math.max(0, currentRecord!.manualArrears!)
    : autoCalculatedArrears;

  const totalKewajiban = iuranBulanIni + tunggakanBulanLalu;
  const sisaKewajiban = status === 'Lunas' ? 0 : totalKewajiban;

  return {
    resident,
    monthKey,
    iuranBulanIni,
    tunggakanBulanLalu,
    isManualArrears,
    autoCalculatedArrears,
    totalKewajiban,
    status,
    sisaKewajiban,
    record: currentRecord,
  };
}

/**
 * Calculates dues for all residents for a target month
 */
export function calculateAllResidentsDues(
  residents: Resident[],
  monthKey: string,
  monthlyRecords: Record<string, Record<string, MonthlyDuesRecord>>
): ResidentDuesCalculation[] {
  return residents.map((resident) =>
    calculateResidentDues(resident, monthKey, monthlyRecords)
  );
}
