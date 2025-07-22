const express = require('express');

//making a server through express and making 5 jokes
const app = express();
const jokes = [
    {
        id: 1,
        title: "Atoms",
        content: "Why don't scientists trust atoms? Because they make up everything!"
    },
    {
        id: 2,
        title: "Scarecrow",
        content: "Why did the scarecrow win an award? Because he was outstanding in his field!"
    },
    {
        id: 3,
        title: "Skeletons",
        content: "Why don't skeletons fight each other? They don't have the guts!"
    },
    {
        id: 4,
        title: "Impasta",
        content: "What do you call fake spaghetti? An impasta!"
    },
    {
        id: 5,
        title: "Bicycle",
        content: "Why did the bicycle fall over? Because it was two-tired!"
    }
];
app.get('/', (req, res) => {
    res.send('navigate to /jokes for amzing jokes');
});
app.get('/api/jokes', (req, res) => {
    res.json(jokes);
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});