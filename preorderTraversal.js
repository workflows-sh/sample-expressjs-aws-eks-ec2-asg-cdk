function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;
}

function preorderTraversal(root) {
  let result = [];
  if (root !== null) {
    result.push(root.val);
    preorderTraversal(root.left);
    preorderTraversal(root.right);
  }
  return result;
}