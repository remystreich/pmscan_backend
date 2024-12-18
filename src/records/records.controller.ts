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
  Req,
  Res,
  HttpException,
  HttpStatus,
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
import * as fs from 'fs';

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
    @CurrentUser() user: User,
  ) {
    return this.recordsService.create(createRecordDto, +pmScanId, user.id);
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
    @Query('date') date?: string,
  ) {
    return this.recordsService.findAllFromPmScan(
      +pmScanId,
      user.id,
      page,
      limit,
      date,
    );
  }

  @Patch('/append-data/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Append data to a record' })
  @ApiResponse({ status: 200, description: 'Data appended' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this record',
  })
  appendData(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordDto,
    @CurrentUser() user: User,
  ) {
    return this.recordsService.appendData(+id, updateRecordDto.data, user.id);
  }

  @Get('/single/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a record by id' })
  @ApiResponse({ status: 200, description: 'Record found' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this record',
  })
  findOne(@Param('id') id: number, @CurrentUser() user: User) {
    return this.recordsService.findOne(id, user.id);
  }

  @Get('/toCSV/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export a record in CSV' })
  @ApiResponse({ status: 200, description: 'CSV created' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this record',
  })
  async toCSV(
    @Param('id') id: number,
    @CurrentUser() user: User,
    @Req() req,
    @Res() res,
  ) {
    try {
      const { filePath, fileName } = await this.recordsService.exportToCsv(
        id,
        req.user.id,
      );

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      // Envoyer le fichier en stream
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Nettoyer le fichier après l'envoi
      fileStream.on('end', () => {
        fs.unlinkSync(filePath);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        "Erreur lors de l'export",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dates/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all dates with records for current user' })
  @ApiResponse({ status: 200, description: 'Dates found' })
  getDistinctDatesForUser(@CurrentUser() user: User) {
    return this.recordsService.getDistinctDatesForUser(user.id);
  }
}
