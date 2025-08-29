

const getPokemon = require('./index');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const context = {
    res: null
};

const req = {
    params: {
        name: 'pikachu'
    }
    method: 'GET',
};

getPokemon(context, req).then(() => {
    console.log('Response:', context.res);
}).catch(err => {
    console.error('Error:', err);
});
