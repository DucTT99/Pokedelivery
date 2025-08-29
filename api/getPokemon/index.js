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
    karan: { name: 'KARAN', id: 101, height: 10, weight: 10, base_experience: 10000, types: ['focus', 'strategy'], favoriteFood: 'Haribo' },
    eren: { name: 'EREN', id: 102, height: 10, weight: 10, base_experience: 10000, types: ['determination', 'storm'], favoriteFood: 'Bounty' },
    fatih: { name: 'FATIH', id: 103, height: 10, weight: 10, base_experience: 10000, types: ['shield', 'wisdom'], favoriteFood: 'Pickup' },
    duc: { name: 'DUC', id: 104, height: 10, weight: 10, base_experience: 10000, types: ['speed', 'tech'], favoriteFood: 'Ferrero' },
    jessica: { name: 'JESSICA', id: 105, height: 10, weight: 10, base_experience: 10000, types: ['light', 'grace'], favoriteFood: 'Knoppers' },
    matthias: { name: 'MATTHIAS', id: 106, height: 10, weight: 10, base_experience: 10000, types: ['logic', 'earth'], favoriteFood: 'Kinderriegel' },
    monika: { name: 'MONIKA', id: 107, height: 10, weight: 10, base_experience: 10000, types: ['calm', 'nature'], favoriteFood: 'Balisto' },
    steffen: { name: 'STEFFEN', id: 108, height: 10, weight: 10, base_experience: 10000, types: ['fire', 'focus'], favoriteFood: 'Twix' },
    pascal: { name: 'PASCAL', id: 109, height: 10, weight: 10, base_experience: 10000, types: ['code', 'precision'], favoriteFood: 'Jelly Beans' },
    jonas: { name: 'JONAS', id: 110, height: 10, weight: 10, base_experience: 10000, types: ['vision', 'lead'], favoriteFood: 'Rittersport' },
    edit: { name: 'EDIT', id: 111, height: 10, weight: 10, base_experience: 10000, types: ['clarity', 'support'], favoriteFood: 'Snickers' },
    alisan: { name: 'ALISAN', id: 112, height: 10, weight: 10, base_experience: 10000, types: ['energy', 'drive'], favoriteFood: 'Marshmallows' },
    hekuran: { name: 'HEKURAN', id: 113, height: 10, weight: 10, base_experience: 10000, types: ['steel', 'resolve'], favoriteFood: 'Haribo' },
    alexander: { name: 'ALEXANDER', id: 114, height: 10, weight: 10, base_experience: 10000, types: ['strategy', 'storm'], favoriteFood: 'Bounty' },
    juergen: { name: 'JUERGEN', id: 115, height: 10, weight: 10, base_experience: 10000, types: ['balance', 'earth'], favoriteFood: 'Pickup' },
    thomas: { name: 'THOMAS', id: 116, height: 10, weight: 10, base_experience: 10000, types: ['logic', 'focus'], favoriteFood: 'Ferrero' },
    mike: { name: 'MIKE', id: 117, height: 10, weight: 10, base_experience: 10000, types: ['spark', 'tech'], favoriteFood: 'Knoppers' },
    marina: { name: 'MARINA', id: 118, height: 10, weight: 10, base_experience: 10000, types: ['wave', 'grace'], favoriteFood: 'Kinderriegel' },
    markus: { name: 'MARKUS', id: 119, height: 10, weight: 10, base_experience: 10000, types: ['strength', 'focus'], favoriteFood: 'Balisto' },
    georg: { name: 'GEORG', id: 120, height: 10, weight: 10, base_experience: 10000, types: ['stone', 'wisdom'], favoriteFood: 'Twix' },
    ramzi: { name: 'RAMZI', id: 121, height: 10, weight: 10, base_experience: 10000, types: ['vision', 'fire'], favoriteFood: 'Jelly Beans' },
    ulf: { name: 'ULF', id: 122, height: 10, weight: 10, base_experience: 10000, types: ['ice', 'calm'], favoriteFood: 'Rittersport' },
    claus: { name: 'CLAUS', id: 123, height: 10, weight: 10, base_experience: 10000, types: ['air', 'clarity'], favoriteFood: 'Snickers' },
    boris: { name: 'BORIS', id: 124, height: 10, weight: 10, base_experience: 10000, types: ['storm', 'strength'], favoriteFood: 'Marshmallows' },
    tina: { name: 'TINA', id: 125, height: 10, weight: 10, base_experience: 10000, types: ['light', 'focus'], favoriteFood: 'Haribo' },
    svenF: { name: 'SVENF', id: 126, height: 10, weight: 10, base_experience: 10000, types: ['fire', 'logic'], favoriteFood: 'Bounty' },
    svenE: { name: 'SVENE', id: 127, height: 10, weight: 10, base_experience: 10000, types: ['earth', 'precision'], favoriteFood: 'Pickup' },
    dirk: { name: 'DIRK', id: 128, height: 10, weight: 10, base_experience: 10000, types: ['steel', 'focus'], favoriteFood: 'Ferrero' },
    mariam: { name: 'MARIAM', id: 129, height: 10, weight: 10, base_experience: 10000, types: ['grace', 'wisdom'], favoriteFood: 'Knoppers' },
    durga: { name: 'DURGA', id: 130, height: 10, weight: 10, base_experience: 10000, types: ['energy', 'light'], favoriteFood: 'Kinderriegel' },
    angelika: { name: 'ANGELIKA', id: 131, height: 10, weight: 10, base_experience: 10000, types: ['clarity', 'air'], favoriteFood: 'Balisto' }
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