import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import type { RouteInput } from './routes.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('color') color?: string,
  ) {
    return this.routesService.findAll(search, color);
  }

  @Get(':number/live')
  live(@Param('number', ParseIntPipe) number: number) {
    return this.routesService.live(number);
  }

  @Get(':number')
  findOne(@Param('number', ParseIntPipe) number: number) {
    return this.routesService.findOne(number);
  }

  // @UseGuards(AdminGuard)
  @Post()
  create(@Body() body: RouteInput) {
    return this.routesService.create(body);
  }

  // @UseGuards(AdminGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<RouteInput>) {
    return this.routesService.update(id, body);
  }

  // @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.routesService.remove(id);
  }

  // @UseGuards(AdminGuard)
  @Post(':id/stops')
  addStop(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; direction: string; order: number; transferRoutes?: number[] },
  ) {
    return this.routesService.addStop(id, body);
  }

  // @UseGuards(AdminGuard)
  @Delete('stops/:stopId')
  removeStop(@Param('stopId', ParseIntPipe) stopId: number) {
    return this.routesService.removeStop(stopId);
  }
}
