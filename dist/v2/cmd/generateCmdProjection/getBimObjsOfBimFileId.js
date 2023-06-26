"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBimObjsOfBimFileId = void 0;
const utils_1 = require("../../utils");
const Constant_1 = require("../../../Constant");
function getBimObjsOfBimFileId(dico, bimFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const _bimObjs = dico[bimFileId];
        if (_bimObjs)
            return _bimObjs;
        const bimContext = yield (0, utils_1.getBimContextByBimFileId)(bimFileId);
        const bimObjs = yield bimContext.getChildren(Constant_1.GEO_EQUIPMENT_RELATION);
        dico[bimFileId] = bimObjs;
        return bimObjs;
    });
}
exports.getBimObjsOfBimFileId = getBimObjsOfBimFileId;
//# sourceMappingURL=getBimObjsOfBimFileId.js.map