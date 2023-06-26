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

import type { ICmdNewAttr } from '../../interfaces/ICmdNew';
import type { SpinalNode } from 'spinal-model-graph';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { Val } from 'spinal-core-connectorjs';

export async function updateAttr(
  node: SpinalNode,
  attrs: ICmdNewAttr[]
): Promise<void> {
  if (!attrs || (attrs && attrs.length === 0)) return; // skip if nothing to update
  let cat = await attributeService.getCategoryByName(node, 'Spatial');
  if (!cat) {
    cat = await attributeService.addCategoryAttribute(node, 'Spatial');
  }
  const attrsFromNode = await attributeService.getAttributesByCategory(
    node,
    cat
  );
  for (const attr of attrs) {
    const attrFromNode = attrsFromNode.find(
      (itm) => itm.label.get() === attr.label
    );
    if (attrFromNode) {
      try {
        if (attrFromNode.value instanceof Val) {
          attrFromNode.mod_attr('value', attr.value);
        } else {
          attrFromNode.value.set(attr.value);
        }
      } catch (error) {
        console.error(error);
        console.log('err', node, {
          label: attrFromNode.label,
          value: attr.value,
        });
      }
      if (attr.unit) attrFromNode.unit.set(attr.unit);
    } else {
      attributeService.addAttributeByCategory(
        node,
        cat,
        attr.label,
        attr.value.toString(),
        '',
        attr.unit
      );
    }
  }
}
