/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

export type Consumedfunction<T> = () => Promise<T>;
export async function consumeBatch<T>(
  promises: Consumedfunction<T>[],
  batchSize = 10,
  callBackProgress?: (index: number, total: number) => void
): Promise<T[]> {
  let index = 0;
  const result = [];
  while (index < promises.length) {
    let endIndex = index + batchSize;
    if (promises.length <= endIndex) endIndex = promises.length;
    const slice = promises.slice(index, endIndex);
    const resProm = await Promise.all(
      slice.map((e: Consumedfunction<T>): Promise<T> => e())
    );
    if (callBackProgress) callBackProgress(endIndex, promises.length);
    result.push(...resProm);
    index = endIndex;
  }
  return result;
}
