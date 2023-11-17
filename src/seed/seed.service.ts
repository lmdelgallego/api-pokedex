import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    try {
      await this.pokemonModel.deleteMany({});
      let itemsToInsert: { no: number; name: string }[] = [];
      const data = await this.http.get<PokeResponse>(
        'https://pokeapi.co/api/v2/pokemon?limit=650',
      );
      // data.results.forEach(async ({ name, url }) => {
      //   const no: number = +url.split('/')[6];
      //   await this.pokemonModel.create({ no, name });
      // });

      itemsToInsert = data.results.map(({ name, url }) => {
        const no: number = +url.split('/')[6];
        return { no, name };
      });

      await this.pokemonModel.insertMany(itemsToInsert);
    } catch (error) {
      console.log(error);
    }
    return 'Seed completed';
  }
}
