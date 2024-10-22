import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  create(@Body() createRecordDto: CreateRecordDto, @CurrentUser() user: User) {
    return this.recordsService.create(createRecordDto, user.id);
  }

  @Patch('update-record-name/:id')
  updateName(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordDto,
    @CurrentUser() user: User,
  ) {
    return this.recordsService.updateName(+id, updateRecordDto.name, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.recordsService.remove(+id, user.id);
  }
}
