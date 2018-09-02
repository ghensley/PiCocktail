const express = require("express")
const bodyParser = require('body-parser')
const gpio = require('rpi-gpio');

const MULIPLIER = 1500 

const app = express();
app.use(bodyParser.json());

const INGREDIENTS = "ingredients";
const ingredients = {
	"Whiskey": {
		description: "Smooth and flavorful"
	},
	"Gin": {
		"description": "Light and flowery"
	},
	"Sweet Vermouth": {
		"description": "Like wine but more"
	}
}

const pins [null, null, 16, 22, 23, null]

const slots = [null, null, "Whiskey", "Gin", "Sweet Vermouth", null]

for (let i=0; i< pins.length; i++) {
	gpio.setup(pins[i], gpio.DIR_HIGH, gpioCallback)
}

function gpioCallback(err) {
    if (err) throw err;
}

app.get("/ingredients", (req, res) => {
	res.send(ingredients);
})

app.post("/ingredient", (req, res) => {
	if (!req.body || !req.body.ingredient || !typeof(req.body.ingredient) === "string") {
		throw new Error("Need an ingredient name");
	}
	ingredients[req.body.ingredient] = {
		description: req.body.description
	}
	res.send(ingredients);
});

app.get("/slots", (req, res) => {
	res.send(slots)
})

app.post("/slot", (req, res) => {
	if (!req.body || !req.body.ingredient || !req.body.slot || !typeof(req.body.ingredient) === "number" || !typeof(req.body.slot) === "number") {
		throw new Error("You did something wrong");
	}
	if (req.body.slot < 0 || req.body.slot > slots.length) {
		throw new Error("Don't have that slot")
	}
	if (!(req.body.ingredient in ingredients)) {
		throw new Error("Don't have that ingredient")
	}
	slots[req.body.slot] = req.body.ingredient
	res.send(slots)
})


app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.post("/make", (req, res) => {
	/*
	{ 
		"Whiskey": 1.5,
		"Sweet Vermouth": 0.5
	}
	*/

	// Make sure we hae everything
	console.log(Object.keys(req.body))
	Object.keys(req.body).forEach(ingredient => {
		console.log(ingredient)
		if (slots.indexOf(ingredient) < 0) {
			throw new Error("Ingredient not available! Did you set it to a slot?")
		} 
	})

	let result = [];

	Object.keys(req.body).forEach(ingredient => {
		// TODO: gpio things
		const ingredientSlot = slots.indexOf(ingredient)
		const ingredientName = ingredient
		const ingredientAmount = req.body[ingredientName]
		result.push(`Pouring ${ingredientAmount} oz of ${ingredientName} out of slot ${ingredientSlot}`)
		gpio.write(slots[ingredientSlot], false)
		setTimeout(() => {
			gpio.write(slots[ingredientSlot], true)
		}, ingredientAmount * MULIPLIER)
	})

	res.send(result);

})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
