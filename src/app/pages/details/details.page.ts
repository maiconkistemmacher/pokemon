import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-details',
	templateUrl: 'details.page.html',
	styleUrls: ['details.page.scss'],
	standalone: true,
	imports: [
		CommonModule,
		HttpClientModule,
		IonicModule,
		RouterModule
	],
})
export class DetailsPage implements OnInit {
	pokemon: any;
	id: number = 0;
	backgroundColor = '';
	isPlaying: boolean = false;

	constructor(private route: ActivatedRoute, private http: HttpClient) { }

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			this.id = params['id'];
			if (this.id) {
				console.log(params);
				this.backgroundColor = params['backgroundColor'];
				this.loadPokemon();
			}
		});
	}

	loadPokemon() {
		this.http.get(`https://pokeapi.co/api/v2/pokemon/${this.id}`)
			.subscribe((data: any) => {
				this.pokemon = {
					name: data.name,
					image: data.sprites.other['official-artwork'].front_default,
					// gif: `assets/pokemons/poke_${this.id}.gif`,
					height: data.height,
					weight: data.weight,
					types: data.types.map((t: any) => ({
						name: t.type.name,
						image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/${t.type.url.split('/').slice(-2, -1)[0]}.png`
					})),
					abilities: data.abilities.map((a: any) => a.ability.name),
					audio: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${this.id}.ogg`,
					abilityDescriptions: {}
				};

				// Carregar a descrição de todas as habilidades
				data.abilities.forEach((ability: any) => this.loadAbility(ability.ability.name));

				this.playAudio();
			});
	}

	// Carregar a descrição da habilidade
	loadAbility(abilityName: string) {
		this.http.get(`https://pokeapi.co/api/v2/ability/${abilityName}`)
			.subscribe((data: any) => {
				const description = data.effect_entries.find((entry: any) => entry.language.name === 'en')?.effect || '';
				this.pokemon.abilityDescriptions[abilityName] = description;
			});
	}

	// Tocar o áudio
	playAudio() {
		if (!this.pokemon?.audio) return;

		this.isPlaying = true;

		const audio = new Audio(this.pokemon.audio);
		audio.play()
			.then(() => {
				setTimeout(() => this.isPlaying = false, 1000);
			})
			.catch(err => {
				console.error('Erro ao tentar tocar o áudio:', err);
				this.isPlaying = false;
			});
	}
}
