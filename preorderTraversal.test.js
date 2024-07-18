// This test checks if the preorderTraversal orders as expected

const { TreeNode, preorderTraversal } = require('./preorderTraversal');

test('should properly traver and order the binary tree nodes', async () => {
  // Arrange
  let root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.right = new TreeNode(3);
  root.left.left = new TreeNode(4);
  root.left.right = new TreeNode(5);
  // Act
  let result = preorderTraversal(root);
  // Assert
  expect(result).toStrictEqual([1,2,4,5,3])
});