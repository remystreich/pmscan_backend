import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post(':pmScanId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a record' })
  @ApiResponse({ status: 200, description: 'Record created' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  create(
    @Body() createRecordDto: CreateRecordDto,
    @Param('pmScanId') pmScanId: string,
  ) {
    return this.recordsService.create(createRecordDto, +pmScanId);
  }

  @Patch('update-record-name/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a record name' })
  @ApiResponse({ status: 200, description: 'Record updated' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this record',
  })
  updateName(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordDto,
    @CurrentUser() user: User,
  ) {
    return this.recordsService.updateName(+id, updateRecordDto.name, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a record' })
  @ApiResponse({ status: 200, description: 'Record deleted' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this record',
  })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.recordsService.remove(+id, user.id);
  }

  @Get(':pmScanId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all records from a pmscan' })
  @ApiResponse({ status: 200, description: 'Records found' })
  @ApiResponse({ status: 404, description: 'No records found' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access these records',
  })
  findAllFromPmScan(
    @Param('pmScanId') pmScanId: string,
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.recordsService.findAllFromPmScan(
      +pmScanId,
      user.id,
      page,
      limit,
    );
  }
}
