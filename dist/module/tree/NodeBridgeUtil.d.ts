import { INodeBridge } from './INodeBridge';
import { INode } from './INode';
/**
 * 树节点桥接工具类
 * 主要实现了桥接 {@field bridge} {@field bridgeTree} 和 {@field bridgeList} 三个函数，事实上桥接之后再转换相当于做了两遍，但就目前而言暂且只能如此了
 */
export declare class NodeBridgeUtil {
    /**
     * 桥接对象为标准的树结构
     * @param nodeBridge 桥接对象
     * @returns 代理函数
     */
    static bridge<T>({ id, parentId, child, path, }?: Partial<INodeBridge>): (node: T) => INode;
    /**
     * 桥接一棵完整的树
     * @param tree 树节点
     * @param nodeBridge 桥接对象
     * @returns 代理后的树对象
     */
    static bridgeTree<T>(tree: T, nodeBridge?: INodeBridge): INode;
    /**
     * 桥接一个树节点列表
     * @param list 树节点列表
     * @param nodeBridge 桥接对象
     * @returns 代理后的树节点列表
     */
    static bridgeList<T>(list: T[], nodeBridge?: INodeBridge): INode[];
}
/**
 * 导出一个 NodeBridgeUtil 的实例
 * @deprecated 已废弃，请直接使用类的静态函数
 */
export declare const nodeBridgeUtil: typeof NodeBridgeUtil;
//# sourceMappingURL=NodeBridgeUtil.d.ts.map