const express = require('express')
var path = require('path');

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'

// !* Edit here for demos
const RELEASE_NO = 'PROD-124'

const api = express()

api.set('views', path.join(__dirname, 'views'));
api.set('view engine', 'pug');

api.use(express.static(path.join(__dirname, 'public')));

api.get('/', (req, res) => {
  res.render('index', {
    release_no: RELEASE_NO
  })
})

/**
 * Represents a Cat object.
 */
class Cat {
    /**
     * Constructor for the Cat class.
     *
     * @param {string} name - The name of the cat.
     */
    constructor(name) {
        this.name = name;
    }

    /**
     * Makes the cat "meow".
     */
    meow() {
        console.log(`${this.name} says meow!`);
    }
}

/**
 * Creates a new Cat object with the given name.
 *
 * @param {string} name - The name of the cat.
 * @returns {Cat} The created Cat object.
 */
function makeCat(name) {
    return new Cat(name);
}

// Usage Example for makeCat function

const myCat = makeCat("Dot");
myCat.meow();  // Output: Dot says meow!

api.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
