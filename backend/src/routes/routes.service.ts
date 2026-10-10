import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RouteInput {
  number: number;
  name: string;
  color: string;
  distanceKm: number;
  durationMin: number;
  busCount: number;
  busNote?: string | null;
  frequencyMin: number;
  firstTrip: string;
  lastTrip: string;
  active?: boolean;
  departureTimes: string[];
  stops?: any[];
}

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, color?: string) {
    const where: any = {};
    if (search || color) {
      where.AND = [];
      if (search) {
        where.AND.push({
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { stops: { some: { name: { contains: search, mode: 'insensitive' } } } },
          ],
        });
      }
      if (color) where.AND.push({ color: color });
    }

    return this.prisma.route.findMany({
      where,
      orderBy: { number: 'asc' },
      include: { stops: { orderBy: [{ direction: 'asc' }, { order: 'asc' }] } },
    });
  }

  async findOne(number: number) {
    const route = await this.prisma.route.findUnique({
      where: { number },
      include: { stops: { orderBy: [{ direction: 'asc' }, { order: 'asc' }] } },
    });
    if (!route) throw new NotFoundException('ไม่พบสายรถนี้');
    return route;
  }

  private bangkokMinutes(): number {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
    return (g('hour') % 24) * 60 + g('minute') + g('second') / 60;
  }

  async live(number: number) {
    const route = await this.findOne(number);
    const stops = [...route.stops].sort((a, b) =>
      a.direction === b.direction
        ? a.order - b.order
        : a.direction === 'OUTBOUND'
          ? -1
          : 1,
    );
    const n = stops.length;
    const dur = route.durationMin;
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const sortedTimes = [...route.departureTimes].sort(
      (a, b) => toMin(a) - toMin(b),
    );
    const deps = sortedTimes.map(toMin);
    const now = this.bangkokMinutes();
    const offset = (i: number) => (n > 1 ? (i / (n - 1)) * dur : 0);

    const buses = deps
      .map((d, k) => ({ d, k }))
      .filter(({ d }) => now >= d && now <= d + dur)
      .map(({ d, k }) => {
        const progress = (now - d) / dur;
        const idx = Math.min(n - 1, Math.round(progress * (n - 1)));
        return {
          departedAt: sortedTimes[k],
          progress: Math.round(progress * 100),
          stopIndex: idx,
          stopName: stops[idx].name,
          direction: stops[idx].direction,
        };
      });

    const stopList = stops.map((s, i) => {
      const waits = deps.map((d) => d + offset(i) - now).filter((x) => x >= 0);
      return {
        id: s.id,
        name: s.name,
        direction: s.direction,
        order: s.order,
        nextArrivalMin: waits.length ? Math.ceil(Math.min(...waits)) : null,
        busHere: buses.some((b) => b.stopIndex === i),
      };
    });

    const nextIdx = deps.findIndex((d) => d > now);
    let status = 'RUNNING';
    if (!buses.length) {
      status =
        now < deps[0]
          ? 'NOT_STARTED'
          : now > deps[deps.length - 1] + dur
            ? 'ENDED'
            : 'WAITING';
    }

    return {
      route: { number: route.number, name: route.name, color: route.color },
      status,
      buses,
      nextDeparture:
        nextIdx >= 0
          ? {
              time: sortedTimes[nextIdx],
              inMin: Math.ceil(deps[nextIdx] - now),
            }
          : null,
      stops: stopList,
      estimated: true,
    };
  }

  async create(data: any) {
    try {
      const { stops, id, createdAt, updatedAt, ...routeData } = data;

      return await this.prisma.route.create({
        data: {
          ...routeData,
          stops:
            stops && stops.length > 0
              ? {
                  create: stops.map((stop: any, index: number) => ({
                    name: stop.name,
                    direction: stop.direction,
                    order: index + 1,
                    transferRoutes: stop.transferRoutes || [],
                  })),
                }
              : undefined,
        },
      });
    } catch (error) {
      console.error('🔥 Prisma Error (Create):', error);
      throw error;
    }
  }

  async update(id: any, data: any) {
    try {
      const { stops, id: routeId, createdAt, updatedAt, ...routeData } = data;

      return await this.prisma.route.update({
        where: { id: Number(id) },
        data: {
          ...routeData,
          stops: stops
            ? {
                deleteMany: {},
                create: stops.map((stop: any, index: number) => ({
                  name: stop.name,
                  direction: stop.direction,
                  order: index + 1,
                  transferRoutes: stop.transferRoutes || [],
                })),
              }
            : undefined,
        },
      });
    } catch (error) {
      console.error('🔥 Prisma Error (Update):', error);
      throw error;
    }
  }

  async remove(id: number) {
    await this.prisma.busStop.deleteMany({ where: { routeId: Number(id) } });
    return this.prisma.route.delete({ where: { id: Number(id) } });
  }

  addStop(
    routeId: number,
    data: {
      name: string;
      direction: string;
      order: number;
      transferRoutes?: number[];
    },
  ) {
    return this.prisma.busStop.create({
      data: {
        name: data.name,
        direction: data.direction,
        order: data.order,
        transferRoutes: data.transferRoutes ?? [],
        routeId: Number(routeId),
      },
    });
  }

  removeStop(stopId: number) {
    return this.prisma.busStop.delete({ where: { id: Number(stopId) } });
  }
}
