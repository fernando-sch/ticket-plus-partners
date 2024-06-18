import { Injectable } from '@nestjs/common';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpotsService {
  constructor(private prismaService: PrismaService) {}

  create(createSpotDto: CreateSpotDto) {
    return 'This action adds a new spot';
  }

  findAll() {
    return `This action returns all spots`;
  }

  findOne(id: number) {
    return `This action returns a #${id} spot`;
  }

  update(id: number, updateSpotDto: UpdateSpotDto) {
    return `This action updates a #${id} spot`;
  }

  remove(id: number) {
    return `This action removes a #${id} spot`;
  }
}
