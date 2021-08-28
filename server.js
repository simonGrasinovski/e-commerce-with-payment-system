require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors({ origin: "*" }));
const stripe = require("stripe")(process.env.SECRET_KEY);

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

const storeItems = new Map([
    [1, { priceInCents: 14999, name: "Watch 1", 
    image: "https://raw.githubusercontent.com/simonGrasinovski/e-commerce-with-payment-system/master/public/images/Watch%201.jpg" }],
    [2, { priceInCents: 12999, name: "Watch 2",
    image: "https://raw.githubusercontent.com/simonGrasinovski/e-commerce-with-payment-system/master/public/images/Watch%202.jpg" }],
    [3, { priceInCents: 17999, name: "Watch 3",
    image: "https://raw.githubusercontent.com/simonGrasinovski/e-commerce-with-payment-system/master/public/images/Watch%203.jpg" }],
    [4, { priceInCents: 19999, name: "Watch 4",
    image: "https://raw.githubusercontent.com/simonGrasinovski/e-commerce-with-payment-system/master/public/images/Watch%204.jpg" }],
    [5, { priceInCents: 3999, name: "Bracelet 1",
    image: "https://raw.githubusercontent.com/simonGrasinovski/e-commerce-with-payment-system/master/public/images/Bracelet%201.jpg" }],
    [6, { priceInCents: 2999, name: "Bracelet 2",
    image: "https://raw.githubusercontent.com/simonGrasinovski/e-commerce-with-payment-system/master/public/images/Bracelet%202.jpg" }],
  ]);

app.get('/', (req, res) => {
    res.render('store.html');
});

app.get('/cancel', (req, res) => {
    res.render('cancel.html');
});

app.get('/success', (req, res) => {
    res.render('success.html');
});

app.post("/create-checkout-session", async (req, res) => {
try {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: req.body.items.map(item => {
        const itemId = parseInt(item.id);
        const storeItem = storeItems.get(itemId);
        return {
            price_data: {
                currency: "usd",
                product_data: {
                name: storeItem.name,
                images: [storeItem.image]
                },
                unit_amount: storeItem.priceInCents,
            },
            quantity: item.quantity,
            }
        }),
        success_url: "http://localhost:5500/success",
        cancel_url: "http://localhost:5500/cancel",
    })
    res.json({ url: session.url })
    } catch (e) {
    res.status(500).json({ error: e.message })
    }
});

app.listen(5500, () => console.log('server is listening on port 5500'));
