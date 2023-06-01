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

export function getFloorChildrenDbIdOfModel(
  model: Autodesk.Viewing.Model,
  floorNbr: number
): Promise<number[]> {
  const userFct = `function userFunction(pdb) {
    const result = new Set();
    let idCat = -1;
    pdb.enumAttributes(function (i, attrDef) {
      if (
        attrDef.name.toLowerCase() === 'level' &&
        attrDef.category === '__internalref__'
      ) {
        console.log("attrDef", attrDef);
        idCat = i;
      }
    });
    if (idCat === -1) return [];
    pdb.enumObjects(function (dbId) {
      pdb.enumObjectProperties(dbId, function (attrId, valId) {
        if (idCat !== attrId) return false;
        const value = pdb.getAttrValue(attrId, valId);
        if (${floorNbr} === value) {
                  console.log(dbId,attrId, value);
          result.add(dbId)
        };
        return true;
      });
    });

    return Array.from(result);
  }`;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return model.getPropertyDb().executeUserFunction(userFct);
}
