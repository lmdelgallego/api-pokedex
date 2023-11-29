import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto, UpdatePokemonDto } from './dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = this.configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.trim().toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleError(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
    }
    // MondoID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }
    // MongoName
    if (!pokemon)
      pokemon = await this.pokemonModel.findOne({
        name: term.trim().toLocaleLowerCase(),
      });

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no '${term}' not found`,
      );
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term);
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name
          .trim()
          .toLocaleLowerCase();
      }

      await pokemon.updateOne(updatePokemonDto);

      return {
        ok: true,
        message: `Pokemon updated successfully`,
        pokemon: {
          ...pokemon.toJSON(),
          ...updatePokemonDto,
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(
    id: string,
  ): Promise<{ ok?: boolean; message?: string; result?: any }> {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // this.pokemonModel.findByIdAndDelete(id);
    // const result = await this.pokemonModel.findByIdAndDelete(id);

    const { deletedCount } = await this.pokemonModel.deleteOne({
      _id: id,
    });

    if (deletedCount === 0) {
      throw new NotFoundException(`Pokemon with id '${id}' not found`);
    }

    return {
      ok: true,
      message: `Pokemon deleted successfully ${id}`,
    };
  }

  private handleError(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists - ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Error creating pokemon - Check server logs for more details`,
    );
  }
}
