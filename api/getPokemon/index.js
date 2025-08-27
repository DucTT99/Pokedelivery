const axios = require('axios');

const buildInPokemon = {
    marcus: {
        name: 'MARCUS',
        id: 42,
        height: 999999,
        weight: 999999,
        base_experience: 999999,
        types: ['everything', 'and', 'more'],
        favoriteFood: 'coffee'
    }
};

const costumePokemon = {}; // In-memory store, nur solange Prozess läuft

module.exports = async function (context, req) {
    const name =
        (req && req.params && req.params.name) ||
        (context && context.bindingData && context.bindingData.name) ||
        (req && req.query && req.query.name) ||
        'pikachu';

    const sushiPreferences = {
        electric: 'Salmon',
        fire: 'Tuna',
        water: 'Mackerel',
        grass: 'Avocado Roll',
        psychic: 'Tamago',
        rock: 'Cucumber',
        ground: 'Daikon',
        ice: 'Surimi',
        dragon: 'Unagi',
        dark: 'Squid',
        fairy: 'Strawberry Mochi',
        bug: 'Edamame',
        poison: 'Wasabi',
        ghost: 'Ghost Algae',
        steel: 'Sesame Roll',
        fighting: 'Protein Roll',
        flying: 'Airy Rice Ball',
        normal: 'Classic Nigiri'
    };

    try {
        if (req.method === 'POST') {
            const body = req.body || {};
            const pokeName = body.name || name;

            if (!pokeName) {
                context.res = {
                    status: 400,
                    body: { error: "Please provide a Pokémon name in the request body." }
                };
                return;
            }

            const types = body.types || [];
            const favoriteFood = body.favoriteFood || (types[0] ? sushiPreferences[types[0]] : 'Maki Roll');

            const newPokemon = {
                name: pokeName,
                id: body.id || Date.now(),
                height: body.height || 0,
                weight: body.weight || 0,
                base_experience: body.base_experience || 0,
                types: types,
                favoriteFood: favoriteFood
            };

            costumePokemon[pokeName.toLowerCase()] = newPokemon;

            context.res = {
                status: 201,
                body: { message: "Pokemon created", data: newPokemon }
            };
            return;
        }

        if (req.method === 'GET') {
            const lowerName = name.toLowerCase();

            if (costumePokemon[lowerName]) {
                context.res = {
                    status: 200,
                    body: costumePokemon[lowerName]
                };
                return;
            }

            if (buildInPokemon[lowerName]) {
                context.res = {
                    status: 200,
                    body: buildInPokemon[lowerName]
                };
                return;
            }

            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const data = response.data;

            const types = data.types.map(t => t.type.name);
            const favoriteFood = sushiPreferences[types[0]] || 'Maki Roll';

            const result = {
                name: data.name,
                id: data.id,
                height: data.height,
                weight: data.weight,
                base_experience: data.base_experience,
                types: types,
                favoriteFood: favoriteFood
            };

            context.res = {
                status: 200,
                body: result
            };
        }
    } catch (err) {
        context.res = {
            status: 500,
            body: { error: `Error: ${err.message}` }
        };
    }
};