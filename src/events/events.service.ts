import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReserveSpotDto } from './dto/reserve-spot.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SpotStatus, TicketStatus } from '@prisma/client';

type ReserveSpotInput = ReserveSpotDto & { eventId: string };

@Injectable()
export class EventsService {
  constructor(private prismaService: PrismaService) {}

  create(createEventDto: CreateEventDto) {
    return this.prismaService.event.create({
      data: { ...createEventDto, date: new Date(createEventDto.date) },
    });
  }

  findAll() {
    return this.prismaService.event.findMany();
  }

  findOne(id: string) {
    return this.prismaService.event.findUnique({ where: { id } });
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    const date = updateEventDto.date ? new Date(updateEventDto.date) : null;

    return this.prismaService.event.update({
      where: { id },
      data: date ? { ...updateEventDto, date } : updateEventDto,
    });
  }

  remove(id: string) {
    return this.prismaService.event.delete({ where: { id } });
  }

  async reserveSpot(input: ReserveSpotInput) {
    const spots = await this.prismaService.spot.findMany({
      where: {
        eventId: input.eventId,
        name: {
          in: input.spots,
        },
      },
    });

    if (spots.length !== input.spots.length) {
      const foundSpotsName = spots.map((spot) => spot.name);
      const notFoundSpots = input.spots.filter(
        (spotName) => !foundSpotsName.includes(spotName),
      );

      throw new Error(`Spots ${notFoundSpots.join(', ')} not found`);
    }

    try {
      const tickets = await this.prismaService.$transaction(
        async (prisma) => {
          await prisma.reservationHistory.createMany({
            data: spots.map((spot) => ({
              spotId: spot.id,
              ticketKind: input.ticket_kind,
              email: input.email,
              status: TicketStatus.reserved,
            })),
          });

          await prisma.spot.updateMany({
            where: {
              id: {
                in: spots.map((spot) => spot.id),
              },
            },
            data: {
              status: SpotStatus.reserved,
            },
          });

          return await Promise.all(
            spots.map((spot) =>
              prisma.ticket.create({
                data: {
                  spotId: spot.id,
                  ticketKind: input.ticket_kind,
                  email: input.email,
                },
              }),
            ),
          );
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
      );
      // Isolation level:
      // Only data that are already committed are readed

      return tickets;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
          case 'P2034':
            throw new Error('Some spots are already reserved');
        }
        throw error;
      }
    }
  }
}
