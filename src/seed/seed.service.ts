import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async executeSeed() {
    try {
      let itemsToInsert: { no: number; name: string }[] = [];
      const { data } = await this.axios.get<PokeResponse>(
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
