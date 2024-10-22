import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PmscanService } from './pmscan.service';
import { CreatePmscanDto } from './dto/create-pmscan.dto';
import { UpdatePmscanDto } from './dto/update-pmscan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('pmscan')
export class PmscanController {
  constructor(private readonly pmscanService: PmscanService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPmscanDto: CreatePmscanDto, @CurrentUser() user: User) {
    return this.pmscanService.create(createPmscanDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllFromUser(@CurrentUser() user: User) {
    return this.pmscanService.findAllFromUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pmscanService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePmscanDto: UpdatePmscanDto,
    @CurrentUser() user: User,
  ) {
    return this.pmscanService.update(+id, updatePmscanDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pmscanService.remove(+id, user.id);
  }
}
