const express = require('express')
var path = require('path');
const { TreeNode, preorderTraversal } = require('./preorderTraversal')

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'

// !* Edit here for demos
const RELEASE_NO = 'PROD-190'

const api = express()

api.set('views', path.join(__dirname, 'views'));
api.set('view engine', 'pug');

api.use(express.static(path.join(__dirname, 'public')));

api.get('/', (req, res) => {
  // Create a binary tree
  //     1
  //    / \
  //   2   3
  //  / \
  // 4   5
  let root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.right = new TreeNode(3);
  root.left.left = new TreeNode(4);
  root.left.right = new TreeNode(5);

  // Call preorderTraversal with the root node
  let result = preorderTraversal(root);
  res.render('index', {
    release_no: RELEASE_NO,
    orderedNodes: result
  })
})

api.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  process.exit(0);
})
