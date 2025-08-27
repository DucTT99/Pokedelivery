const axios = require('axios');

const costumePokemon = {}; // In memory store nur solange Prozess läuft

module.exports = async function (context, req) {
    //const name = req.query.name || 'pikachu';
    const name = (req && req.params && req.params.name)  || (context && context.bindingData && context.bindingData.name) || (req && req.query && req.query.name) || 'pikachu';

    // Mapping of Pokémon types to their favorite sushi
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
        if (req.method == 'POST') {
            const body = req.body || {};
            const pokeName = body.name || name;

            if (!pokeName) {
                context.res = { status:400, body: { error: "Please provide a Pokémon name in the request body."} };

                
                return;
            }

            const types = body.types || [];
            const favoriteFood = body.favoriteFood || (types[0] ? sushiPreferences[types[0]] : undefined);
        

            const NewPokemon = {
                name: pokeName,
                id: body.id || Date.now(),
                height: body.height || 0,
                weight: body.weight || 0,
                base_experience: body.base_experience || 0,
                types: types,
                favoriteFood: favoriteFood 
            };

            custimePokemon[pokeName.toLowerCase()] = NewPokemon;

            context.res = {
                status: 201,
                body: {message: "pokemon created", data: NewPokemon}
            };
            return;
        }

        if (req.method == "GET"){
            if (costumePokemon[name]) {
                context.res = {
                    status: 200,
                    body: costumePokemon[name]
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
        } catch (err) {
            context.res = {
                status: 500,
                body: `Error: ${err.message}`
            };
        }
}
};
