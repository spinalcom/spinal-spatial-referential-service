/**
 * obj = blue
 * roomSelect = yellow
 * if validId; valid = green & parent = red
 * else parent = green
 * @export
 * @param {number} dbid
 * @param {string} bimFileId
 * @param {string} [roomId]
 * @param {string} [parentValidId]
 * @param {string} [parentNodeId]
 */
export declare function viewDataAssignInViewer(dbid: number, bimFileId: string, roomId?: string, parentValidId?: string, parentNodeId?: string): Promise<void>;
export declare function clearThemingColors(): void;
