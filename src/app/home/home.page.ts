import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
	standalone: true,
	imports: [
		CommonModule,
		HttpClientModule,
		IonicModule,
		RouterModule
	],
})
export class HomePage implements OnInit {
	pokemons: any[] = [];
	allPokemons: any[] = [];
	searchTerm: string = '';
	loading: boolean = false;
	page: number = 1;
	limit: number = 20;
	maxPokemons: number = 151;

	constructor(private http: HttpClient, private router: Router) { }

	async ngOnInit() {
		if (this.loading || this.pokemons.length >= this.maxPokemons) return; // Impede a busca se já atingiu o limite
		this.loading = true;
		await this.loadPokemons();
	}

	// Método para carregar pokémons
	loadPokemons(event?: any) {
		this.http.get<any>(`https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${(this.page - 1) * this.limit}`)
			.subscribe({
				next: async response => {

					const availablePokemons = response.results.slice(0, this.maxPokemons - this.pokemons.length);

					const newPokemons = await Promise.all(availablePokemons.map(async (poke: any, index: number) => {
						const pokeId = this.pokemons.length + index + 1;

						// Carregar os detalhes
						const pokemonDetails = await this.http.get<any>(poke.url).toPromise();

						// Obter os tipos
						const types = pokemonDetails.types.map((typeInfo: any) => typeInfo.type.name);

						// Associa as cores com base no tipo
						const backgroundColor = this.getBackgroundColorForType(types);

						return {
							name: poke.name,
							id: pokeId,
							image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokeId}.svg`,
							types: types,
							backgroundColor: backgroundColor
						};
					}));

					this.pokemons = [...this.pokemons, ...newPokemons];
					this.allPokemons = [...this.pokemons];
					this.loading = false;

					if (this.pokemons.length >= this.maxPokemons) {
						event.target.disabled = true;
					}

					if (event) {
						event.target.complete();
					}
				},
				error: (err) => {
					console.error('Erro ao carregar Pokémons:', err);
					this.loading = false;
				}
			});
	}

	// Retornar a cor de fundo com base no tipo do Pokémon
	getBackgroundColorForType(types: string[]): string {
		const typeColors: { [key: string]: string } = {
			fighting: '#ce3f6a',
			psychic: '#f97077',
			poison: '#ab6ac8',
			dragon: '#096dc3',
			ghost: '#5269ab',
			dark: '#595365',
			ground: '#d97746',
			fire: '#fe9c53',
			fairy: '#ec8fe7',
			water: '#4d90d5',
			flying: '#8fa8de',
			normal: '#9098a2',
			rock: '#c6b889',
			electric: '#f4d23b',
			bug: '#90c02c',
			grass: '#63bb5c',
			ice: '#73cebf',
			steel: '#5a8fa1',
		};

		const type = types[0];
		return typeColors[type] || '#FFFFFF';
	}

	// Busca
	search(event: any) {
		const term = event.target.value.toLowerCase();
		if (term === '') {
			// Se o campo de busca estiver vazio, restaura a lista completa
			this.pokemons = [...this.allPokemons];
		} else {
			// Filtra a lista com base no termo de busca
			this.pokemons = this.allPokemons.filter(pokemon =>
				pokemon.name.toLowerCase().includes(term)
			);
		}
	}

	// Rolagem
	loadData(event: any) {
		this.page++;
		this.loadPokemons(event);
	}

	// Abrir detalhes
	openDetails(pokemon: any) {
		this.router.navigate(['/details'], { queryParams: { id: pokemon.id, backgroundColor: pokemon.backgroundColor } });
	}
}