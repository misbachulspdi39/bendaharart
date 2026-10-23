import { Resident, MonthlyDuesRecord, IuranStatus } from '../types';
import { getPreviousMonthKey } from './format';

export interface ResidentDuesCalculation {
  resident: Resident;
  monthKey: string;
  iuranBulanIni: number;
  tunggakanBulanLalu: number;
  totalKewajiban: number;
  status: IuranStatus;
  sisaKewajiban: number;
  record?: MonthlyDuesRecord;
}

/**
 * Calculates dues for a resident in a specific month, recursively resolving arrears.
 * Limits recursion depth to prevent any circular loops.
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

  let tunggakanBulanLalu = 0;

  if (depth < maxDepth) {
    const prevMonthKey = getPreviousMonthKey(monthKey);
    const prevRecord = monthlyRecords[prevMonthKey]?.[resident.id];

    // If previous month has a recorded status
    if (prevRecord) {
      if (prevRecord.status === 'Terutang') {
        // Recursively compute previous month's total kewajiban
        const prevCalc = calculateResidentDues(
          resident,
          prevMonthKey,
          monthlyRecords,
          depth + 1,
          maxDepth
        );
        tunggakanBulanLalu = prevCalc.totalKewajiban;
      } else {
        // Previous month was marked Lunas -> Arrears cleared up to that month
        tunggakanBulanLalu = 0;
      }
    } else {
      // No explicit record found for previous month.
      // Check if there are ANY records for earlier months before assuming 0
      // To keep it predictable, an unrecorded previous month is treated as 0 arrears
      tunggakanBulanLalu = 0;
    }
  }

  const totalKewajiban = iuranBulanIni + tunggakanBulanLalu;
  const sisaKewajiban = status === 'Lunas' ? 0 : totalKewajiban;

  return {
    resident,
    monthKey,
    iuranBulanIni,
    tunggakanBulanLalu,
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
