import type { SpinalContext } from 'spinal-model-graph';
import type { Lst } from 'spinal-core-connectorjs';
import type { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
import type { ProjectionGroupModel } from '../projectionModels/ProjectionGroupModel';
import type { ProjectionItemModel } from '../projectionModels/ProjectionItemModel';
export declare function getConfigFromContext(context: SpinalContext, item: ProjectionGroupConfig, updateName?: boolean): Promise<Lst<ProjectionGroupModel | ProjectionItemModel>>;
