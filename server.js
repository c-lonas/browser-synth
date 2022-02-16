const express = require('express')
const app = express()

app.use(express.static('public/'))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')

})




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});