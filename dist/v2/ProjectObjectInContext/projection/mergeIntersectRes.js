"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeIntersectRes = void 0;
function mergeIntersectRes(target, item) {
    for (const itemInter of item.intersects) {
        const targetInter = target.intersects.find((t) => {
            return (t.origin.modelId === itemInter.origin.modelId &&
                t.origin.dbId === itemInter.origin.dbId);
        });
        if (!targetInter) {
            target.intersects.push(itemInter);
        }
        else if (itemInter.intersections.distance > targetInter.intersections.distance) {
            targetInter.intersections.dbId = itemInter.intersections.dbId;
            targetInter.intersections.distance = itemInter.intersections.distance;
            targetInter.intersections.modelId = itemInter.intersections.modelId;
        }
    }
    for (const itemSelect of item.selection) {
        const targetSelect = target.selection.find((t) => {
            return t.model === itemSelect.model;
        });
        if (!targetSelect) {
            target.selection.push(itemSelect);
        }
        else {
            for (const objDbId of itemSelect.dbId) {
                if (!targetSelect.dbId.find((tDbId) => tDbId.dbId === objDbId.dbId)) {
                    targetSelect.dbId.push(objDbId);
                }
            }
        }
    }
}
exports.mergeIntersectRes = mergeIntersectRes;
//# sourceMappingURL=mergeIntersectRes.js.map