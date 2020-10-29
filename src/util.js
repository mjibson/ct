const alcohols = {
	brandy: ['cognac'],
	'sparkling wine': ['champagne', 'prosecco'],
	'fruit brandy': ['calvados', 'apricot brandy', 'kirsch'],
	'fortified wine': ['port', 'dry vermouth', 'sweet vermouth'],
	gin: ['sloe gin', 'old tom gin', 'london dry gin'],
	rum: ['white rum', 'gold rum', 'dark rum'],
	tequila: ['reposado tequila'],
	mezcal: [],
	'orange liqueur': [
		'cointreau',
		'triple sec',
		'grand marnier',
		'orange curaçao',
		'curaçao',
	],
	'cherry liqueur': ['cherry heering', 'maraschino'],
	vodka: ['vodka citron'],
	whiskey: ['rye', 'bourbon', 'scotch', 'irish whiskey'],
	cachaça: [],
	wine: ['white wine'],

	aperitif: ['lillet blonde', 'aperol', 'campari'],
	digestif: ['fernet-branca'],
	liqueur: [
		'crème de menthe',
		'dom bénédictine',
		'schnapps',
		'drambuie',
		'crème de cacao',
		'brown crème de cacao',
		'white crème de menthe',
		'crème de menthe',
		'crème de cassis',
		'crème de mûre',
		'crème de violette',
		'raspberry liqueur',
		'amaretto',
		'baileys irish cream',
		'galliano',
		'peach schnapps',
		'green chartreuse',
		'yellow chartreuse',
		'lillet blanc',
		'allspice dram',
		'amaro montenegro',
		'bonal',
		'meletti amaro',
		'cocchi americano',
		'citron sauvage',
		'nonino amaro',
	],
	spirit: ['absinthe', 'pisco'],
	'coffee liqueur': ['kahlúa'],
	bitters: [
		'angostura bitters',
		'orange bitters',
		'peach bitters',
		"peychaud's bitters",
		'lime bitters',
		'tiki bitters',
		'hopped grapefruit bitters',
		'chocolate bitters',
	],
};

const allAlcohols = {};
const implies = {};
Object.keys(alcohols).forEach(k => {
	const v = alcohols[k];
	allAlcohols[k] = true;
	v.forEach(vv => {
		allAlcohols[vv] = true;
		if (!implies[vv]) {
			implies[vv] = [];
		}
		implies[vv].push(k);
	});
});

function isAlcohol(gred) {
	return allAlcohols[gred] === true;
}

function gredImplies(gred) {
	return implies[gred] || [];
}

export { gredImplies, isAlcohol };
