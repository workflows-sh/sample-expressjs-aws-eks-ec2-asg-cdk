function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;
}

function preorderTraversal(root) {
  let result = [];

  function traverse(node) {
    if (node === null) return;
    result.push(node.val); // Visit the current node
    traverse(node.left);   // Traverse left subtree
    traverse(node.right);  // Traverse right subtree
  }

  traverse(root); // Start traversal from the root
  return result;
}

module.exports = {
  TreeNode,
  preorderTraversal
}