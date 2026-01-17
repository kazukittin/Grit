/**
 * 日が切り替わる時刻（午前4時）
 * 午前0時〜3時59分は「前日」として扱う
 */
const DAY_CUTOFF_HOUR = 4;

/**
 * 午前4時を基準にした「実効的な日付」を取得
 * 午前0時〜3時59分の間は前日として扱う
 */
export function getEffectiveDate(date: Date = new Date()): Date {
    const effectiveDate = new Date(date);
    if (effectiveDate.getHours() < DAY_CUTOFF_HOUR) {
        // 午前4時前の場合は1日前として扱う
        effectiveDate.setDate(effectiveDate.getDate() - 1);
    }
    return effectiveDate;
}

/**
 * 午前4時を基準にした「実効的な曜日」を取得 (0=日曜日, 6=土曜日)
 * 午前0時〜3時59分の間は前日の曜日として扱う
 */
export function getEffectiveDayOfWeek(date: Date = new Date()): number {
    return getEffectiveDate(date).getDay();
}

/**
 * ローカルタイムゾーンで今日の日付を YYYY-MM-DD 形式で取得
 * toISOString() はUTCを返すため、日本時間の午前0時〜9時の間は「昨日」になってしまう問題を解決
 */
export function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 今日の日付をローカルタイムゾーンで取得
 * 午前4時を基準に日が切り替わる
 */
export function getTodayString(): string {
    return getLocalDateString(getEffectiveDate(new Date()));
}
