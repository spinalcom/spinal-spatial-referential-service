"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLevelsWithAssignedStructures = getLevelsWithAssignedStructures;
function getPropLevel(item) {
    const levelProp = item.properties.find((p) => p.name === 'level');
    return levelProp ? Number(levelProp.value) : undefined;
}
/**
 * put the structures in each floors
 * @export
 * @param {IFloorOnlyData} data
 */
function getLevelsWithAssignedStructures(data) {
    const { levels, structures } = data;
    // Assign structures to their respective levels
    for (const level of levels) {
        level.children = structures.filter((s) => getPropLevel(s) === level.dbId);
    }
    // remove level with no structures
    const filteredLevels = levels.filter((level) => level.children && level.children.length > 0);
    console.log('getLevelsWithAssignedStructures =', filteredLevels);
    return filteredLevels;
}
//# sourceMappingURL=getLevelsWithAssignedStructures.js.map