

const getPokemon = require('./index');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const context = {
    res: null
};

const req = {
    query: {
        name: 'pikachu'
    }
};

getPokemon(context, req).then(() => {
    console.log('Response:', context.res);
}).catch(err => {
    console.error('Error:', err);
});
