const app = require('./app')
const PORT = 3000

app.listen(PORT, (error) => {
    if (!error) {
        console.log('Server running on port ' + PORT);
    } else {
        console.log('Error starting server', error);
    }
});