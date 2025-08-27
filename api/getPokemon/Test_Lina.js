const getPokemon = require('./index');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const context = {
    res: null
};

const req = {
    method: 'POST',
    body: {
        name: 'testachu',
        id: 12345,
        height: 10,
        weight: 20,
        base_experience: 50,
        types: ['electric']
    }
};

getPokemon(context, req).then(() => {
    console.log('Response:', context.res);
}).catch(err => {
    console.error('Error:', err);
});