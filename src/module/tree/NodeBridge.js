/**
 * 桥接对象为标准的树结构 {@link INode}
 */
export class INodeBridge {
  /**
   * 构造函数
   * @param {Object} [options] 桥接对象
   * @param {String} [options.id='id'] 树结点的 id 属性名
   * @param {String} [options.parentId='parentId'] 树结点的父节点 id 属性名
   * @param {String} [options.child='child'] 树结点的子节点数组属性名
   * @param {String} [options.path='path'] 树结点的全路径属性名
   * @param {Array.<Object>} [options.args] 其他参数
   */
  static bridge ({
    id = 'id',
    parentId = 'parentId',
    child = 'child',
    path = 'path',
    ...args
  } = {}) {
    /**
     * @field 树结点的 id 属性名
     */
    this.id = id
    /**
     * @field 树结点的父节点 id 属性名
     */
    this.parentId = parentId
    /**
     * @field 树结点的子节点数组属性名
     */
    this.child = child
    /**
     * @field 树结点的全路径属性名
     */
    this.path = path
    Object.assign(this, args)
  }
}