import React, { Component } from 'react';
import 'tachyons/css/tachyons.min.css';
import './App.css';
import drinks from './drinks';

const allGreds = {};
Object.values(drinks).forEach(v =>
	v.ShortGreds.forEach(g => {
		allGreds[g] = (allGreds[g] || 0) + 1;
	})
);

const colClass = 'w-25';

class App extends Component {
	constructor(props) {
		const gredsByCount = Object.keys(allGreds);
		gredsByCount
			.sort((a, b) => {
				return allGreds[a] - allGreds[b];
			})
			.reverse();
		super(props);
		const have = JSON.parse(localStorage.getItem('have') || '{}');
		this.state = {
			allGreds: allGreds,
			gredsByCount: gredsByCount,
			have: have,
			make: [],
			could: [],
		};
	}
	componentDidMount() {
		this.update();
	}
	update = () => {
		const make = [];
		const could = [];
		Object.values(drinks).forEach(drink => {
			const missing = [];
			drink.ShortGreds.forEach(v => {
				if (!this.state.have[v]) {
					missing.push(v);
				}
			});
			if (!missing.length) {
				make.push(drink);
			} else if (
				missing.length <= 2 &&
				drink.ShortGreds.length > missing.length
			) {
				could.push(Object.assign({ missing: missing }, drink));
			}
		});
		make.sort((a, b) => a.Name.localeCompare(b.Name));
		could.sort((a, b) => {
			if (a.missing.length !== b.missing.length) {
				return a.missing.length - b.missing.length;
			}
			return a.Name.localeCompare(b.Name);
		});
		this.setState({ make: make, could: could });
	};
	clickGred = v => {
		const have = this.state.have;
		if (v.target.checked) {
			have[v.target.name] = true;
		} else {
			delete have[v.target.name];
		}
		localStorage.setItem('have', JSON.stringify(have));
		this.setState({ have: have }, this.update);
	};
	render() {
		const have = Object.keys(this.state.have)
			.sort()
			.map(v => (
				<li className="ma1" key={v}>
					<label>
						{v} ({this.state.allGreds[v]})
					</label>
				</li>
			));
		const greds = this.state.gredsByCount.map(v => (
			<li className="ma1" key={v}>
				<label>
					<input
						type="checkbox"
						name={v}
						onChange={this.clickGred}
						checked={!!this.state.have[v]}
					/>{' '}
					{v} ({this.state.allGreds[v]})
				</label>
			</li>
		));
		const make = this.state.make.map(v => (
			<div key={v.Name} className="ma2">
				<a href={v.Link}>{v.Name}</a>: {v.ShortGreds.join(', ')}
			</div>
		));
		const could = this.state.could.map(v => (
			<div key={v.Name} className="ma2">
				<a href={v.Link}>{v.Name}</a> ({v.missing.length}
				): {v.missing.join(', ')}
			</div>
		));
		return (
			<div className="sans-serif ma3 flex">
				<div className={colClass}>
					possible ingredients:
					<ul className="list">{greds}</ul>
				</div>
				<div className={colClass}>
					have:
					<ul className="list">{have}</ul>
				</div>
				<div className={colClass}>
					can make:
					<ul className="list indent-n2em">{make}</ul>
				</div>
				<div className={colClass}>
					could make (missing ingredients shown):
					<ul className="list">{could}</ul>
				</div>
			</div>
		);
	}
}

export default App;
