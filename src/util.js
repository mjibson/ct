const alcohols = {
	brandy: ['cognac'],
	'sparkling wine': ['champagne', 'prosecco'],
	'fruit brandy': ['calvados', 'apricot brandy', 'kirsch'],
	'fortified wine': ['port', 'dry vermouth', 'sweet vermouth'],
	gin: ['sloe gin'],
	rum: ['white rum', 'gold rum', 'dark rum'],
	tequila: [],
	'triple sec': ['cointreau'],
	vodka: ['vodka citron'],
	whiskey: ['rye', 'bourbon', 'scotch', 'irish whiskey'],
	cachaça: [],
	wine: ['white wine'],

	aperitif: ['lillet blonde', 'aperol', 'campari'],
	liqueur: [
		'crème de menthe',
		'dom bénédictine',
		'cherry liqueur',
		'schnapps',
		'drambuie',
		'curaçao',
		'crème de cacao',
		'brown crème de cacao',
		'white crème de menthe',
		'crème de menthe',
		'crème de cassis',
		'crème de mûre',
		'crème de violette',
		'raspberry liqueur',
		'amaretto',
		'grand marnier',
		'baileys irish cream',
		'galliano',
		'maraschino liqueur',
		'orange curaçao',
		'peach schnapps',
	],
	spirit: ['absinthe', 'pisco'],
	'coffee liqueur': ['kahlúa'],
	bitters: [
		'angostura bitters',
		'orange bitters',
		'peach bitters',
		"peychaud's bitters",
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
