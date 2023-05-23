import type { AuProps } from '../../interfaces/AuProps';
import type { IIntersectRes } from '../../interfaces/IIntersectRes';
import type { ICmdMissing } from '../../interfaces/ICmdMissing';
export declare function createCmdNotFound(intersectRes: IIntersectRes): Promise<ICmdMissing[]>;
export declare function createCmdNotFoundItm(target: ICmdMissing[], auProp: AuProps): void;
