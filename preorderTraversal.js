const preorderTraversal = function (root, list = []) {
  if (!root) {
      return list;
  }

  list.push(root.val);

  preorderTraversal(root.left, list);
  preorderTraversal(root.right, list);

  return list;
};