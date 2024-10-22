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

@Controller('pmscan')
export class PmscanController {
  constructor(private readonly pmscanService: PmscanService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPmscanDto: CreatePmscanDto) {
    return this.pmscanService.create(createPmscanDto);
  }

  // @Get()
  // @UseGuards(JwtAuthGuard)
  // findAllFromUser(@Req() req: Request) {
  //   const userId = req.user.userId;
  //   return this.pmscanService.findAllFromUser(userId);
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pmscanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePmscanDto: UpdatePmscanDto) {
    return this.pmscanService.update(+id, updatePmscanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pmscanService.remove(+id);
  }
}
