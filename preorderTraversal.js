function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;
}

function preorderTraversal(root) {
  let result = [];
  if (root !== null) {
    result.push(root.val);
    result = result.concat(preorderTraversal(root.left));
    result = result.concat(preorderTraversal(root.right));
  }
  return result;
}

module.exports = {
  TreeNode,
  preorderTraversal
}
