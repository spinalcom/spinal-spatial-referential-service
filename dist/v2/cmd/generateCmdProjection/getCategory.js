"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategory = void 0;
function getCategory(props) {
    for (const prop of props.properties) {
        if (prop.attributeName === 'Category' &&
            prop.displayCategory === '__category__') {
            return prop;
        }
    }
}
exports.getCategory = getCategory;
//# sourceMappingURL=getCategory.js.map