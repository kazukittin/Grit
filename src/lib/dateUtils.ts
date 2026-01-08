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
 */
export function getTodayString(): string {
    return getLocalDateString(new Date());
}
