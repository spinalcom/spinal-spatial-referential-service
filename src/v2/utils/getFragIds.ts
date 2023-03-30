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

export function getFragIds(
  dbId: number,
  model: Autodesk.Viewing.Model
): Promise<number[]> {
  const promise = (resolve, reject) => {
    const it = model.getInstanceTree();
    const ids: number[] = [];
    it.enumNodeFragments(
      dbId,
      (res) => {
        ids.push(res);
      },
      false
    );
    // wait 500ms or 1500ms if not yet done
    setTimeout(() => {
      if (ids.length === 0) {
        setTimeout(() => {
          if (ids.length === 0) {
            return reject();
          }
          resolve(ids);
        }, 1000);
        return;
      }
      resolve(ids);
    }, 500);
  };
  return new Promise(promise);
}
