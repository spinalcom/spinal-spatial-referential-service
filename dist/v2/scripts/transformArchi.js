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
exports.transformArchi = exports.parseUnit = void 0;
function parseUnit(str) {
    var _a;
    const data = (_a = /autodesk\.unit\.unit:(.+)-\d+\.\d+\.\d+/.exec(str)) === null || _a === void 0 ? void 0 : _a[1];
    return data ? data : str;
}
exports.parseUnit = parseUnit;
function returnNumberStr(value) {
    if (typeof value === 'number')
        return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    return value.toString();
}
function updatePropsUnitAndGetArea(props) {
    let res;
    for (const prop of props) {
        if (prop.name === 'area')
            res = prop;
        if (prop.dataTypeContext)
            prop.dataTypeContext = parseUnit(prop.dataTypeContext);
        if (typeof prop.value === 'number')
            prop.value = returnNumberStr(prop.value);
    }
    return res;
}
/**
 * calculate Area & parse unit type
 * @export
 * @param {IGetArchi} archi
 */
function transformArchi(archi) {
    for (const floorExtId in archi) {
        if (Object.prototype.hasOwnProperty.call(archi, floorExtId)) {
            const floorAchi = archi[floorExtId];
            let unitName = 'squareMeter';
            let floorArea = 0;
            for (const roomExtId in floorAchi.children) {
                if (Object.prototype.hasOwnProperty.call(floorAchi.children, roomExtId)) {
                    const roomAchi = floorAchi.children[roomExtId];
                    let roomArea = 0;
                    for (const roomRefExtId in roomAchi.children) {
                        if (Object.prototype.hasOwnProperty.call(roomAchi.children, roomRefExtId)) {
                            const roomRef = roomAchi.children[roomRefExtId];
                            const prop = updatePropsUnitAndGetArea(roomRef.properties);
                            if (prop) {
                                unitName = prop.dataTypeContext;
                                roomArea += parseFloat(prop.value);
                            }
                        }
                    }
                    let roomProp = updatePropsUnitAndGetArea(roomAchi.properties.properties);
                    if (!roomProp) {
                        roomProp = {
                            name: 'area',
                            value: returnNumberStr(roomArea),
                            dataTypeContext: unitName,
                        };
                        roomAchi.properties.properties.push(roomProp);
                    }
                    else {
                        roomProp.value = returnNumberStr(roomArea);
                    }
                    floorArea += roomArea;
                }
            }
            // update strutures
            for (const extid in floorAchi.structures) {
                if (Object.prototype.hasOwnProperty.call(floorAchi.structures, extid)) {
                    const { properties } = floorAchi.structures[extid];
                    updatePropsUnitAndGetArea(properties.properties);
                }
            }
            let floorProp = updatePropsUnitAndGetArea(floorAchi.properties.properties);
            if (!floorProp) {
                floorProp = {
                    name: 'area',
                    value: returnNumberStr(floorArea),
                    dataTypeContext: unitName,
                };
                floorAchi.properties.properties.push(floorProp);
            }
            else {
                floorProp.value = returnNumberStr(floorArea);
            }
        }
    }
}
exports.transformArchi = transformArchi;
//# sourceMappingURL=transformArchi.js.map