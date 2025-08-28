/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import type { IFloorOnlyData, IFloorOnlyItem } from './getArchiFloorOnly';

function getPropLevel(item: IFloorOnlyItem): number | undefined {
  const levelProp = item.properties.find((p) => p.name === 'level');
  return levelProp ? Number(levelProp.value) : undefined;
}

/**
 * put the structures in each floors
 * @export
 * @param {IFloorOnlyData} data
 */
export function getLevelsWithAssignedStructures(
  data: IFloorOnlyData
): IFloorOnlyItem[] {
  const { levels, structures } = data;

  // Assign structures to their respective levels
  for (const level of levels) {
    level.children = structures.filter((s) => getPropLevel(s) === level.dbId);
  }

  console.log('getLevelsWithAssignedStructures =', levels);
  return levels;
}
